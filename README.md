# VetraCom - VoIP Monitoring System

## 1. Project Overview
**VetraCom** is a web-based application designed to track and analyze VoIP call activity in real time. It provides insights into call statuses, analytics, and system performance, enabling better call management and troubleshooting.

## 2. Quick Start Guide

### Prerequisites
- Node.js (v16+)
- MongoDB (v5+)
- npm (v8+)

### Installation
1. Clone the repository:
```bash
git clone https://github.com/your-repo/voip-monitoring-tool.git
cd vetracom
```

2. Install dependencies for both frontend and backend:
```bash
cd "voip tool/backend" && npm install
cd "../frontend" && npm install
```

3. Set up environment variables:
```bash
# Backend .env file (voip tool/backend/.env)
MONGODB_URI=mongodb://localhost:27017/vetracom
JWT_SECRET=your-secret-key
PORT=5000
```

### Running the Application
1. Start the backend server:
```bash
cd "voip tool/backend" && npm run dev
```

2. Start the frontend development server:
```bash
cd "voip tool/frontend" && npm run dev
```

3. Access the application at:
```
http://localhost:5173
```

### Test Credentials
| Role        | Username   | Password    |
|-------------|------------|-------------|
| Admin       | lewis      | lewis123    |
| Supervisor  | supervisor | supervisor123 |
| Agent       | luiz       | luiz123     |

## 2. Objectives
- Monitor and display live VoIP call data.
- Track call statuses (active, ringing, missed, failed, completed).
- Provide real-time call analytics and reports.
- Alert users for missed or failed calls.
- Support integration with VoIP systems (3CX and yeastar).
- Offer an intuitive web-based dashboard for easy monitoring.

## 3. Core Functionalities
### 3.1 Call Monitoring
- Display live calls, including caller and receiver details.
- Show call duration, call status, and timestamps.

### 3.2 Call Status Tracking
- Classify calls as **Ringing, In Progress, Completed, Missed, or Failed**.
- Update call statuses dynamically in real time.

### 3.3 Call Analytics & Reports
- Display total calls, answered calls, missed calls, and failed calls.
- Show trends with graphical visualizations (bar charts, pie charts, etc.).
- Provide filtering options (by user, extension, time range, etc.).

### 3.4 Alerts & Notifications
- Generate alerts for missed or failed calls.
- Provide notifications via the dashboard.

### 3.5 Integration with VoIP System
- Fetch call data from **3CX and yeastar voip systems** via API or logs.
- Process and store call logs in a database.

### 3.6 User Management
- **Admin:** Manages settings, users, and alerts.
- **Supervisor:** Views analytics and monitors calls.
- **Agent/User:** Only views their own call logs.
- Allows multiple users with different permissions.
- **Future enhancement:** Support for multi-tenant organizations.

### 3.7 Authentication & Security
- **User Login:** Simple username-password authentication using **JWT (JSON Web Token)**.
- **Role-Based Access:** Restrict access based on user roles (Admin, Supervisor, Agent).
- **Basic Security Measures:**
  - Encrypt passwords using **bcrypt**.
  - Secure API endpoints with authentication middleware.
  - Use **CORS** to control API access.

### 3.8 Scalability & Logging
- **Call Event Logging:** Store call history and status changes in MongoDB.
- **User Activity Logging:** Track login attempts, API requests, and system events.
- **Error Logging:** Log errors for debugging using **Winston** or a simple file-based logging system.
- **Future Enhancement:** Option to export logs as reports.

## 4. System Architecture
### 4.1 Backend (Node.js + Express + MongoDB)
- RESTful APIs for call logs and analytics.
- WebSockets for real-time updates.
- Database to store call records.

### 4.2 Frontend (React + Vite)
- Web-based dashboard for displaying call data.
- Charts and tables for analytics.
- Interactive UI with filters and alerts.

### 4.3 Integration
- VoIP system API for real-time call data retrieval.
- WebSockets for continuous updates.

## 5. Tech Stack

| Component        | Technology |
|-----------------|------------|
| **Backend**     | Node.js, Express.js, MongoDB |
| **Frontend**    | React, Vite, Axios, Socket.io |
| **Database**    | MongoDB |
| **Real-Time Updates** | WebSockets (Socket.io) |
| **VoIP Integration** | 3CX API, VoipSwitch API |
| **Authentication** | JWT, bcrypt |
| **Security** | CORS, Authentication Middleware |
| **Logging** | Winston (or file-based logging) |
| **UI Libraries** | Recharts (for graphs), TailwindCSS |

---