# Finance Assistant — Frontend

React 19 + TypeScript + Tailwind CSS Single Page Application for the **Finance Assistant** microservices platform.

## Prerequisites

- Node.js 20+ and npm
- Backend services running (`eurekaserver`, `gatewayserver`, `microservice-account`, `microservice-transactions`, `microservice-ai`)
- Recommended gateway profile for local development: `dev` or `no-security` (since `AccountController.login` returns `AccountResponseDTO` without a JWT token)

## Environment Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Verify `VITE_API_BASE_URL` in `.env` (default `http://localhost:8072`, or `http://localhost:8073` for the open/dev gateway):

   ```env
   VITE_API_BASE_URL=http://localhost:8072
   ```

## Install & Run

```bash
npm install
npm run dev
```

The Vite dev server starts at `http://localhost:5173`.

## Production Build

```bash
npm run build
```

## Gateway Routing & CORS

All requests go through `gatewayserver` using the configured route prefixes:
- `/microservice-account/api/v1/accounts/**`
- `/microservice-transactions/api/transactions/**`
- `/microservice-ai/api/ai/**` and `/microservice-ai/api/chats/**`

`gatewayserver/src/main/resources/application.yml` already includes `globalcors` allowing `http://localhost:5173` (`allowedOriginPatterns: "*"`, `allowCredentials: true`, `allowedMethods: "*"`, `allowedHeaders: "*"`).
