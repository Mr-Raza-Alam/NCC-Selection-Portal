# NCC Selection Portal - Final System Workflow 

The portal now supports two entirely isolated pipelines: **New Enrollment** (1st Year) and **Rank Selection** (2nd Year). Here is how the application flows from three different perspectives:

## 1. The User's Perspective (Student vs Cadet)

### 1st Year (Student / New Enrollment)
- **Registration**: Any student can go to `/register` and create an account. They are assigned a `Chest Number`.
- **Dashboard (`/dashboard`)**: They see their Chest Number. If they miss R1 or get eliminated, their status turns to "Eliminated". 
- **Goal**: Clear R1 (Physical), R2 (Written), and R3 (Interview) to earn the status **"Selected"**.

### 2nd Year (Cadet / Rank Selection)
- **Registration**: A 2nd-year cadet goes to `/rank-register`. The system **blocks** them unless their Name and Regimental Number perfectly match the CSV that the Admin previously uploaded. Once verified, they set a password.
- **Dashboard (`/rank-dashboard`)**: Instead of a Chest Number, they see their **Buddy Number**. If they are absent for any test, their dashboard turns red and tells them: *"You were Absent. Your current rank remains: Cadet"*.
- **Goal**: Clear R1, R2, R3, and impress the CTO to earn a promotion to **CPL (Corporal)** or **LCPL (Lance Corporal)**. Otherwise, they remain a **Cadet**.

---

## 2. The Admin's Perspective (Lead Admin / CTO / Assistants)

### Context Switching
- When the Admin logs in, they now have a **Context Switcher** at the top of the sidebar.
- Clicking **🛡️ Enrollment** loads the standard R1, R2, R3 and Master Table for 1st-year students.
- Clicking **🎖️ Rank** loads the isolated Rank process for 2nd-year cadets.

### Rank Workflow (Lead Admin & CTO)
1. **Upload Cadets**: The Lead Admin goes to `Rank Process -> Upload Cadets` and uploads the compiled CSV (Name, Regimental No., Dept, Buddy No.). This pre-populates the database so cadets can register.
2. **Conduct Rounds (R1, R2, R3)**: The Assistants score the cadets exactly as they do for 1st years, but they are interacting with the `Rank` tables.
3. **Master Merit Table**: 
   - The CTO views the final Rank Master Table. 
   - Instead of a "Select" checkbox, the CTO uses a **Dropdown Menu** to assign specific ranks: `Cadet` (Default), `Promoted (CPL)`, or `Promoted (LCPL)`.
   - The system enforces a strict quota: **Maximum of 6 total promotions (CPL + LCPL)**.

---

## 3. The System's Perspective (Architecture & Database)

### Process Isolation (The "Parallel Universe")
- The system operates two completely separate database architectures to prevent data bleeding:
  - **Enrollment DB**: `Student`, `R1Result`, `MasterRecord`, `Settings`
  - **Rank DB**: `RankCandidate`, `RankR1Result`, `RankMasterRecord`, `RankSettings`
- **Why?** Because if we mixed them, triggering "R1 Setup" for 1st years would accidentally wipe the R1 scores for 2nd-year cadets. 

### Endpoints & Routing
- The frontend uses `/api/admin/...` for 1st years and `/api/rank-admin/...` for 2nd years.
- The `AdminLayout` dynamically swaps out the `menuItems` based on the active Context Switcher, ensuring the Admin can never accidentally grade a 1st year in the Rank Selection portal.
