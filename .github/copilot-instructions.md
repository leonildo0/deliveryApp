# DeliveryApp - Copilot Instructions

## Project Overview

Delivery management system with a Laravel 12 REST API backend and four React 19 + Vite frontends, each serving a specific user role.

## Architecture

```
backend/          → Laravel 12 API (port 8000)
client-app/       → Client frontend (port 3000)
deliverer-app/    → Deliverer frontend (port 3001)
shared-trip-app/  → Public tracking page (port 3002)
root-app/         → Admin dashboard (port 3003)
```

### User Roles & Apps

| Role | App | Purpose |
|------|-----|---------|
| `cliente` | client-app | Create delivery requests, track deliveries, share tracking links |
| `entregador` | deliverer-app | Accept requests, manage deliveries, send location |
| `root` | root-app | Admin dashboard, view stats/logs/users |
| (public) | shared-trip-app | View delivery tracking via share token |

### API Route Structure

All API routes are under `/api/v1/` and organized by role:
- `/auth/*` - Public auth endpoints
- `/client/*` - Requires `role:cliente` + `cliente.active` middleware
- `/deliverer/*` - Requires `role:entregador` middleware
- `/root/*` - Requires `role:root` middleware
- `/track/{token}` - Public tracking endpoint

## Commands

### Backend

```bash
cd backend

# Development
php artisan serve                    # Start server (port 8000)
php artisan migrate                  # Run migrations
php artisan db:seed                  # Seed test data
php artisan l5-swagger:generate      # Regenerate Swagger docs

# Testing
php artisan test                     # Run all tests
php artisan test --filter=AuthTest   # Run single test class

# Linting
./vendor/bin/pint                    # Laravel Pint (code style)
```

### Frontend (all apps)

```bash
cd <app-name>

npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
```

## Key Conventions

### Database Naming (Portuguese)

Primary keys use Portuguese naming with `id` prefix:
- `idusuario`, `idcliente`, `identregador`, `idsolicitacao`, `identrega`

Foreign keys use the pattern `{table}_id{primarykey}`:
- `usuario_idusuario`, `cliente_id`, `entregador_id`

### Models & Tables

The main auth model is `Usuario` (not `User`), mapped to table `usuario`:
```php
protected $table = 'usuario';
protected $primaryKey = 'idusuario';
```

Role-specific profiles are in separate tables linked by `usuario_idusuario`.

### Status Enums

```
cliente.status:     active | blocked
entregador.status:  offline | online | busy
solicitacao.status: requested | accepted | canceled | expired | fulfilled
entrega.status:     checkin_pending | in_progress | completed | canceled
```

### Swagger Annotations

Use PHP 8 attributes (not docblocks) for Swagger:
```php
#[OA\Get(path: "/endpoint", ...)]
public function method() { }
```

### Frontend API Services

Each frontend has `src/services/api.js` with Axios instance configured for:
- Base URL: `http://localhost:8000/api/v1`
- Bearer token from `localStorage.getItem('token')`
- Automatic redirect to `/login` on 401 responses

### Authentication Flow

1. Login returns `{ user, token }`
2. Token stored in `localStorage`
3. All authenticated requests include `Authorization: Bearer {token}`
4. Laravel Sanctum validates tokens (no CSRF for API-only auth)

### Location Tracking

- Deliverer apps send GPS coordinates every 10 seconds when online/busy
- Coordinates come from browser's `navigator.geolocation.getCurrentPosition`
- Location stored in `location` table, linked to `entregador.current_location_id`

### Check-in/Checkout Codes

- `checkin_code`: 6-digit code on `solicitacao`, given to deliverer at pickup
- `checkout_code`: 6-digit code on `delivery_share`, given to recipient at dropoff
- Both codes auto-generated when respective records are created

## Test Credentials

```
root@deliveryapp.com / password123
cliente@deliveryapp.com / password123
entregador@deliveryapp.com / password123
```

## UI Language

All frontend UI text is in **Portuguese (pt-BR)**. Code (variables, functions, comments) is in English.
