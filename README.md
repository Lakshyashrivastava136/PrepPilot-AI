# 🚀 PrepPilot AI

**AI-powered interview preparation platform.** Upload your resume, paste a job description, and get a personalised interview plan, practise with an AI mock interviewer, check your ATS score and track your progress.

🔗 **Live Demo:** https://interview-ai-yt-amber.vercel.app

> ⏳ The backend runs on a free Render instance. The first request after inactivity can take ~50 seconds to wake up.

---

## ✨ Features

- 🔐 **Authentication:** register / login / logout with JWT in httpOnly cookies and a token blacklist
- 📋 **AI Interview Report:** from your resume (PDF) or a short self-description plus a job description, get a match score, technical and behavioural questions with model answers, skill gaps and a day-wise preparation roadmap
- 🎤 **AI Mock Interview:** answer questions one by one and get a 0-10 score, feedback and an improved answer for each, plus an overall score
- 📊 **Progress Dashboard:** score trend, average and best score, technical vs behavioural performance (MongoDB aggregation)
- 📄 **ATS Resume Analyzer:** ATS score, matched and missing keywords, section checks and prioritised improvements
- 🛡️ **Production hardening:** Helmet, rate limiting (global, auth and AI-specific), input validation, ownership checks, secure cookies
- 🔁 **Resilient AI calls:** automatic retry plus fallback model when the AI provider is overloaded

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router, SCSS, Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas, Mongoose |
| AI | Google Gemini API with structured JSON output (Zod schemas) |
| Other | Multer, pdf-parse, Puppeteer, JWT, bcrypt, Helmet, express-rate-limit |
| Hosting | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

## 🏗️ Architecture

```
React (Vercel)  ──HTTPS + cookies──▶  Express API (Render)  ──▶  MongoDB Atlas
                                            │
                                            └──▶  Gemini API (retry + fallback model)
```

```
Backend/src
├── config/        database connection
├── controllers/   auth, interview, mock, analytics, ats
├── middlewares/   auth, file upload, rate limiting
├── models/        user, interviewReport, mockInterview, blacklist
├── routes/        route definitions
└── services/      AI service (Gemini calls, retry logic)

Frontend/src/features
├── auth/          login, register, protected routes
├── interview/     report generation and report view
├── mock/          AI mock interview
├── analytics/     progress dashboard
└── ats/           ATS resume analyzer
```

## 🔌 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/logout` | Logout |
| GET | `/api/auth/get-me` | Current user |
| POST | `/api/interview` | Generate interview report |
| GET | `/api/interview` | List my reports |
| GET | `/api/interview/report/:id` | Get one report |
| POST | `/api/interview/resume/pdf/:id` | Generate tailored resume PDF |
| POST | `/api/mock/start` | Start a mock interview |
| POST | `/api/mock/:id/answer` | Submit an answer and get AI feedback |
| GET | `/api/mock/:id` | Get a mock interview |
| GET | `/api/analytics` | Progress analytics |
| POST | `/api/ats` | ATS resume analysis |
| GET | `/api/health` | Health check |

## ⚙️ Run Locally

```bash
git clone https://github.com/Lakshyashrivastava136/PrepPilot-AI.git
cd PrepPilot-AI
```

**Backend**

```bash
cd Backend
npm install
cp .env.example .env   # then fill in the values
npm run dev
```

Environment variables (`Backend/.env`):

```
PORT=3000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_string
GOOGLE_GENAI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

**Frontend**

```bash
cd Frontend
npm install
npm run dev
```

Optional: set `VITE_API_URL` to point the frontend at a different backend (defaults to `http://localhost:3000`).

## 🗺️ Roadmap

- [ ] Automated tests (Jest + Supertest) and CI with GitHub Actions
- [ ] Docker setup
- [ ] DOCX resume support
- [ ] Voice answers in mock interviews

## 👤 Author

**Lakshya Shrivastava**

- GitHub: [@Lakshyashrivastava136](https://github.com/Lakshyashrivastava136)
- LinkedIn: [lakshyashrivastava123](https://www.linkedin.com/in/lakshyashrivastava123)