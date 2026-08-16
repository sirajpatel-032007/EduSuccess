# EduSuccess — AI-Powered Dropout Prediction Platform

A full-stack platform that uses machine learning to predict student dropout risk and recommend interventions.

## Tech Stack
- **Frontend**: Next.js 16, Tailwind CSS, Lucide React
- **Backend AI API**: Python FastAPI + Uvicorn
- **Database**: SQLite via Prisma ORM
- **SDG Goal**: SDG 4 — Quality Education

## Local Development

### 1. Start the Python AI API
```bash
# Create a virtual environment (first time only)
python -m venv venv

# Activate it
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r api/requirements.txt

# Start the server
uvicorn api.main:app --reload
```

### 2. Setup & Start the Next.js Frontend (in a new terminal)
```bash
# Install dependencies
npm install

# Generate Prisma Client and setup database
npx prisma generate
npx prisma db push
npx prisma db seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Deploy to Render
See the full step-by-step deployment guide in `DEPLOY.md`.
