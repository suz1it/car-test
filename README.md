# CarePlan Car Test

A full-stack application for managing cars and their registration status. The frontend is built with Angular and the backend with ASP.NET Core.

## Features

- **Cars List** — Paginated list of cars with filtering by make, sorting, and make dropdown
- **Registration Status** — Paginated view of registration statuses with search, status filter (valid/expiring soon/expired), and sorting
- **Real-time Updates** — SignalR hub pushes registration status updates to connected clients when data changes

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Angular 19, Tailwind CSS, NgRx Signals, SignalR |
| **Backend** | ASP.NET Core 9.0, .NET 9 |
| **API Docs** | Swagger/OpenAPI |

## Project Structure

```
car-test/
├── frontend/                    # Angular SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── models/          # Car, RegistrationStatus, PagedResult
│   │   │   ├── pages/           # Cars list, Registration status
│   │   │   ├── services/         # CarService, RegistrationSignalRService
│   │   │   ├── stores/          # CarsStore (NgRx Signals)
│   │   │   ├── utils/           # Cars utilities
│   │   │   ├── app.config.ts
│   │   │   ├── app.routes.ts
│   │   │   └── ...
│   │   └── environments/        # Environment configs
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── backend/
│   ├── CarePlan.Api/
│   │   ├── Controllers/         # CarsController
│   │   ├── Data/                # MockCarData.json
│   │   ├── Hubs/                # RegistrationHub (SignalR)
│   │   ├── Models/              # Car, RegistrationStatus, PagedResult
│   │   ├── Services/            # CarService, RegistrationExpiryBackgroundService
│   │   ├── Program.cs
│   │   └── appsettings.json
│   └── CarePlan.sln
├── docker-compose.yml
└── README.md
```

## Prerequisites

- **Node.js** 18+ and npm (for frontend)
- **.NET 9 SDK** (for backend)

To check your versions:

```bash
node -v
npm -v
dotnet --version
```

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd car-test
```

### 2. Run the Backend

```bash
cd backend
dotnet run --project CarePlan.Api
```

The API will be available at **http://localhost:5000**.

- **Swagger UI**: http://localhost:5000/swagger

### 3. Run the Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run start:local
```

The app will be available at **http://localhost:4202** (or http://0.0.0.0:4202).

> **Note**: Use `npm run start:local` for network access (e.g. from another device). Use `npm run start` for standard local development on port 4200.

## Configuration

### Backend

- **Port**: 5000 (configurable in `backend/CarePlan.Api/Properties/launchSettings.json`)
- **CORS**: Allowed origins are set in `appsettings.json` under `Cors:AllowedOrigins`. Default includes `http://localhost:4200`, `http://localhost:4202`, and others.
- **Data**: Uses mock data from `backend/CarePlan.Api/Data/MockCarData.json`.

### Frontend

- **API URL**: Set in `frontend/src/environments/environment.ts` (development) and `environment.prod.ts` (production).
- Default: `http://localhost:5000`

To point the frontend at a different API:

1. Edit `frontend/src/environments/environment.ts` for development.
2. Edit `frontend/src/environments/environment.prod.ts` for production builds.

## API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cars` | Paginated list of cars with optional filter and sorting |
| GET | `/api/cars/makes` | List of unique car makes for dropdown selection |
| GET | `/api/cars/registration-status` | Paginated list of registration statuses with search and filters |

#### GET `/api/cars`

| Query Param | Type | Default | Description |
|-------------|------|---------|-------------|
| `make` | string | — | Filter by manufacturer (e.g., Toyota, Honda) |
| `page` | int | 1 | Page number (1-based) |
| `pageSize` | int | 10 | Items per page (max 100) |
| `sortColumn` | string | `make` | `id`, `make`, `model`, `registrationNumber`, `registrationExpiryDate` |
| `sortDirection` | string | `asc` | `asc` or `desc` |

**Response:** `PagedResult<Car>` — `{ items, totalCount, page, pageSize }`

#### GET `/api/cars/makes`

**Response:** `string[]` — Array of unique make names

#### GET `/api/cars/registration-status`

| Query Param | Type | Default | Description |
|-------------|------|---------|-------------|
| `search` | string | — | Search in make, model, registration number, car ID |
| `statusFilter` | string | `all` | `all`, `valid`, `expiringSoon`, `expired` |
| `page` | int | 1 | Page number (1-based) |
| `pageSize` | int | 10 | Items per page (max 100) |
| `sortColumn` | string | `registrationExpiryDate` | `registrationNumber`, `make`, `model`, `registrationExpiryDate`, `status` |
| `sortDirection` | string | `asc` | `asc` or `desc` |

**Response:** `PagedResult<RegistrationStatus>` — `{ items, totalCount, page, pageSize }`

### SignalR Hub

| Hub URL | Event | Description |
|---------|-------|-------------|
| `/hubs/registration` | `RegistrationStatusUpdated` | Pushed when a client connects (initial data) and when registration data changes |

Connect from the frontend to receive real-time registration status updates. The backend runs a background service that periodically updates expiry states and notifies connected clients.

### Data Models

**Car** — `{ id, make, model, registrationNumber, registrationExpiryDate }`

**RegistrationStatus** — `{ carId, registrationNumber, make, model, registrationExpiryDate, isExpired }`

**PagedResult&lt;T&gt;** — `{ items: T[], totalCount: number, page: number, pageSize: number }`

## Docker

Run the full stack with Docker Compose:

```bash
docker-compose up --build
```

- **API**: http://localhost:5000
- **Frontend**: http://localhost:4200 (served via nginx)

## Building for Production

### Backend

```bash
cd backend
dotnet publish CarePlan.Api -c Release -o ./publish
```

### Frontend

```bash
cd frontend
npm run build
```

Output is in `frontend/dist/`. Serve the contents with any static file server.

## Frontend Routes

| Path | Component | Description |
|------|------------|-------------|
| `/` | Cars List | Paginated cars with make filter and sorting |
| `/registration` | Registration Status | Paginated registration statuses with search, status filter, and real-time updates |

## Development

- **Frontend tests**: `npm run test` (from `frontend/`)
- **Backend**: Swagger UI is enabled in Development for interactive API testing at http://localhost:5000/swagger
