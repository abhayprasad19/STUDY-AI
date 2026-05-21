# 🎓 StudyAI — AI-Powered Study & Productivity Platform

A full-stack MERN application with LangChain, ChromaDB, and RAG-powered PDF chat. Study smarter with AI summaries, flashcards, quizzes, Pomodoro timer, task management, and analytics.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Authentication | JWT-based register/login with bcrypt hashing |
| 📋 Task Manager | Create, edit, delete, filter, and prioritize tasks |
| 📄 PDF Upload | Upload PDFs/text, extract and chunk text |
| 🤖 AI Summaries | GPT/Gemini summaries + key points + flashcards + quizzes |
| 💬 AI Chat (RAG) | Chat with your uploaded PDFs using vector search |
| ⏱️ Pomodoro Timer | Configurable focus sessions with session logging |
| 📊 Analytics | Weekly charts, focus score, AI productivity insights |
| 🔮 Recommendations | AI-generated personalized study recommendations |

---

## 🛠️ Tech Stack

**Frontend:** React 18 + Vite · Tailwind CSS · Framer Motion · Chart.js · React Router v6

**Backend:** Node.js · Express.js · MongoDB + Mongoose · JWT · Multer

**AI:** OpenAI GPT-4o-mini · Google Gemini 1.5 Flash · LangChain · ChromaDB · RAG Pipeline

**Deployment:** Frontend → Vercel · Backend → Render · Database → MongoDB Atlas

---

## 📁 Project Structure

```
studyai/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/          # Button, Modal, Sidebar, Navbar, Loader
│   │   │   ├── dashboard/   # TaskCard, NoteCard, AIChatBox, SummaryCard, Charts
│   │   │   └── forms/       # LoginForm, RegisterForm, UploadForm
│   │   ├── pages/
│   │   │   ├── auth/        # Login, Register
│   │   │   └── dashboard/   # Dashboard, Tasks, Notes, AIChat, Summaries, Pomodoro, Analytics
│   │   ├── context/         # AuthContext, ThemeContext
│   │   ├── hooks/           # useAuth, useFetch, useChat
│   │   ├── services/        # api, authService, aiService, taskService, analyticsService
│   │   ├── utils/           # formatDate, constants, helperFunctions
│   │   └── routes/          # AppRoutes with ProtectedRoute
│   └── package.json
│
└── server/                  # Node.js + Express backend
    └── src/
        ├── config/          # db, openai, gemini, chroma, multer
        ├── controllers/     # auth, task, notes, ai, analytics
        ├── middleware/      # auth, error, upload
        ├── models/          # User, Task, Note, Summary, Chat, FocusSession
        ├── routes/          # auth, tasks, notes, ai, analytics
        ├── services/
        │   ├── ai/          # summaryService, chatService, embeddingsService,
        │   │                #   recommendationService, productivityInsights
        │   ├── vector/      # chromaStore, vectorSearch
        │   └── pdf/         # pdfParser, textExtractor
        └── utils/           # generateToken, logger, validators
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (free tier works)
- OpenAI API key ([platform.openai.com](https://platform.openai.com))
- Google Gemini API key ([aistudio.google.com](https://aistudio.google.com))
- *(Optional)* ChromaDB running locally for vector search

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/studyai.git
cd studyai

# Install all dependencies at once
npm install          # installs concurrently
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment Variables

**Backend** — edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/studyai
JWT_SECRET=your_super_secret_32_char_minimum_key
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
CLIENT_URL=http://localhost:5173
NODE_ENV=development
CHROMA_URL=http://localhost:8000
```

**Frontend** — edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 3. (Optional) Start ChromaDB

ChromaDB powers the PDF vector search (RAG). If not running, the app falls back gracefully — PDF upload and summaries still work, only the "Chat with PDF" feature requires it.

```bash
# Using Docker (recommended)
docker run -p 8000:8000 chromadb/chroma

# Or using pip
pip install chromadb
chroma run --host localhost --port 8000
```

### 4. Run the App

```bash
# From root — runs both server and client concurrently
npm run dev

# Or run separately:
# Terminal 1:
cd server && npm run dev    # starts on http://localhost:5000

# Terminal 2:
cd client && npm run dev    # starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) and register your account.

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get current user |
| PUT | `/api/auth/profile` | Update profile/preferences |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Get all tasks (filterable) |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/tasks/analytics` | Task analytics |

### Notes / Documents
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/notes/upload` | Upload PDF or text file |
| GET | `/api/notes` | List all notes |
| GET | `/api/notes/:id` | Get note details |
| DELETE | `/api/notes/:id` | Delete note |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/summarize` | Generate summary, flashcards, quiz |
| POST | `/api/ai/chat` | Chat with AI (RAG if noteId provided) |
| GET | `/api/ai/summaries` | Get all summaries |
| GET | `/api/ai/chats` | Get chat history |
| POST | `/api/ai/recommend` | Get AI recommendations |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/dashboard` | Full analytics data |
| POST | `/api/analytics/session` | Log a focus session |
| GET | `/api/analytics/sessions` | Session history |
| GET | `/api/analytics/insights` | AI productivity insights |

---

## 🔮 RAG Pipeline Explained

```
User uploads PDF
      ↓
Text extraction (pdf-parse)
      ↓
Text cleaning + chunking (1000 chars, 200 overlap)
      ↓
OpenAI text-embedding-3-small generates vectors
      ↓
Vectors stored in ChromaDB (per-user collection)
      ↓
User asks a question
      ↓
Question embedded → cosine similarity search → top 5 chunks
      ↓
Chunks injected as context into GPT/Gemini prompt
      ↓
AI answers ONLY from document context
```

---

## ☁️ Deployment

### Frontend → Vercel

```bash
cd client
npm run build
# Or connect GitHub repo to Vercel — it auto-detects Vite
```

Set environment variable in Vercel dashboard:
```
VITE_API_URL=https://your-backend.onrender.com
```

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo, set root directory to `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables from `server/.env`

### Database → MongoDB Atlas

1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user and whitelist `0.0.0.0/0`
3. Copy connection string to `MONGO_URI`

---

## 🔑 Getting API Keys

### OpenAI API Key
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create new secret key
3. Add billing (GPT-4o-mini is ~$0.15/1M input tokens — very cheap)

### Google Gemini API Key
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click "Get API key" → Create API key
3. Free tier available with generous limits

---

## 🧪 Testing the App

1. **Register** a new account
2. **Create tasks** with different priorities
3. **Upload a PDF** (any document works)
4. Wait ~30 seconds for processing, then click **Summarize**
5. Once "Embedded" badge appears, click **Chat** to ask questions
6. Use **Pomodoro timer** for a focus session
7. Visit **Analytics** → click "Get AI Insights"

---

## 🛡️ Security Notes

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens expire after 30 days
- All dashboard routes protected by middleware
- File uploads validated by MIME type
- CORS configured for specific origins only
- MongoDB queries scoped per user (`user: req.user._id`)

---

## 📝 License

MIT — free to use, modify, and deploy.
