# DeliveryApp - Root Admin Panel

React admin dashboard for system administrators (root users).

## Setup

```bash
cd root-app
npm install
npm run dev
```

App runs at: http://localhost:3003

## Features

- 🔐 Secure login (root users only)
- 📊 Dashboard with system statistics
- 👥 User management (view all users)
- 📦 Delivery history and tracking
- 📋 Action logs viewer
- 🔄 Deliverer status history

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Admin login |
| `/` | Dashboard with stats |
| `/users` | All system users |
| `/deliveries` | All deliveries |
| `/logs` | Action logs & status history |

## Dashboard Stats

- Total users, clients, deliverers
- Client status (active/blocked)
- Deliverer status (online/busy/offline)
- Requests and deliveries counts
- Shared tracking links

## API

Connects to backend at `http://localhost:8000/api/v1`

Uses `/root/*` endpoints (requires root role).

## Test Account

```
Email: root@deliveryapp.com
Password: password123
```

## Tech Stack

- React 19 + Vite
- React Router v7
- Axios for API calls
- Dark theme UI
