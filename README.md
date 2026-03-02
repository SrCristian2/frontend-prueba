# Payment Store — Wompi Checkout Frontend

Credit card payment gateway SPA integrated with the **Wompi** sandbox API. Built with **React 19**, **TypeScript**, **Redux Toolkit**, and **Vite**.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running](#running)
- [Tests](#tests)
- [Architecture](#architecture)
- [Payment Flow](#payment-flow)
- [Security (OWASP)](#security-owasp)
- [Technical Decisions](#technical-decisions)

---

## Prerequisites

| Tool    | Minimum Version |
|---------|----------------|
| Node.js | 22+            |
| npm     | 9+             |

## Installation

```bash
git clone https://github.com/SrCristian2/frontend-prueba.git
cd frontend
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api/v1
# Wompi sandbox public key
VITE_WOMPI_PUBLIC_KEY=pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7
```

Both variables are validated at application startup; a descriptive error is thrown if either is missing.

## Running

```bash
# Development
npm run dev

# Production build
npm run build

# Preview the build
npm run preview
```

## Tests

```bash
# Run tests
npm test

# Run with coverage report
npm run test:coverage
```

**Current results:** 22 suites, 187 tests, 96%+ coverage across statements, branches, functions, and lines.

---

## Architecture

```
src/
├── App.tsx                      # Main router (/ and /checkout)
├── main.tsx                     # Entry point with Provider and BrowserRouter
├── store/
│   ├── store.ts                 # configureStore with Redux Toolkit
│   ├── hooks.ts                 # Typed useAppDispatch / useAppSelector
│   └── persistence.ts           # localStorage persistence with validation
├── features/
│   ├── product/
│   │   ├── productSlice.ts      # Slice: fetchProducts, selectProduct
│   │   ├── productAPI.ts        # GET /products calls to backend
│   │   ├── selectors.ts         # Typed selectors
│   │   ├── type.ts              # Product interface
│   │   ├── ProductPage.tsx      # Product listing page
│   │   ├── components/
│   │   │   ├── ProductCard.tsx   # Individual product card
│   │   │   └── ProductList.tsx   # ProductCards grid
│   │   └── utils/
│   │       └── formatPrice.ts   # COP format ($XX,XXX)
│   └── checkout/
│       ├── checkoutSlice.ts     # Slice: processPayment (async thunk)
│       ├── checkoutAPI.ts       # Wompi tokenization + backend API
│       ├── CheckoutContext.tsx   # Context for sensitive data (CVV, PAN)
│       ├── CheckoutFlow.tsx     # Step 1-4 orchestrator
│       ├── selectors.ts         # Typed selectors
│       ├── type.ts              # Checkout interfaces
│       ├── components/
│       │   ├── StepCardDelivery.tsx  # Step 1: Card + delivery form
│       │   ├── StepSummary.tsx       # Step 2: Order summary with fees
│       │   ├── StepProcessing.tsx    # Step 3: Processing spinner
│       │   └── StepResult.tsx        # Step 4: Result (approved/declined)
│       ├── validation/
│       │   └── checkoutSchema.ts     # Yup validation with Luhn + sanitization
│       └── utils/
│           ├── detectCardBrand.ts    # Visa/Mastercard detection by BIN
│           └── formatCardNumber.ts   # XXXX XXXX XXXX XXXX format
└── styles/
    ├── variables.scss           # Design tokens (colors, typography, spacing)
    └── index.scss               # Global reset
```

### State Pattern

| Data | Storage | Reason |
|------|---------|--------|
| Products, step, status, customer, delivery, paymentMeta (last4) | **Redux Toolkit** | Shared global state via selectors |
| Full card number, CVV, expiry | **React Context** (in-memory) | PCI-sensitive data — never in Redux or localStorage |
| Form draft (name, email, address) | **localStorage** | Persistence across refresh without sensitive data |
| Checkout state + selected product | **localStorage** (debounced 300ms) | Session recovery on refresh |

---

## Payment Flow

1. **Product selection** — User picks a product from the catalog
2. **Form** — Enters card details (validated with Luhn), delivery info
3. **Summary** — Reviews product + Base Fee ($2,000) + Delivery ($5,000) = Total
4. **Processing** —
   - Card tokenization via Wompi sandbox (`POST /v1/tokens/cards`)
   - Acceptance token retrieval (`GET /v1/merchants/{key}`)
   - Transaction creation on backend (`POST /transactions`)
   - Payment processing (`POST /transactions/:id/process-payment`)
   - Automatic polling if status = `PENDING` (max 15 attempts, 2s interval)
5. **Result** — Approved / Declined with option to return to the store

---

## Security (OWASP)

Implemented measures against OWASP Top 10:

| Category | Measure | Detail |
|----------|---------|--------|
| **A02 — Cryptographic Failures** | Sensitive data in memory only | PAN and CVV in React Context, never in Redux/localStorage |
| **A02** | Redux DevTools disabled in production | `devTools: import.meta.env.DEV` in configureStore |
| **A02** | Tokenization via Wompi | Backend never receives the full card number |
| **A03 — Injection** | Input sanitization | Yup regex for cardHolder, address, city, country blocks `<script>`, SQL injection, etc. |
| **A03** | No `dangerouslySetInnerHTML` | Zero usage across the entire project |
| **A03** | No `console.log` in production | No sensitive data leaked to the browser console |
| **A05 — Security Misconfiguration** | Content Security Policy (CSP) | Meta tag restricting `script-src`, `connect-src`, `style-src`, `font-src`, `img-src` |
| **A05** | Security headers | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` configured in Vite |
| **A05** | Environment variables validated at startup | checkoutAPI.ts and productAPI.ts throw if missing |
| **A05** | `.env` in `.gitignore` | Real keys never in version control |
| **A07 — CSRF** | Stateless token-based architecture | API uses Wompi Bearer token; backend should validate Origin/Referer |
| **A08 — Integrity** | localStorage validation | Schema validation when deserializing `loadPersistedState()` and `loadDraft()` |
| **A08** | imageUrl validation | Only renders `<img>` if URL starts with `https://`, with `referrerPolicy="no-referrer"` |
| **Insecure Design** | Masked CVV | Input `type="password"` for the CVV field |
| **Insecure Design** | Secure autocomplete | `autoComplete="cc-number"`, `cc-exp`, `cc-csc`, `cc-name` attributes |
| **Insecure Design** | Double-submit protection | "Confirm Payment" button disabled while `status === "processing"` |
| **Insecure Design** | Strict error typing | `error: unknown` + `instanceof Error` discrimination in thunks |

---

## Technical Decisions

| Decision | Justification |
|----------|--------------|
| **React 19 + Vite 7** | Fast HMR, optimized builds, native ESM |
| **Redux Toolkit** | Recommended Flux pattern, `createAsyncThunk` for async flows, DevTools in dev |
| **react-hook-form + Yup** | Minimal re-renders, declarative validation with Luhn check and sanitization |
| **SCSS Modules + BEM** | Auto-scoped styles, consistent naming convention, centralized design tokens |
| **Mobile-first responsive** | Breakpoints at 640px / 1024px / 1440px across all components |
| **React Context for PCI** | Card data in volatile memory, outside Redux and DevTools |
| **Montserrat (Google Fonts)** | Professional typography with preconnect for performance |
| **Jest + Testing Library** | User-behavior-focused testing, not implementation details |
| **Debounced persistence** | localStorage with 300ms debounce + validation on load to prevent corrupted data |

