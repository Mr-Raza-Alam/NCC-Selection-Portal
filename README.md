# NCC Selection Portal

A web-based selection-management system for **3 Assam Battalion, National Cadet Corps (NCC), Assam University Silchar**. The portal supports the 2026–2027 cycle and provides separate workflows for **New Enrollment** (first-year applicants) and **Rank Selection** (second-year cadets).

## Selection workflows

### New Enrollment — first-year applicants

The enrollment selection process has three rounds, followed by document verification:

| Round | Stage | Portal support |
| --- | --- | --- |
| **R1** | Physical Test | Configure physical-test activities, record attendance and scores, apply a cutoff, and finalize results. |
| **R2** | Written Test | Schedule and administer the online test, record attendance and scores, apply a cutoff, and finalize results. |
| **R3** | Interview | Record attendance and interview scores, then finalize results. |
| **After R3** | Document Verification | Record eligible academic and certificate/sports marks, calculate totals, and prepare the merit list. |

### Rank Selection — second-year cadets

The **promotion-selection process has two stages**:

1. **R1 — Physical Test:** administrators configure activities, record attendance and scores, apply a cutoff, and finalize results.
2. **R2 — Interview:** administrators record interview attendance and scores and manage promotion outcomes and quotas.

A separate **Regular Written Assessment / Knowledge Hub** is available to rank-selection cadets for learning. It is not a promotion-selection stage and its score is not included in the promotion merit total. In the current implementation, this assessment uses the internal R2 identifiers, while the promotion interview still uses internal R3 identifiers (for example, `RankR3Result` and `/rank-admin/r3`). The labels above describe the intended business-facing promotion flow; the internal identifiers have not been renamed in code.

Lead administrators can upload a pre-verified cadet list for rank registration. Candidate and result data for Rank Selection and New Enrollment are stored separately.

## Features

### Participants

- Public landing page with NCC activity imagery and selection announcements.
- Separate registration and login experiences for enrollment applicants and rank-selection cadets.
- Dashboards for profile details, announcements, test information, and available assessments.
- Timed online tests with automatic submission when the timer expires.
- Rank-assessment result review showing questions, submitted answers, correct answers, and scores when results are available.
- Enrollment password reset through identity checks using admission number, date of birth, and contact number; no email reset is used.

### Administrators

- Separate admin workspaces for enrollment and rank selection, with a context switcher for authorized administrators.
- Round activity setup, score and attendance entry, cutoff handling, and result finalization.
- Written-test configuration, including duration, test windows, and result visibility.
- Question-bank management and CSV import tools.
- Candidate and master tables with search, status tracking, and CSV export where available.
- Broadcast messages for the landing page and participant dashboards.
- Enrollment document verification and merit-list preparation.
- Administrative data-reset tools. Destructive operations should be used with care; supported full-reset flows create CSV backups.

## Technology

- **Frontend:** React 19, Vite, React Router, Axios, and custom CSS
- **Backend:** Node.js and Express 5
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT) and bcryptjs
- **CSV handling:** `csv-parse` and `json2csv`

## Repository architecture

The project separates the browser application (`frontend/`) from the API and database layer (`backend/`). Within each, files are grouped by their responsibility so reviewers can follow a request from a screen to an API endpoint, controller, and schema.

```text
.
├── backend/
│   ├── index.js                 Express app entry point; connects middleware and API routes
│   ├── config/db.js             MongoDB connection setup
│   ├── routes/                  HTTP endpoints, request-to-controller mapping, route guards
│   ├── controllers/             Authentication, participant, test, and admin business logic
│   ├── middleware/              JWT role checks for participants, rank candidates, and admins
│   ├── models/                  Mongoose schemas for identities, settings, tests, and results
│   ├── data/                    JSON source data for the enrollment question-bank reset/import
│   ├── importQuestions.js       Utility to import question data
│   └── vercel.json              Backend deployment/build routing configuration
├── frontend/
│   ├── index.html               Browser document and frontend mount point
│   ├── vite.config.js            Vite configuration
│   └── src/
│       ├── main.jsx              React entry point and global styles
│       ├── App.jsx               Client routes and participant/admin route protection
│       ├── components/           Shared navigation, admin layout, banners, and loaders
│       ├── pages/
│       │   ├── participant/      Landing, enrollment, and rank-candidate screens
│       │   └── admin/            Enrollment, rank, and shared admin screens
│       ├── styles/               Feature-specific stylesheets
│       └── utils/api.js           Axios API client and auth-token selection
├── clone.js                     Code-generation helper for rank admin controller (not runtime)
├── clone_routes.js              Code-generation helper for rank routes (not runtime)
└── clone_ui.js                  Code-generation helper for rank UI pages (not runtime)
```

