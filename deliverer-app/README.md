# DeliveryApp - Deliverer Frontend

React frontend for deliverers (entregadores) to manage deliveries.

## Setup

```bash
cd deliverer-app
npm install
npm run dev
```

App runs at: http://localhost:3001

## Features

- 🔐 Login/Register as deliverer
- 🏍️ Motorcycle registration and management
- 🟢 Online/Offline status toggle
- 📋 View available delivery requests
- ✅ Accept delivery requests
- 🔐 Check-in with code (pickup confirmation)
- ✅ Checkout with code (delivery confirmation)
- 📍 Background location sending (every 10s)
- ❌ Cancel active delivery

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Login page |
| `/register` | Registration page |
| `/` | Dashboard with status and requests |
| `/profile` | Motorcycle registration/update |
| `/delivery` | Active delivery management |

## Delivery Flow

1. **Go Online** - Toggle status to start receiving requests
2. **Accept Request** - Pick a delivery from available list
3. **Go to Pickup** - Navigate to pickup location
4. **Check-in** - Enter the 6-digit code from client
5. **Go to Dropoff** - Navigate to delivery location
6. **Checkout** - Enter the 6-digit code from recipient
7. **Done** - Automatically returns to online status

## API

Connects to backend at `http://localhost:8000/api/v1`

## Test Account

```
Email: entregador@deliveryapp.com
Password: password123
```

## Location Tracking

When online or on active delivery, the app sends GPS coordinates every 10 seconds using the browser's Geolocation API.
