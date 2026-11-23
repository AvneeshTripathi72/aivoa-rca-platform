# AIVOA.AI — Project Submission & Evaluation Dossier
## AI-Powered Root Cause Analysis (RCA) Module & Copilot for Pharmaceutical Manufacturing

---

### 1. Essential Links & Project Metadata

| Attribute | Details / Link |
|---|---|
| **Live Deployed Application** | [https://aivoa-rca-platform.vercel.app](https://aivoa-rca-platform.vercel.app) |
| **GitHub Repository** | [https://github.com/AvneeshTripathi72/aivoa-rca-platform](https://github.com/AvneeshTripathi72/aivoa-rca-platform) |
| **Video Demonstration** | [Watch on Google Drive](https://drive.google.com/file/d/1av2lzDPx8YMSzTrIz7w51HTRWBz3_5Nj/view) |
| **Developer / Candidate** | Avneesh Tripathi ([GitHub](https://github.com/AvneeshTripathi72)) |
| **Institution** | [KIET Group of Institutions](https://www.kiet.edu/) |
| **Regulatory Framework** | ICH Q7 (API GMP), ICH Q9 (Risk Mgmt), ICH Q10 (QMS), 21 CFR Part 11, ALCOA+ |

---

### 2. Project Overview & Video Demonstration Alignment

This platform was built to satisfy the **AIVOA Senior AI Product Engineer / Full-Stack Challenge** and replicates the exact split-screen workflow demonstrated in the reference video (`AIVOA- complaints module demo.mp4`).

#### Core Product Philosophy
> **"AI investigates and recommends. Qualified Quality Professionals review, validate, edit, and approve."**
> Every AI finding is strictly categorized as a `Hypothesis` or `Evidence-Supported`. No AI output is ever presented as a scientifically confirmed fact without formal human validation.

---

### 3. Key Features & Workflow Architecture

#### A. AIVOA Copilot & Synchronized Split-Screen Triage (`/investigations/new`)
- **Left Panel:** 4-Section QMS Incident Intake Ledger:
  1. *Origin & Customer / Incident Details* (Source, Customer, Contact)
  2. *Product & Batch Identification* (Product Name, Dosage Form, Strength, Batch No, Affected Qty, Mfg & Expiry Dates)
  3. *Facility & Material Impact* (Site & Block, Impacted NPM, Equipment ID)
  4. *Defect / Excursion Analysis* (Defect Category, Incident Headline, Technical Description, Containment Action)
- **Visual Feedback:** Unpopulated fields show an italicized `"Awaiting AI extraction..."` placeholder with a red ban icon (`⊘`) that transforms into an editable input on focus or extraction.
- **AI Copilot Risk Assessment Card:** Real-time risk evaluation displaying Severity (Critical / Major / Minor), Defect Nature & Vector, Regulatory Framework, and Risk Justification.
- **Three Core Copilot Tools:**
  1. `Log Complaint / Incident Tool`: Parses raw unstructured text into structured fields.
  2. `Edit Complaint / Refine Tool`: Conversational correction (e.g. *"ah sorry the batch number is BMX240602 and affected quantity is 48 capsules"*) that updates targeted fields while preserving all existing data.
  3. `Document Extraction Tool`: Ingests PDF/DOCX investigation reports and synchronizes metadata with the ledger.
- **QMS Commit Action:** Commits verified data into the ledger and transitions directly into the full RCA dossier.

#### B. Deep Root Cause Analysis Hub (`/investigations/:id`)
- **Interactive 5 Whys Analysis:** Step-by-step causal chain with confidence scores and human validation gates.
- **6M Ishikawa Fishbone Analysis:** Structured causal categorization across Machine, Method, Material, Measurement, Man, and Environment.
- **Evidence Registry:** Categorized laboratory results, SCADA logs, and SOP references with traceability links.
- **CAPA Action Matrix:** Corrective & Preventive action lifecycle management with owner assignment, due dates, and verification criteria.
- **Executive Sign-Off & ALCOA+ Audit Trail:** Immutable activity logging for regulatory audit readiness.

#### C. Enterprise Quality Dashboard (`/`)
- Dynamic KPIs: Total Investigations, Open, Under Review, Completed, High-Risk Excursions, Pending CAPAs.
- Lifecycle distribution and ICH Q9 Risk Severity breakdown charts.

---

### 4. Technology Stack

- **Frontend:** React 18.3, Redux Toolkit, React Router 6, Tailwind CSS, Lucide Icons, Recharts, Axios.
- **Backend:** Python FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, SQLite / PostgreSQL.
- **AI Engine:** LangGraph 10-node stateful workflow, Groq LLM API (`openai/gpt-oss-120b` / `openai/gpt-oss-20b`).
- **Resilience:** Built-in client-side offline fallback engine (`dummyDataService.js`) ensuring zero downtime and zero crashes under any network or deployment condition.
- **Cloud Deployment:** Vercel edge hosting + Serverless Python function (`vercel.json`, `api/index.py`).

---

### 5. How to Test the Live Application

1. Open [https://aivoa-rca-platform.vercel.app](https://aivoa-rca-platform.vercel.app).
2. Click **"New Investigation"** in the top navigation or sidebar.
3. Test the Copilot by clicking the **"Apollo Pharmacy Complaint"** scenario pill, or type:
   > *"Log a customer complaint from Apollo Pharmacy regarding Atorvastatin Calcium 20mg, batch number ATC-2026-088. Customer reports tablet discoloration and specking in blister packs. 120 blister packs affected."*
4. Watch the form auto-populate on the left and the **AI Copilot Risk Assessment** card generate.
5. Test conversational refinement by typing:
   > *"ah sorry the batch number is BMX240602 and the affected quantity is 48 capsules"*
6. Notice the batch number and affected quantity update dynamically while preserving other fields.
7. Click **"Commit to QMS Ledger & Launch RCA"** to transition into the complete 5 Whys, 6M Fishbone, Evidence Registry, and CAPA Matrix dossier!

---

### 6. Institutional Affiliation & Contact

- **Institution:** [KIET Group of Institutions](https://www.kiet.edu/)
- **Author:** Avneesh Tripathi
- **Email:** avanishtripathiavanish79921170@gmail.com
- **GitHub:** [https://github.com/AvneeshTripathi72](https://github.com/AvneeshTripathi72)