### Request flow

`frontend/src/App.jsx` maps browser URLs to participant and admin pages. Screens make API calls through `frontend/src/utils/api.js`, which selects the stored token for the relevant user type. In the backend, `index.js` mounts route modules; routes apply authentication middleware and call controller functions; controllers perform workflow logic and read or update Mongoose models.

## Data model overview

MongoDB documents are defined by the Mongoose schemas in `backend/models/`. References use MongoDB `ObjectId` fields; the result and master-record models refer back to the appropriate applicant or cadet.

| Area | Main models | Purpose and relationship |
| --- | --- | --- |
| Enrollment identity | `Student` | Applicant profile, credentials, chest code, and enrollment status. |
| Enrollment round results | `R1Result`, `R2Result`, `R3Result` | Physical-test activity scores, written-test attendance/answers/score/timing, and interview attendance/score. Each links to `Student`. |
| Enrollment master record | `MasterRecord` | Consolidated R1–R3 scores, document-verification marks, total, and selection status; links to `Student`. |
| Rank identity | `RankCandidate` | Pre-verified cadet identity, registration details, and promotion status. |
| Rank promotion results | `RankR1Result`, `RankR3Result` | Physical-test activity scores and interview attendance/score; each links to `RankCandidate`. `RankR3Result` is the current internal model for the business-facing R2 interview stage. |
| Rank assessment | `RankR2Result` | Standalone written-assessment attendance, answers, score, timing, draft answers, and completion state; links to `RankCandidate`. Its score is separate from promotion merit. |
| Rank master record | `RankMasterRecord` | Consolidated promotion scores, attendance bonus, total, and rank outcome; links to `RankCandidate`. The assessment score is not part of this promotion total. |
| Activities and questions | `R1Activity`, `RankR1Activity`, `Question` | Configurable physical-test activities and questions, with `Question.testType` distinguishing enrollment from rank assessment. |
| Workflow configuration | `Settings`, `RankSettings`, `TestConfig` | Round states, cutoffs, broadcasts, test settings, and enrollment/rank test windows. |
| Administration and audit | `Admin`, `AuditLog` | Admin credentials/roles/feature grants and recorded admin actions. |

The enrollment and rank flows intentionally have separate candidate, result, master-record, and workflow-setting models. `Question` and `Admin` are shared models. For exact fields and validation rules, see the corresponding schema files in `backend/models/`.

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

Create `backend/.env` with local values:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
NODE_ENV=development
```

Start the backend with Nodemon:

```bash
npx nodemon index.js
```

The backend `package.json` does not currently define a `dev` script. The command above uses the declared Nodemon development dependency.

### 3. Run the frontend

In a second terminal, from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Vite serves the frontend at `http://localhost:5173` by default. With the example configuration, the backend listens at `http://localhost:5000`.

## Security and operational notes

- Keep `MONGO_URI` and `JWT_SECRET` private. Do not commit `.env` files, database credentials, or production secrets.
- The question-import utility should use `MONGO_URI` from the environment, not a credential embedded in source code. Rotate any database credential that has previously been committed.
- The code-generation scripts at the repository root modify application files; they are not part of normal application startup. Review their behavior before running them.
- Dates and test windows are intended to follow Indian Standard Time (IST).
- The README documents software behavior, not official selection policy. Follow current NCC instructions for eligibility, assessment conduct, cutoffs, and final decisions.
- The Vite template's original notes remain in [`frontend/README.md`](frontend/README.md).

---

Developed for the NCC Selection Process 2026–2027.
