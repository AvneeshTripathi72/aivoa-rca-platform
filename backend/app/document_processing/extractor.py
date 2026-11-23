import os
import email
from email import policy
try:
    import pymupdf as fitz
except ImportError:
    import fitz
try:
    import docx
except ImportError:
    docx = None

from backend.app.core.config import settings

class DocumentExtractor:
    """
    Handles secure text extraction from PDFs, DOCX, plain text, and emails.
    Normalizes whitespace and preserves structural clues for LLM analysis.
    """

    @staticmethod
    def validate_file(filename: str, file_size: int) -> bool:
        ext = os.path.splitext(filename)[1].lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise ValueError(f"Unsupported file format '{ext}'. Allowed formats: {', '.join(settings.ALLOWED_EXTENSIONS)}")
        
        max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
        if file_size > max_bytes:
            raise ValueError(f"File size exceeds limit of {settings.MAX_FILE_SIZE_MB}MB.")
        
        return True

    @staticmethod
    def extract_from_pdf(file_path: str) -> str:
        """Extracts text from PDF preserving page boundaries."""
        text_blocks = []
        try:
            doc = fitz.open(file_path)
            for page_idx, page in enumerate(doc):
                page_text = page.get_text("text").strip()
                if page_text:
                    text_blocks.append(f"--- [PAGE {page_idx + 1}] ---\n{page_text}")
            doc.close()
        except Exception as e:
            raise RuntimeError(f"Error parsing PDF document: {str(e)}")
        
        return "\n\n".join(text_blocks)

    @staticmethod
    def extract_from_docx(file_path: str) -> str:
        """Extracts text from Word documents."""
        if docx is None:
            raise RuntimeError("python-docx is not installed.")
        try:
            doc = docx.Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            for table in doc.tables:
                for row in table.rows:
                    row_data = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                    if row_data:
                        paragraphs.append(" | ".join(row_data))
            return "\n".join(paragraphs)
        except Exception as e:
            raise RuntimeError(f"Error parsing DOCX document: {str(e)}")

    @staticmethod
    def extract_from_email(raw_content: str) -> dict:
        """
        Parses email message strings into structured metadata and body.
        """
        try:
            msg = email.message_from_string(raw_content, policy=policy.default)
            subject = msg.get("Subject", "No Subject")
            sender = msg.get("From", "Unknown Sender")
            date_str = msg.get("Date", "Unknown Date")
            body = msg.get_body(preferencelist=('plain', 'html'))
            body_text = body.get_content() if body else raw_content
            
            structured = f"--- EMAIL INTAKE METADATA ---\n" \
                         f"Sender: {sender}\n" \
                         f"Subject: {subject}\n" \
                         f"Date: {date_str}\n\n" \
                         f"--- EMAIL BODY ---\n" \
                         f"{body_text}"
            return {
                "subject": subject,
                "sender": sender,
                "date": date_str,
                "text": structured
            }
        except Exception:
            return {
                "subject": "Parsed Email",
                "sender": "Unknown",
                "date": None,
                "text": raw_content
            }

    @classmethod
    def extract_text(cls, file_path: str, file_type: str = None) -> str:
        if not file_type:
            file_type = os.path.splitext(file_path)[1].lower()
        
        file_type = file_type.lstrip(".").lower()

        if file_type == "pdf":
            return cls.extract_from_pdf(file_path)
        elif file_type in ["docx", "doc"]:
            return cls.extract_from_docx(file_path)
        elif file_type in ["txt", "log", "csv"]:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        elif file_type in ["eml", "email"]:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                parsed = cls.extract_from_email(f.read())
                return parsed["text"]
        else:
            raise ValueError(f"Unsupported file format: {file_type}")
