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
