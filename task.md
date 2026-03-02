You are an MCP agent. Build a delivery system with a REST API using **PHP Laravel + Laravel Breeze + SQLite** as backend, and three **React + Vite** frontends: **deliverer**, **client**, and **shared trip**.

Produce a detailed user story–driven plan, then implement the system. Follow these requirements:

**Domain roles**
- **Client**: requests deliveries (individual or restaurant staff, treated as P2P).
- **Deliverer**: motorcyclist; only motorcycles are supported; each deliverer can register exactly one motorcycle.
- **Root user**: can access system logs (e.g., canceled requests) and view statistics (users, locations, trips).

**Core features**
- Client creates delivery request with item details (type, weight, dimensions, notes), pickup and dropoff locations.
- Client can share a delivery tracking link after pickup.
- Delivery requires **check-in code** to start (client gives to deliverer).
- Delivery requires **checkout code** to complete (visible in shared link).
- Client and deliverer can only be in **one active request/trip at a time**.
- Real-time location tracking is required for deliverer progress to pickup and destination.
- Persist status history for analytics across sessions.

**Data model (SQLite)**
- Entities: usuario, root, cliente, entregador, moto, solicitacao, entrega, item, location, delivery_share, status_history.
- Status fields: solicitacao, entrega, entregador, cliente.
- Enforce one active request per client and one active delivery per deliverer (partial unique indexes or equivalent constraints).
- Store status transitions in status_history.

**Deliverables**
1. User stories and acceptance criteria for each role.
2. API endpoints with request/response schemas.
3. Database schema and migrations for SQLite.
4. Laravel Breeze auth and role separation.
5. React apps structure (deliverer, client, shared trip).
6. Location tracking endpoints and polling strategy.
7. Status lifecycle and validation rules.
8. Seed data for local development.
9. Minimal documentation (setup, run, API overview).

**Constraints**
- Use English on the code, but all UI must be in portuguese
- Keep the solution minimal but complete.
- No example data unless explicitly asked.
- Confirm critical decisions (status enums, URL structure) before coding.


---
part 2
Understood.

## User Story — `/new-request` Flow Redesign (Client App)

**Title:** Multi-step delivery request creation with real-time map routing  
**As a** client user,  
**I want** to create a delivery request in a guided multi-step page, where I first fill item data and then define route points (“de” and “para”) on a single interactive map,  
**So that** I can clearly validate pickup origin, destination, and trajectory before submitting.

---

### 1) Product Intent

The `/new-request` page must evolve into a **2-step, conversion-oriented flow** with strong spatial clarity:

1. **Step 1 — Item Information**  
   Client fills all required item/request fields.
2. **Step 2 — Route Definition (Single Map)**  
   - Input **“de”** auto-populates from current client geolocation.  
   - Map pins origin (“de”).  
   - Input **“para”** is filled by the client (search/autocomplete/manual confirmation).  
   - Map pins destination (“para”).  
   - Map draws route trajectory line between both points.

The experience must feel modern, trustworthy, and highly legible, reducing ambiguity before request confirmation.

---

### 2) UX Vision (Creative Design Direction)

- **Visual style:** clean logistics UI, high contrast, minimal noise, map-first in Step 2.
- **Interaction model:** explicit progression (“Next”), visible progress indicator (Step 1 of 2, Step 2 of 2).
- **Cognitive load:** one goal per step.
- **Confidence signals:** geolocation status, address validation, route preview, distance/ETA summary area.
- **Tone:** precise microcopy, operational clarity (pickup vs delivery destination).

---

### 3) Functional Requirements

#### FR-1 — Route as a true second step
- `/new-request` must not show map before item data is valid.
- “Next” advances only when Step 1 required fields are valid.

#### FR-2 — “de” input behavior
- “de” exists as a visible input in Step 2.
- On entering Step 2, app requests geolocation permission.
- If granted:
  - Resolve coordinates to human-readable address.
  - Fill “de” input.
  - Place origin pin on map.
  - Mark origin as “current location”.
- If denied/unavailable:
  - Keep “de” editable.
  - Show clear status and allow manual origin entry.

#### FR-3 — “para” input behavior
- Client fills destination in “para”.
- Destination resolution must produce coordinates.
- Place destination pin on map immediately after valid selection/confirmation.

#### FR-4 — Route line rendering
- When both points are valid, draw trajectory polyline between origin and destination.
- Route must refresh when either point changes.

#### FR-5 — Single-map consistency
- Exactly one map component in Step 2.
- Both pins and route line coexist on same map viewport.
- Auto-fit bounds to include both markers and full trajectory.

#### FR-6 — Submission integrity
- Final request payload must include:
  - Item data (Step 1),
  - Origin label + coordinates,
  - Destination label + coordinates,
  - Route metadata when available (distance/duration if service supports it).

---

### 4) Non-Functional Requirements

- **Performance:** Step transition and map render perceived as immediate (<300ms UI response target excluding network).
- **Reliability:** graceful fallback if geolocation, reverse geocoding, or routing API fails.
- **Accessibility:** keyboard navigable inputs, visible focus states, semantic step headers, ARIA status for geolocation state.
- **Mobile-first:** map and inputs optimized for one-hand use; sticky action area for Next/Continue.
- **Security/Privacy:** geolocation requested only in Step 2 context; clear purpose messaging.

---

### 5) Interaction & State Model

#### Step 1 State
- `itemForm.valid` controls Next button state.
- `draftRequest.itemData` persisted when advancing.

#### Step 2 State
- `origin` = `{ label, lat, lng, source: "geolocation" | "manual" }`
- `destination` = `{ label, lat, lng, source: "manual" }`
- `route` = `{ polyline, distance, duration, status }`
- Derived:
  - `canRenderRoute = origin && destination`
  - `canSubmit = itemDataValid && originValid && destinationValid`

---

### 6) Edge Cases & Recovery Rules

- Geolocation denied → show non-blocking warning, allow manual “de”.
- Geolocation timeout → retry action + manual fallback.
- Address ambiguity (“para”) → require explicit selected result before pin.
- Routing failure with valid points → keep both pins; allow submit with warning if business rules permit.
- Network loss in Step 2 → preserve typed values locally; retry lookup/routing.

---

### 7) Acceptance Criteria (Testable)

1. Given valid Step 1 data, when client clicks **Next**, then Step 2 opens with one map.
2. Given geolocation permission granted, “de” is auto-filled and origin pin appears.
3. Given client fills valid “para”, destination pin appears on same map.
4. Given both pins exist, trajectory line is visible between them.
5. Given either point changes, route is recalculated and redrawn.
6. Given geolocation denied, client can still type “de” manually and proceed.
7. On final submit, payload contains item + origin/destination coordinates.

---

### 8) Design Constraints for AI Implementation Agent

- Keep existing `/new-request` route; convert internals to stepper flow.
- Do not introduce parallel map components.
- Preserve existing form validation patterns and project conventions.
- Add observability logs for:
  - geolocation request/result,
  - geocoding success/failure,
  - route computation success/failure.

---

### 9) Definition of Done

- UI shipped with 2-step flow and single map route step.
- “de” auto-location + manual fallback implemented.
- “para” resolution and destination pin implemented.
- Route polyline rendered and updated.
- Validation + submission payload integrated.
- Accessibility and mobile behavior validated.
- Unit/integration tests updated for new flow.

---

