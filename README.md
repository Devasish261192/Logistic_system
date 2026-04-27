# LogiTrack ERP - Logistics Management System

LogiTrack is a precision-engineered ERP system designed for logistics companies to manage consignments, users, and operational costs with technical accuracy. It is built for the **Antigravity** environment, emphasizing an information-dense, monospace-heavy UI (Precision Architect theme).

## 🚀 Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS (Utility-first, structured with custom theme variables)
- **Animations**: Framer Motion (motion/react)
- **Icons**: Lucide React
- **Backend**: Node.js with Express
- **Database**: SQLite (via `better-sqlite3`) for local development and testing
- **Tooling**: TypeScript, `tsx` for high-speed development

## 📂 Project Structure

```text
/
├── server.ts              # Express API server & SQLite database initialization
├── logistics.db           # SQLite database file (generated on first run)
├── src/
│   ├── App.tsx            # Root React component (Main application logic)
│   ├── types.ts           # Global TypeScript interfaces for models
│   ├── index.css          # Tailwind configuration & "Precision Architect" theme
│   └── main.tsx           # Entry point
├── metadata.json          # App permissions and configuration
└── package.json           # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Devasish261192/Logistic_system.git
   cd Logistic_system
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` (if applicable) and configure as needed.

### Running the Application Locally
1. Start the development server and backend concurrently:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to the URL provided in your terminal (typically `http://localhost:5173` or similar).

## 📖 How to Use LogiTrack ERP

### 1. Initial Login
Use the provided test credentials (at the bottom of this page) to log in based on the role you want to test.
- **Super Admin:** Dashboard analytics, user creation, and full read access.
- **Supervisor:** Consignment creation, assigning drivers, and logging attendance.
- **Driver:** Mobile-optimized view for executing assigned tasks and uploading delivery proofs.

### 2. Creating and Managing Consignments
- Log in as a **Supervisor**.
- Navigate to the Consignment tab and create a new entry. Fill out the manifest details, vehicle number, and assign a driver.
- Capture photos (via webcam or mobile camera) for load verification.

### 3. Driver Execution
- Log in as a **Driver**.
- View your assigned consignments.
- Complete deliveries by taking a photo of the signed Lorry Receipt (LR) to close out the task.

### 4. Financial & Operational Logs
- **Supervisors** can mark daily attendance and log maintenance costs for vehicles.
- **Drivers** can log fuel expenses (amount and receipt photo).
- **Super Admins** can review all logs to track operational costs and efficiencies.


## 🛠 Features & Status

### 1. Role-Based Access Control (RBAC)
- **Super Admin**: High-level analytics (Fuel, Maintenance, Payments), user management, and read-access to all logs.
- **Supervisor**: Management of the consignment lifecycle, attendance tracking, and cost logging (Maintenance/Payments).
- **Driver**: Action-oriented view for assigned tasks, fuel logging, and delivery confirmation.

### 2. Consignment Lifecycle (Advanced Workflow)
- **Detailed Manifest**: Support for Consigner/Consignee details, LR NO tracking, Issuing office info, Invoice mapping, and GST payable options.
- **Assignment Logic**: Supervisors assign specific drivers to truck numbers. Drivers only see their assigned tasks.
- **Proof of Action**: 
    - **Load Stage**: Supervisor captures a photo of the initial manifest.
    - **Delivery Stage**: Driver captures a photo of the stamped receipt to close the consignment.

### 3. Integrated Utilities
- **Camera Module**: Custom `CameraCapture` component with real-time preview, retake capability, and mobile-optimized `environment` camera selection.
- **Attendance System**: Supervisors mark daily attendance for drivers and other staff.
- **Financial Logs**: 
    - **Maintenance**: Logging of repair costs per truck number.
    - **Fuel**: Drivers log liters and cost with receipt uploads.
    - **Payments**: Tracking of pending vs. completed payments for consignments.

### 4. UI/UX Design (Precision Architect)
- **Typography**: Inter (UI) paired with JetBrains Mono (Data).
- **Theme**: Light technical gray (`#E4E3E0`) background with high-contrast ink highlights.
- **Language**: Simplified terminology ("Login", "Logout") and **Rupee (₹)** currency symbol throughout.

## 🏁 Development Status

- [x] **Database Schema**: Fully migrated to support detailed logistics manifests.
- [x] **Authentication**: Functional mock-auth for rapid testing.
- [x] **Camera**: Integrated with preview feedback.
- [!] **Persistence**: Ensure `logistics.db` is periodically backed up or migrated to a production DB (e.g., Cloud SQL) for long-term use.
- [ ] **Next Steps**: Implement real-time WebSocket notifications for real-time task assignments.

## 🔑 Test Credentials
| Role | Username | Password |
| :--- | :--- | :--- |
| Super Admin | `admin` | `admin123` |
| Supervisor | `sup1` | `sup123` |
| Driver | `driver1` | `driver123` |
