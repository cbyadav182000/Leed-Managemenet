# Automated Lead Management & Email Tracking System

A full-stack, enterprise-grade Lead Management System built with **Next.js 15**, **FastAPI**, and **MongoDB**. It automatically captures leads, sends personalized welcome emails (via Resend), tracks email opens & link clicks, and intelligently classifies leads using **Google Gemini AI**.

---

## 🌟 Key Features

1. **Modern Lead Capture Form**: Fully responsive, validated (Zod + React Hook Form), and animated (Framer Motion).
2. **Automated Personalized Emails**: Sends HTML welcome emails using Jinja2 templates via the Resend API.
3. **Tracking Pixel Engine**: Invisible 1x1 GIF tracking pixel to record when a lead opens the email.
4. **Link Click Tracking**: Redirect endpoint that records a click before forwarding the lead to a destination URL.
5. **AI Classification**: Google Gemini integration automatically analyzes the lead's requirement and assigns a `Category` (e.g., AI Automation, Web Development) and a `Priority` (High, Medium, Low).
6. **Real-Time Dashboard**:
   - Aggregated KPIs (Total Leads, Emails Sent, Open Rate, Click Rate).
   - Interactive charts (Recharts) for daily trends.
   - Data table with sorting, search, filtering, and pagination.
7. **CSV Export**: Instantly export the entire lead directory.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion
- **State/Fetching**: TanStack Query (React Query), Axios
- **Form/Validation**: React Hook Form, Zod

### Backend
- **Framework**: FastAPI (Python 3.12+)
- **Database**: MongoDB (Motor Async Driver)
- **Validation**: Pydantic v2
- **Email**: Resend API, Jinja2
- **AI**: Google Generative AI (Gemini 1.5 Flash)
- **Security/Perf**: SlowAPI (Rate Limiting), Background Tasks

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Python 3.12+
- MongoDB instance (Local or Atlas)
- Resend API Key (get one at [resend.com](https://resend.com))
- Gemini API Key (get one at [aistudio.google.com](https://aistudio.google.com))

### 1. Database Setup
If you have Docker, you can spin up a local MongoDB instance using the provided compose file:
```bash
docker-compose up -d
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, Resend API key, and Gemini API key

# Run the server
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Set up environment variables
cp .env.local.example .env.local

# Run the dev server
npm run dev
```

### 4. Access the App
- **Lead Form**: `http://localhost:3000/lead`
- **Dashboard**: `http://localhost:3000/dashboard`
- **Backend API Docs**: `https://leed-managemenet-1.onrender.com/docs`

---

## 🌐 Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `DATABASE_NAME` | Name of the database (e.g., `leadmanagement`) |
| `RESEND_API_KEY` | Your Resend API Key |
| `FROM_EMAIL` | Sender email (use `onboarding@resend.dev` for testing) |
| `API_BASE_URL` | Public URL for the backend (used for tracking pixels) |
| `CLICK_REDIRECT_URL` | Where users go after clicking the email CTA |
| `GEMINI_API_KEY` | Optional: Google Gemini API key for AI classification |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL of the FastAPI backend (e.g., `https://leed-managemenet-1.onrender.com`) |

---

## 🏗 Architecture Details

### Email Tracking Workflow
1. User submits form → Backend creates record & triggers background task.
2. Background task renders Jinja2 template. The template injects an image tag:
   `<img src="http://API_URL/api/open/UNIQUE_TOKEN" />`
3. When the user opens the email, their email client fetches the image.
4. The `GET /api/open/{token}` endpoint receives the request, updates MongoDB `email_opened=True`, and returns a transparent 1x1 GIF.

### AI Classification Workflow
1. User goes to Dashboard and clicks "Run AI Analysis".
2. Backend fetches all leads where `ai_category=null`.
3. Backend sends the lead requirements to Gemini via a structured prompt asking for JSON.
4. Gemini classifies the lead (e.g., `Category: Mobile App`, `Priority: High`).
5. Backend updates the records in MongoDB.
6. Frontend invalidates the cache and table auto-refreshes.

---

## 🔐 Production Deployment Notes

To deploy to production (Vercel for frontend, Render/Railway for backend):

1. **API_BASE_URL**: Update the backend `API_BASE_URL` to your production URL. If this is left as `localhost`, email tracking will not work for end-users on their devices.
2. **MongoDB Atlas**: Update `MONGO_URI` to point to a managed Atlas cluster. Ensure network access is configured to allow your backend IP.
3. **Resend Domain**: You must verify your sender domain in Resend to send emails to addresses other than your own. Update `FROM_EMAIL` to match your verified domain.
