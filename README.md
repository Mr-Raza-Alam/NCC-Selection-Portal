# NCC Selection Portal

A web-based selection-management system for **3 Assam Battalion, National Cadet Corps (NCC), Assam University Silchar**. The portal supports the 2026–2027 selection cycle, from candidate registration and assessment through interview, document verification, and merit-list preparation.

The application has two separate workflows: **New Enrollment** for first-year applicants and **Rank Selection** for eligible second-year cadets. Candidate records and selection data for these workflows are maintained separately.

## Selection workflows

### New Enrollment — first-year applicants

The enrollment pipeline uses three rounds, followed by document verification:

| Portal round | Selection stage | How the portal supports it |
| --- | --- | --- |
| **R1** | Physical Test | Configure physical-test activities and marks, record attendance and scores, apply a cutoff, and finalize results. |
| **R2** | Written Test | Record attendance and written-test scores, apply a cutoff, and finalize results. |
| **R3** | Interview | Record attendance and interview scores, then finalize the interview round. |
| **After R3** | Document Verification | Record eligible academic and certificate/sports marks, calculate grand totals, and finalize the merit list. |

Round completion and cutoff decisions are administered through the portal. The written-test score-entry screen supports administrator entry of scores; check the current selection instructions for how the test itself is conducted.

### Rank Selection — second-year cadets

Rank Selection is a separate workflow for second-year cadets and follows the same round labels for different purposes:

| Portal round | Selection stage | How the portal supports it |
| --- | --- | --- |
| **R1** | Physical Test | Record attendance and activity scores, apply a cutoff, and finalize the round. |
| **R2** | Written Assessment | Cadets take a scheduled online test. Administrators can manage its question bank and schedule, monitor entries, and finalize results. This assessment is for learning and is separate from promotion merit. |
| **R3** | Interview | Record attendance and interview scores, including the configured attendance bonus, then finalize results. |

Lead administrators can upload a pre-verified cadet list for registration. Rank-selection administration also supports rank quotas and rank outcomes. The enrollment and rank pipelines use separate candidate and result data.

## Features

### Participant experience

- Public landing page with NCC activity imagery and selection announcements.
- Separate access and registration flows for enrollment applicants and rank-selection cadets.
- Participant dashboards for profile details, announcements, test information, and available assessments.
- Scheduled online written assessment for Rank Selection, with a timed test experience and automatic submission when time expires.
- Rank-assessment review showing questions, submitted answers, correct answers, and results when made available.
- Identity-based password reset for enrollment accounts using admission number, date of birth, and contact number; this flow does not use email.

### Administration

- Separate admin workspaces for New Enrollment and Rank Selection, with a context switcher for authorized administrators.
- Round score and attendance entry, cutoff handling, and round finalization.
- Configurable test settings, including duration, test window, and result visibility.
- Rank assessment question-bank tools for importing questions from CSV and managing questions.
- Candidate and master tables with search, status tracking, and CSV export where available.
- Broadcast messages for the landing page and participant dashboards.
- Document verification and merit-list preparation for New Enrollment.
- Administrative data-reset tools, including CSV backups for supported reset operations. Use destructive reset options with care.

## Technology

- **Frontend:** React, Vite, React Router, Axios, and custom CSS
- **Backend:** Node.js and Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT) and bcryptjs
- **CSV handling:** `csv-parse` and `json2csv`

## Local development

### Prerequisites

- Node.js and npm
- A MongoDB database and connection string

### 1. Clone the repository

```bash
git clone https://github.com/Mr-Raza-Alam/NCC-Selection-Portal.git
cd NCC-Selection-Portal
```

### 2. Configure and run the backend

```bash
cd backend
npm install
```

Create `backend/.env` with your local configuration:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
NODE_ENV=development
```

Start the backend using Nodemon:

```bash
npx nodemon index.js
```

The backend package does not currently define a `dev` script. If Nodemon is not available through the installed dependencies, run it with `npx` as shown above.

### 3. Configure and run the frontend

In a second terminal, from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Vite serves the frontend at `http://localhost:5173` by default. The backend listens at `http://localhost:5000` with the configuration above.

## Notes

- Keep `MONGO_URI` and `JWT_SECRET` private. Do not commit `.env` files or production credentials.
- Dates and test windows are intended to follow Indian Standard Time (IST).
- The README describes intended portal behavior; follow official NCC selection instructions for eligibility, assessment conduct, cutoffs, and final decisions.
- The frontend template documentation remains in [`frontend/README.md`](frontend/README.md).

---

Developed for the NCC Selection Process 2026–2027.
