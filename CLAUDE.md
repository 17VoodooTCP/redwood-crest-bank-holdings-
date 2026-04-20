# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Redwood Crest Bank** — a full-stack online banking app. Backend runs on port 3001, frontend on 5173.

## Commands

### Backend (`/backend`)
```bash
npm run dev          # Start with nodemon (hot reload)
npm run start        # Production start
npm run db:push      # Push Prisma schema to MongoDB
npm run db:seed      # Seed database with test data
npm run db:studio    # Open Prisma Studio GUI
npm run setup        # install + db:push + db:seed (first-time setup)
npm test             # Run all Jest tests
npx jest --testPathPattern=transferService  # Run a single test file
```

### Frontend (`/frontend`)
```bash
npm run dev          # Vite dev server (http://localhost:5173)
npm run build        # Production build
npm run lint         # ESLint
```

## Environment Variables

Backend requires a `.env` file (see `.gitignore` — never committed):
```
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
DATABASE_URL=          # MongoDB connection string
JWT_SECRET=            # Access token signing key
JWT_REFRESH_SECRET=    # Refresh token signing key
ADMIN_EMAIL=           # Admin console login
ADMIN_PASSWORD=        # Admin console password
```

Frontend uses `VITE_API_URL` (defaults to `http://localhost:3001` if unset).

## Architecture

### Backend (`/backend/src`)

**Entry point:** `index.js` — mounts all routes, applies middleware, starts HTTP + Socket.io server.

**Route → Service pattern:** Routes handle HTTP validation (`express-validator`), then delegate business logic to a matching service file. Never put DB calls directly in route handlers.

```
routes/transfer.js  →  services/transferService.js
routes/pay.js       →  services/paymentService.js
routes/wire.js      →  services/wireService.js
routes/accounts.js  →  services/accountService.js
routes/transactions.js → services/transactionService.js
```

**Database:** MongoDB via Prisma ORM. Single client instance at `utils/prisma.js`. Schema in `prisma/schema.prisma`.

Models: `User → Account → Transaction`, plus `Transfer`, `Payment`, `WireTransfer`, `Message`, `ChatSession`, `ChatMessage`, `LoginAttempt`, `SystemSetting`.

**Auth flow (two-token, cross-origin):**
1. `accessToken` (15 min) + `refreshToken` (7 days) stored as `httpOnly` cookies.
2. CSRF token returned in JSON response body (not readable from cookie due to cross-origin Vercel↔Railway deployment). Frontend stores it in memory + `sessionStorage` and sends it as `X-CSRF-Token` header on all state-changing requests.
3. `authenticate` middleware (`middleware/auth.js`) checks httpOnly cookie first, then falls back to `Authorization: Bearer` header (legacy admin panel compat).
4. On 401 with `code: TOKEN_EXPIRED`, the Axios interceptor in `services/api.js` auto-calls `/auth/refresh` then retries.
5. `/auth/me` always issues a fresh CSRF token so the frontend can rehydrate on page reload.

**CSRF protection** (`middleware/csrf.js`): double-submit cookie pattern using `crypto.timingSafeEqual`. Applied to all state-changing routes except `/auth` and `/transactions` (read-heavy). Auth routes are exempt so login/register can set the initial cookie.

**Admin portal** (`routes/admin.js`): separate standalone authentication — not the same as `isAdmin` on the `User` model. Uses its own JWT signed with `JWT_SECRET` stored in `localStorage` as `adminToken`. The `requireAdmin` middleware checks `req.user.isAdmin` for customer-facing admin actions; the standalone portal checks its own JWT.

**NLP command interface** (`routes/command.js` + `utils/nlp-parser.js`): parses plain-English banking commands (e.g. `transfer 500 from checking to savings`) into structured intents and executes them via the service layer.

**Live chat** (`services/chatSocket.js`): Socket.io with two namespaces — `/chat` (customer) and `/admin-chat` (agent). Bot responses come from `services/chatBot.js`. Agents can take over sessions. Attachments are base64 data URLs validated on the server (5 MB max, images + PDF only).

### Frontend (`/frontend/src`)

**State:** Single Zustand store — `store/useAuthStore.js`. All auth state (user, isAuthenticated, isLoading) lives here. No Redux, no Context for auth.

**API client:** `services/api.js` — preconfigured Axios instance with `withCredentials: true`, automatic CSRF header injection, and the token-refresh interceptor.

**Routing** (`App.jsx`):
- `ProtectedRoute` — wraps all banking pages; redirects to `/login` if not authenticated.
- `AdminRoute` — checks `user.isAdmin`; redirects non-admins away.
- Admin portal (`/admin`) uses `AdminDashboard` with its own internal login state, bypassing `AdminRoute`.
- Info pages (`/careers`, `/privacy`, etc.) are public with their own standalone nav (`InfoPageShell`).

**Account types:** `CHECKING`, `SAVINGS`, `CREDIT`, `HELOC`. Credit/HELOC accounts have additional fields (`creditLimit`, `minimumPayment`, `statementBalance`, `nextPaymentDue`). Payment types: `FIXED`, `MINIMUM`, `STATEMENT`, `CURRENT`.

### Testing

Tests are integration tests — they hit a real MongoDB database (no mocks). Each test file seeds its own data in `beforeAll` and expects `prisma.$disconnect()` in `afterAll`. Located in `backend/src/services/__tests__/`.
