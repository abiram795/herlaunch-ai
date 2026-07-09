# HERLaunch AI – Virtual Startup Incubator for Women

HERLaunch AI is a modern, production-ready virtual startup incubator that empowers women entrepreneurs to transform business ideas into investment-ready startups. 

This repository features an Express backend powered by **Google Gemini API** and a Vite + React frontend styled in Vanilla CSS, featuring premium glassmorphic cards, active theme toggling, interactive AI panels, Chart.js financial projections, and vector jsPDF slide deck exports.

---

## Technical Features

1.  **User Authentication**: Firebase Google Sign-In with instant cloud integration, fallbacking into a Local Sandbox (using `localStorage` auth + db) if Firebase keys are not provided.
2.  **Startup Idea Generator**: Analyzes startup parameters (Idea, industry, audience, target country, budget range) to generate a SWOT analysis, Value Proposition, and Business Model canvas.
3.  **Market Intelligence Engine**: Estimates market sizing (TAM, SAM, SOM), creates competitor analysis grids, and maps buyer persona profiles.
4.  **AI Startup Readiness Score**: Calculates overall venture scores out of 100 on scalability, innovation, demand, and details an action checklist to improve.
5.  **Financial Forecast Dashboard**: Computes estimates for startup costs and monthly expenses. Displays revenue projections using **Chart.js** line and bar graphs.
6.  **AI Shark Tank Simulator (Flagship)**: Features interactive chat timelines with three character agents: Investor AI (Sarah), Customer AI (Maya), and Mentor AI (Elena), generating a VC evaluation card.
7.  **AI Co-Founder Mode**: A digital co-founder to brainstorm strategies, brainstorm growth hacks, and answer operational questions.
8.  **Funding Navigator**: Local grant database with an AI-search fallback querying programs, grants, and incubators for women entrepreneurs.
9.  **Pitch Deck Generator**: Structured investor slides supporting vector-based **PDF downloads**.

---

## Project Structure

```
├── backend/
│   ├── routes/
│   │   └── gemini.js         # Express routes calling Google Gemini models
│   ├── .env                  # Port and Gemini API Key configuration
│   ├── .env.example
│   ├── index.js              # Server entry point (Port 5000)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, Protected Route, and Custom Loader
│   │   ├── context/          # Theme context (Light/Dark mode)
│   │   ├── pages/            # Landing page, Dashboard, Workspace, Shark Tank, CoFounder, Navigator
│   │   ├── App.jsx           # App layout and route configurations
│   │   ├── firebase.js       # Firebase cloud initialization & local sandbox fallbacks
│   │   ├── index.css         # Custom stylesheet (Glassmorphic variables, animations)
│   │   └── main.jsx
│   ├── vercel.json           # Vercel single-page router redirect configuration
│   ├── index.html
│   ├── .env                  # Firebase web configurations & API Urls
│   ├── .env.example
│   └── package.json
│
├── firestore.rules           # Security rules for Firestore collections
└── README.md
```

---

## Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) installed.

### 1. Configure the Backend
1.  Navigate to the `backend/` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Edit the `.env` file and insert your Google Gemini API Key:
    ```env
    PORT=5000
    GEMINI_API_KEY=your_google_gemini_api_key_here
    GEMINI_MODEL=gemini-1.5-flash
    ```
4.  Start the backend server:
    ```bash
    npm start
    ```
    The server will boot on `http://localhost:5000`.

### 2. Configure the Frontend
1.  Open a new terminal window and navigate to the `frontend/` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create/edit your local `.env` file:
    ```env
    VITE_FIREBASE_API_KEY=your_firebase_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    VITE_BACKEND_URL=http://localhost:5000
    ```
    *(Note: If the Firebase variables are left empty, the application will automatically activate the **Offline Sandbox Mode**, allowing you to test all auth, db saving, and workspace features instantly using browser storage!)*
4.  Launch the React development server:
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` to explore HERLaunch AI.

---

## Deployment Guidelines

### Frontend (Vercel)
Vercel automatically recognizes Vite applications. 
1.  Link your Github repository to [Vercel](https://vercel.com).
2.  Configure Environment Variables (`VITE_FIREBASE_API_KEY`, etc. and set `VITE_BACKEND_URL` pointing to your deployed backend URL).
3.  Deploy. Vercel will build using the `vercel.json` file to support URL routing.

### Backend (Render / Heroku)
1.  Deploy the `backend` subfolder as a Web Service.
2.  Add Environment Variables on Render's dashboard:
    *   `GEMINI_API_KEY` (Your Google Gemini Key)
    *   `PORT` (usually set by Render automatically)
3.  Update the frontend `VITE_BACKEND_URL` to point to the newly deployed Render API domain.
