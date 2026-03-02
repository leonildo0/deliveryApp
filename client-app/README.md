# DeliveryApp - Client Frontend

React frontend for clients to request and track deliveries.

## Setup

```bash
cd client-app
npm install
npm run dev
```

App runs at: http://localhost:3000

## Features

- 🔐 Login/Register with email and password
- 📦 Create new delivery requests
- 📍 Set pickup and dropoff locations
- 🔢 View check-in code (share with deliverer)
- 📡 Real-time deliverer location tracking
- 🔗 Generate share link for recipient
- 📜 View request history

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Login page |
| `/register` | Registration page |
| `/` | Dashboard with active request |
| `/new-request` | Create new delivery request |
| `/request/:id` | Request details and tracking |

## API

Connects to backend at `http://localhost:8000/api/v1`

## Test Account

```
Email: cliente@deliveryapp.com
Password: password123
```
