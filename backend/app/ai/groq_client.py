import json
import logging
from typing import Dict, Any, Optional
from groq import Groq
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

class GroqClientService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.fallback_model = settings.GROQ_FALLBACK_MODEL
        self._client: Optional[Groq] = None
        
        if self.api_key and self.api_key.strip():
            try:
                self._client = Groq(api_key=self.api_key.strip())
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {e}")
                self._client = None

    @property
    def is_configured(self) -> bool:
        return self._client is not None and bool(self.api_key)

    def generate_chat_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        json_mode: bool = True,
        temperature: float = 0.1
    ) -> Dict[str, Any]:
        """
        Executes inference via Groq. If unconfigured or API call fails,
        returns an explicitly labeled response indicating Groq status.
        """
        if not self.is_configured:
            logger.warning("Groq API key not configured. Returning explicitly labeled demo fallback.")
            return {
                "success": False,
                "error": "GROQ_API_KEY_NOT_CONFIGURED",
                "message": "Groq API key is not configured. Running in labelled offline fallback mode.",
                "is_synthetic_mode": True,
                "model_configured": self.model
            }

        try:
            response_format = {"type": "json_object"} if json_mode else None
            chat_completion = self._client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model=self.model,
                temperature=temperature,
                response_format=response_format
            )
            raw_content = chat_completion.choices[0].message.content
            if json_mode:
                parsed = json.loads(raw_content)
                return {
                    "success": True,
                    "data": parsed,
                    "model": self.model,
                    "is_synthetic_mode": False
                }
            return {
                "success": True,
                "data": raw_content,
                "model": self.model,
                "is_synthetic_mode": False
            }
        except Exception as e:
            logger.error(f"Groq API call failed: {e}. Attempting fallback model...")
            try:
                # Try fallback model
                chat_completion = self._client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    model=self.fallback_model,
                    temperature=temperature,
                    response_format=response_format
                )
                raw_content = chat_completion.choices[0].message.content
                parsed = json.loads(raw_content) if json_mode else raw_content
                return {
                    "success": True,
                    "data": parsed,
                    "model": self.fallback_model,
                    "is_synthetic_mode": False
                }
            except Exception as e2:
                logger.error(f"Groq fallback model also failed: {e2}")
                return {
                    "success": False,
                    "error": str(e2),
                    "is_synthetic_mode": True,
                    "message": f"Groq inference failed: {str(e2)}. Switched to labeled domain demo engine."
                }

groq_service = GroqClientService()
