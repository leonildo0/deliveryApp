# DeliveryApp - Shared Trip Viewer

Public React frontend for tracking deliveries via shared link.

## Setup

```bash
cd shared-trip-app
npm install
npm run dev
```

App runs at: http://localhost:3002

## Features

- 📡 Real-time delivery tracking (5-second polling)
- 📍 Live deliverer location display
- 📦 Item details view
- 🔐 Checkout code display for recipient
- 📋 Delivery timeline/history
- 📱 Mobile-friendly responsive design

## Routes

| Route | Description |
|-------|-------------|
| `/track/:token` | Tracking page with delivery info |
| `*` | 404 Not Found page |

## How It Works

1. Client creates a delivery request
2. Deliverer accepts and picks up the item
3. Client generates a share link
4. Recipient opens the link to track delivery
5. Recipient sees checkout code to confirm receipt

## API

Connects to backend at `http://localhost:8000/api/v1`

Uses public endpoint: `GET /track/{token}`
