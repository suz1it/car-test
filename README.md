# CarePlan Car Test

A full-stack application for managing cars and their registration status. The frontend is built with Angular and the backend with ASP.NET Core.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Angular 19, Tailwind CSS, Flowbite, NgRx Signals, SignalR |
| **Backend** | ASP.NET Core 9.0, .NET 9 |
| **API Docs** | Swagger/OpenAPI |

## Project Structure

```
car-test/
├── frontend/          # Angular SPA
│   └── src/
│       ├── app/
│       ├── environments/
│       └── ...
├── backend/           # ASP.NET Core Web API
│   ├── CarePlan.Api/
│   └── CarePlan.sln
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

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cars` | List cars (optional `?make=` filter) |
| GET | `/api/cars/registration-status` | Get registration status for all cars |

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

## Development

- **Frontend tests**: `npm run test` (from `frontend/`)
- **Backend**: Swagger UI is enabled in Development for interactive API testing.
