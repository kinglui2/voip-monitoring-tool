# VetraCom - VoIP Monitoring System

## Quick Start Guide

### Prerequisites
- Node.js v16+
- MongoDB v5+
- npm v8+

### Installation
```bash
git clone https://github.com/your-repo/vetracom.git
cd vetracom
cd "voip tool/backend" && npm install
cd "../frontend" && npm install
```

### Configuration
Create `.env` in `voip tool/backend`:
```
MONGODB_URI=mongodb://localhost:27017/vetracom
JWT_SECRET=your-secret-key
PORT=5000
```

### Running
```bash
# Backend
cd "voip tool/backend" && npm run dev

# Frontend (in new terminal)
cd "voip tool/frontend" && npm run dev
```

Access at: `http://localhost:5173`

### Test Users
| Role        | Username   | Password    |
|-------------|------------|-------------|
| Admin       | lewis      | lewis123    |
| Supervisor  | supervisor | supervisor123 |
| Agent       | luiz       | luiz123     |
