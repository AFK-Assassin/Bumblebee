# 🐝 Bumblebee AI

Your personal AI assistant — built with Python, Next.js 14, and PostgreSQL.

```
Backend  ── Python + FastAPI + pgvector
Frontend ── Next.js 14 + TypeScript + Tailwind CSS
Database ── PostgreSQL (with pgvector for semantic search)
AI Brain ── Ollama (local, free, private)
```

---

## Project Structure

```
Bumblebee/
├── backend/                  ← Python FastAPI server
│   ├── main.py               ← App entry point
│   ├── config.py             ← Settings & env vars
│   ├── database.py           ← SQLAlchemy async engine
│   ├── models.py             ← PostgreSQL table definitions
│   ├── schemas.py            ← Pydantic request/response models
│   ├── requirements.txt      ← Python dependencies
│   ├── .env.example          ← Copy to .env and configure
│   ├── routers/
│   │   ├── documents.py      ← Upload, list, delete documents
│   │   ├── chat.py           ← RAG chat + history
│   │   └── search.py         ← Semantic search + status
│   └── services/
│       ├── ollama_client.py  ← Embed & generate via Ollama
│       ├── text_processor.py ← Text chunking
│       └── vector_engine.py  ← Cosine similarity search
├── frontend/                 ← Next.js 14 App
│   └── src/
│       ├── app/              ← Next.js App Router pages
│       ├── components/       ← Chat, Docs, Search, Sidebar UI
│       ├── lib/api.ts        ← Backend API client
│       └── types/index.ts    ← TypeScript types
└── legacy_cpp/               ← Original C++ code (archived)
```

---

## Prerequisites

You need **4 things** installed:

| Tool | Purpose | Download |
|---|---|---|
| **Python 3.11+** | Backend server | python.org |
| **Node.js 18+** | Frontend | nodejs.org |
| **PostgreSQL 16** | Database | postgresql.org |
| **Ollama** | Local AI models | ollama.com |

---

## Step 1 — Install PostgreSQL

1. Download from **https://www.postgresql.org/download/windows/**
2. Run installer, remember your **postgres** user password
3. During install, check the option to install **pgAdmin** (optional but helpful)
4. After install, open **pgAdmin** or **psql** and create the database:

```sql
CREATE DATABASE bumblebee_db;
```

5. Enable the pgvector extension (run inside the bumblebee_db):
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

> If `CREATE EXTENSION vector` fails, install pgvector separately:
> Download from https://github.com/pgvector/pgvector and follow the Windows install guide.

---

## Step 2 — Install Ollama & Pull Models

1. Download from **https://ollama.com/download/windows**
2. Install and let it start in the system tray
3. Open **PowerShell** and pull the two required models:

```powershell
ollama pull nomic-embed-text
ollama pull llama3.2
```

Verify:
```powershell
ollama list
```

---

## Step 3 — Set Up the Backend

```powershell
cd Bumblebee/backend

# Copy the env file and configure it
Copy-Item .env.example .env
```

Edit `.env` and set your PostgreSQL password:
```
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/bumblebee_db
```

Install Python packages:
```powershell
pip install -r requirements.txt
```

Start the backend:
```powershell
python main.py
```

You should see:
```
🐝 Bumblebee AI starting up...
✅ Database tables ready.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Test it in your browser: **http://localhost:8000/docs** (interactive API docs)

---

## Step 4 — Set Up the Frontend

```powershell
cd Bumblebee/frontend
npm install
npm run dev
```

Open your browser: **http://localhost:3000**

---

## Using Bumblebee

### 💬 Chat Tab
- Type any question and press Enter
- Bumblebee answers using its general knowledge + your uploaded documents
- Context chips show which chunks were retrieved

### 📄 Documents Tab
- Paste any text with a title and click **Embed & Store**
- Long texts are auto-split into 250-word overlapping chunks
- Each chunk gets a 768-dimensional vector embedding stored in PostgreSQL
- Delete documents at any time

### 🔍 Search Tab
- Semantic vector search across all uploaded documents
- Results ranked by cosine distance (lower = more relevant)

---

## REST API Reference

Backend runs at **http://localhost:8000**. Interactive docs at **/docs**.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | Health check — Ollama, DB, models |
| `GET` | `/api/documents` | List all documents |
| `POST` | `/api/documents` | Upload + embed a document |
| `DELETE` | `/api/documents/{id}` | Delete a document |
| `POST` | `/api/chat` | Ask Bumblebee (RAG) |
| `GET` | `/api/chat/history` | Retrieve chat history |
| `DELETE` | `/api/chat/history` | Clear chat history |
| `POST` | `/api/search` | Semantic vector search |

---

## Customization Ideas

| What | Where | How |
|---|---|---|
| **Change the AI personality** | `backend/.env` | Edit `SYSTEM_PROMPT` |
| **Switch the LLM model** | `backend/.env` | Change `GEN_MODEL` to `mistral`, `phi4`, etc. |
| **Change Bumblebee's colors** | `frontend/tailwind.config.js` | Edit `bee.*` color variables |
| **Add authentication** | `backend/main.py` | Add FastAPI OAuth2 / JWT middleware |
| **Deploy to production** | Cloud | Use Railway, Render, or VPS |

---

## Tech Stack

- **Backend:** Python 3.11, FastAPI, SQLAlchemy (async), asyncpg, pgvector, httpx, Uvicorn
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Database:** PostgreSQL 16 + pgvector extension
- **AI:** Ollama (`nomic-embed-text` embeddings · `llama3.2` generation)
