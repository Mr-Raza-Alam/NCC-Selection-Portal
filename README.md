# NCC Selection Portal (Assam University Silchar)

Welcome to the **NCC Selection Portal**, a comprehensive web application designed to streamline the recruitment and selection process for the National Cadet Corps (NCC) at Assam University Silchar (2026-2027).

This application provides a seamless, secure, and intuitive platform for both **Participants (Students)** to register and take their written tests, and **Admins** to manage candidates, test configurations, and selection results.

---

## 🚀 Features

### For Participants
- **Public Landing Page**: View glimpses of NCC activities and real-time scrolling broadcast banners for important selection schedules.
- **Secure Authentication**: Participant login to access the dashboard.
- **Forgot Password**: A secure, email-free password reset system that verifies student identity using Admission No, Date of Birth, and Contact Number.
- **Interactive Dashboard**: View personal profiles, complete profile information (e.g., adding Parent Contact Number), and jump straight into test instructions.
- **Online Examination Module**: Take the written test seamlessly within the allocated time window.

### For Administrators
- **Test Management**: Configure test durations, toggle results visibility, and set strict Test Window start/end times (locked to IST).
- **Student Management**: View all registered students, their basic details, and test status. Includes the ability for admins to safely edit and correct student profiles (Name, DOB, email, contact details) while securing permanent identifiers.
- **Master Data Table**: A centralized hub to view candidates across multiple rounds of the selection process.
- **Manual Scoring**: Admins can easily enter Round 2 (Written Test) pen & paper scores directly into the portal with instant auto-saving capability.
- **Cascading Deletions**: A secure "Wipe All Records" feature and individual delete actions equipped with a custom-built, modern "Flashbox" confirmation modal (preventing accidental data loss). Deleting a student automatically cleans up all associated test results and master records.

---

## 🛠️ Technology Stack

This application is built using the **MERN** stack:

- **Frontend:** React.js, Vite, React Router DOM, Axios, Custom CSS (Modern Aesthetics, Responsive Design)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ORM)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt
- **Styling:** Vanilla CSS variables and custom components (No heavy UI frameworks)

---

## ⚙️ Local Setup & Installation

Follow these steps to run the application on your local machine:

### 1. Clone the Repository
```bash
git clone https://github.com/Mr-Raza-Alam/NCC-Selection-Portal.git
cd NCC-Selection-Portal
```

### 2. Backend Setup
Navigate to the `backend` directory and install the dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory and add the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
# or
npx nodemon index.js
```

### 3. Frontend Setup
Open a new terminal window, navigate to the `frontend` directory, and install the dependencies:
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

### 4. Access the Application
- **Frontend / Participant Portal:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`

---

## 📱 UI/UX Highlights
- **Custom Modals**: Replaced all native, ugly browser `window.confirm` dialogs with a sleek, centered overlay "Flashbox" to ensure UI consistency.
- **Marquee Broadcasts**: Dynamic scrolling banners on the Landing Page that automatically pull the test schedule from the backend.
- **Mobile Responsive**: Fully responsive Admin Layout with off-canvas hamburger menus for mobile devices, ensuring the profile icon and navigation scale beautifully.

---

## 🛡️ Security & Architecture
- **Timezone Safety**: Dates and Test Windows are carefully managed to strictly adhere to Indian Standard Time (IST) preventing UTC drift.
- **Data Integrity**: Deletion operations employ a sweeping cascading logic across `Student`, `MasterRecord`, `R1Result`, `R2Result`, and `R3Result` collections to prevent orphaned records in the database.

---

*Developed for the NCC Selection Process 2026-2027.*
