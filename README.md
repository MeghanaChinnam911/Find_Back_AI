# FIND-BACK AI
### AI-Powered Missing Persons Discovery, Matching & Intelligence Platform
**Agentic AI Expo Edition 2026**

FIND-BACK AI is a production-style prototype application demonstrating autonomous AI agents, multi-modal vector similarity matching, interactive geospatial risk heatmaps, real-time alert notifications, and human-in-the-loop candidate verification.

---

## 🌟 Key Features

1. **Police Command Center Portal**:
   - Live Command Center dashboard with active case counts, pending match alerts, and resolved stats.
   - Interactive Leaflet map with **Red (High Risk 8+)**, **Orange (Medium)**, and **Green** density risk heatmaps.
   - Animated Recharts analytics for demographic breakdown and regional distributions.
   - Human-in-the-Loop verification modal with side-by-side photo comparison and confidence scoring.

2. **NGO, Shelter & Citizen Portal**:
   - Streamlined intake form for uploading found/unidentified individuals.
   - Enforces required fields (**Photograph, Found Location, Uploader Phone**) while keeping personal details (**Name, Age, Native Location**) strictly optional.
   - Triggers instant post-upload visual vector similarity search against missing-person database.

3. **Autonomous Agentic AI Bar ("Ask FindBack AI")**:
   - Accepts voice input (Web Speech API) and typed natural language queries.
   - Autonomously invokes database search tools, calculates geo risk clusters, updates map filters, and returns natural language explanations.

4. **Multi-Signal Visual & Hybrid Matching Engine**:
   - Computes multi-scale spatial histogram feature embeddings.
   - Evaluates hybrid similarity: **Visual Similarity (0.65) + Age Compatibility (0.15) + Geo Proximity (0.10) + Time Context (0.10)**.

5. **Synthetic Seed Dataset**:
   - Pre-populated with **60 missing cases**, **40 NGO intake records**, and **8 guaranteed matching demo pairs** around Vijayawada & South India regions.

---

## 🔐 Pre-Configured Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Police Officer** | `police@findback.demo` | `Demo@123` |
| **NGO / Shelter Worker** | `ngo@findback.demo` | `Demo@123` |
| **System Admin** | `admin@findback.demo` | `Demo@123` |

---

## 🚀 Quick Setup & Execution

### 1. Backend Setup (FastAPI + Python)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run backend API server
python run.py
```
*API server will run on `http://localhost:8000` and automatically seed the SQLite database.*

### 2. Frontend Setup (Vite + React + Tailwind)
```bash
# Open new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend application will launch on `http://localhost:5173`.*

---

## 🧪 Running Automated Tests
```bash
cd backend
pytest tests/
```

---

## 🛡️ Privacy & Compliance Notice
This application is an Agentic AI Expo prototype utilizing synthetic demo records and generated portrait vectors. All potential candidate matches explicitly require authorized human verification before case resolution.
