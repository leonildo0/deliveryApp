# DeliveryApp Backend

REST API for delivery management system built with Laravel + SQLite.

## Requirements

- PHP 8.2+
- Composer
- SQLite

## Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan db:seed
```

## Running

```bash
php artisan serve
```

API available at: http://localhost:8000/api/v1

Swagger documentation: http://localhost:8000/api/documentation

## Test Credentials

| Role       | Email                       | Password    |
|------------|------------------------------|-------------|
| Root       | root@deliveryapp.com         | password123 |
| Cliente    | cliente@deliveryapp.com      | password123 |
| Entregador | entregador@deliveryapp.com   | password123 |

## API Endpoints

### Auth (`/api/v1/auth`)
- `POST /register` - Register new user (cliente or entregador)
- `POST /login` - Login and get token
- `POST /logout` - Logout (authenticated)
- `GET /me` - Get current user info (authenticated)

### Client (`/api/v1/client`) - Requires cliente role
- `GET /requests` - List my requests
- `POST /requests` - Create delivery request
- `GET /requests/{id}` - Get request details
- `POST /requests/{id}/cancel` - Cancel request
- `POST /requests/{id}/share` - Generate share link
- `GET /requests/{id}/tracking` - Get deliverer location

### Deliverer (`/api/v1/deliverer`) - Requires entregador role
- `GET /profile` - Get profile with moto
- `POST /moto` - Register motorcycle
- `PUT /moto` - Update motorcycle
- `POST /status` - Toggle online/offline
- `POST /location` - Update current location
- `GET /available-requests` - List available requests
- `POST /requests/{id}/accept` - Accept a request
- `GET /deliveries/current` - Get current active delivery
- `POST /deliveries/{id}/checkin` - Start delivery with code
- `POST /deliveries/{id}/complete` - Complete with checkout code
- `POST /deliveries/{id}/cancel` - Cancel active delivery

### Tracking (Public)
- `GET /track/{token}` - Get delivery status by share token

### Root (`/api/v1/root`) - Requires root role
- `GET /logs` - Canceled requests log
- `GET /stats` - System statistics
- `GET /users` - List all users
- `GET /deliveries` - List all deliveries
- `GET /status-history` - Full status history

## Database Schema

See `../schema.sql` for the full database schema.

### Main Tables
- `usuario` - All users with roles (root, cliente, entregador)
- `cliente` - Client profiles
- `entregador` - Deliverer profiles
- `moto` - Motorcycles (one per entregador)
- `solicitacao` - Delivery requests
- `entrega` - Active deliveries
- `delivery_share` - Share links for tracking
- `status_history` - All status changes

## Status Lifecycle

### Solicitacao (Request)
```
requested → accepted → fulfilled
        ↘ canceled
        ↘ expired
```

### Entrega (Delivery)
```
checkin_pending → in_progress → completed
              ↘ canceled
```

### Entregador
```
offline ↔ online ↔ busy
```

## Constraints

- One active request per client at a time
- One active delivery per deliverer at a time
- Check-in code required to start delivery
- Checkout code required to complete delivery
