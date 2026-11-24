# AGENTS.md — Finance Assistant Frontend Specification

## 1. Project Context & Objective
Build a clean, modular **React + TypeScript** Single Page Application (SPA) inside the `frontend/` directory for the **Finance Assistant** microservices platform[cite: 1].
The backend is already implemented using Spring Boot 3.5.7, Spring Cloud Gateway, Eureka, and PostgreSQL[cite: 1]. All frontend HTTP requests must route through the API Gateway[cite: 1].

---

## 2. Tech Stack & Dependencies
- **Core:** React 19, TypeScript (strict mode enabled), Vite
- **Routing:** `react-router-dom` (v6/v7)
- **HTTP Client:** `axios` (centralized instance with request/response interceptors)
- **Styling & Icons:** Tailwind CSS + `lucide-react`
- **State Management:** React Context API (`AuthContext`) + local component state (`useState`, `useEffect`). Keep state management simple, transparent, and easy to trace—avoid heavy external state libraries unless strictly needed.

---

## 3. Architecture & Folder Structure
Create the application under `frontend/` following this clean separation of concerns:

```text
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts           # Axios instance, baseURL, JWT & 401 interceptors
│   │   ├── authApi.ts          # /api/v1/accounts endpoints
│   │   ├── transactionsApi.ts  # /api/transactions endpoints
│   │   └── aiApi.ts            # /api/ai and /api/chats endpoints
│   ├── components/
│   │   ├── Navbar.tsx          # Navigation bar with role-aware links & logout
│   │   ├── ProtectedRoute.tsx  # Auth & RBAC route guard (USER, VIP, ADMIN)
│   │   ├── TransactionForm.tsx # Modal/form for Create & Edit transactions
│   │   └── SmartTxInput.tsx    # Natural language quick-add transaction bar
│   ├── context/
│   │   └── AuthContext.tsx     # JWT storage, decoded user info, login/logout methods
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx   # Account summary + Transactions CRUD/filter/sort
│   │   ├── AiChatPage.tsx      # Chat sessions sidebar + message window + analysis
│   │   └── AdminPage.tsx       # Read-only global summary & accounts list (ADMIN only)
│   ├── types/
│   │   └── index.ts            # Strict TypeScript interfaces matching backend DTOs
│   ├── App.tsx                 # Route definitions
│   └── main.tsx
├── .env.example                # VITE_API_BASE_URL=http://localhost:8072
└── README.md                   # Setup and run instructions
```

---

## 4. Backend API Contract & Integration Rules
Inspect the Java DTOs/Controllers in `microservice-account`, `microservice-transactions`, and `microservice-ai`[cite: 1] before defining `src/types/index.ts` so field names and types match 1:1.

### Base Configuration
- Read API base URL from `import.meta.env.VITE_API_BASE_URL` (default: `http://localhost:8072`, or `http://localhost:8073` for open/dev gateway)[cite: 1].
- **CORS Check:** Verify `gatewayserver` configuration (`application.yml`) allows origins from `http://localhost:5173` (with credentials/headers `Authorization`, `Content-Type`). If missing, add a minimal `globalcors` config or document the exact snippet in `frontend/README.md`.

### Authentication & Authorization (`AuthContext` + `client.ts`)
- **Public Endpoints:**
  - `POST /api/v1/accounts/login` -> stores returned JWT in `localStorage` and updates `AuthContext`[cite: 1].
  - `POST /api/v1/accounts/` -> registers new account[cite: 1].
- **Request Interceptor:** Automatically attach `Authorization: Bearer <token>` to all outgoing requests when a token exists.
- **Response Interceptor:** On `401 Unauthorized`, clear stored token/user state and redirect to `/login`.
- **RBAC:** Support `USER`, `VIP`, and `ADMIN` roles[cite: 1] in `ProtectedRoute.tsx` (e.g., restrict `/admin` to `ADMIN`).

### Core Feature Modules
1. **Dashboard & Transactions (`/dashboard`):**
   - Fetch account overview via `GET /api/v1/accounts/{id}/summary`[cite: 1] and display KPI cards (Total Income, Total Expense, Net Balance).
   - Fetch user transactions via `GET /api/transactions/user/{userId}`[cite: 1].
   - Support filtering by type (`ALL`, `INCOME`, `EXPENSE`) via `GET /api/transactions/filter?type=X` and sorting via `GET /api/transactions/sort?sortBy=X`[cite: 1].
   - Provide full CRUD: `POST /api/transactions`, `PUT /api/transactions/{id}`, and `DELETE /api/transactions/{id}`[cite: 1].
   - Include a **Smart Transaction** input calling `POST /api/transactions/smart` (or `POST /api/ai/create-smart-transaction`)[cite: 1].

2. **AI Financial Advisor Chat (`/ai-chat`):**
   - Sidebar listing chat sessions (`GET /api/chats`), create session (`POST /api/chats`), and delete session (`DELETE /api/chats/{id}`)[cite: 1].
   - Message thread (`GET /api/chats/{chatId}/messages`) and send message (`POST /api/chats/{chatId}/messages`)[cite: 1].
   - Include an "Analyze My Spending" action button calling `POST /api/ai/analyze-transactions`[cite: 1].

3. **Admin Dashboard (`/admin` - `ADMIN` role only):**
   - Display global metrics from `GET /api/transactions/admin/global-summary` and users table from `GET /api/v1/accounts`[cite: 1].

---

## 5. Coding Standards & Guardrails (Mandatory)
- **No `any` types:** Every API payload, response, and component prop must have an explicit TypeScript interface or type.
- **Explicit Async States:** Every API-driven view must handle and render three states cleanly: `isLoading` (spinner/skeleton), `error` (clear error alert banner), and empty/populated data.
- **Code Readability:** Write straightforward, self-documenting functional components. Avoid premature abstractions, custom complex hook chains, or black-box code generation. Every file must be easy for a human engineer to read and explain line by line.
- **Verification Before Completion:**
  1. Run `npm run build` (TypeScript type-check + Vite production build) and fix all compiler or lint errors.
  2. Update `frontend/README.md` with clear instructions on environment setup and running the dev server (`npm install && npm run dev`).
