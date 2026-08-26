STARDUST: Autonomous Revenue Recovery Command Center

An intelligent revenue recovery command center designed to detect, diagnose, prioritize, and simulate targeted recovery actions for failed transactions, subscription churn, abandoned checkouts, and overdue accounts.

────────────────────────────────────────────────────────────────────────────────

The Problem STARDUST Solves

In the digital transaction economy, revenue leakage represents a multi-billion dollar friction point. Businesses lose substantial revenue due to:

1. Passive Churn: Expired cards or bank issues cause automated subscription renewals to fail.

2. Friction/Decline Errors: Gateway failures, card limits, or network timeouts trigger payment declines.

3. Checkout Abandonment: Shoppers close browser tabs during payments, resulting in lost conversions.

4. Receivable Delinquency: Overdue invoices stall B2B accounts receivable processes.

STARDUST solves this by inserting APEX 1.0 (Autonomous Payment Recovery Engine) directly into transaction feeds, automatically assessing failure conditions and deploying targeted mitigation strategies through a controlled recovery workflow.

Demo/Sandbox: STARDUST currently simulates gateway events and recovery outcomes. It does not execute real customer payment captures.

────────────────────────────────────────────────────────────────────────────────

How STARDUST Works

STARDUST operates as an event-driven recovery coordinator.

Payment / Subscription / Invoice / Checkout Event

                    ↓

          APEX Event Ingestion

                    ↓

            Threat Detection

                    ↓

              Diagnosis

                    ↓

          Decision Engine

                    ↓

          Safety Rules

                    ↓

       Simulated Intervention

                    ↓

       Simulated Recovery

                    ↓

            Audit Trail

                    ↓

          Metrics Engine

                    ↓

       STARDUST Dashboard

────────────────────────────────────────────────────────────────────────────────

APEX 1.0 Ingress Pipeline

The APEX engine orchestrates recovery through the following processing phases:

1. Ingest & Detection (detector.js): Evaluates incoming transaction failures, validates structural details, and assigns a Threat Priority (High, Medium, Low) using a weighted matrix.

2. Diagnosis (diagnostician.js): Maps raw gateway failure codes to root-cause classifications such as INSUFFICIENT_FUNDS, CARD_EXPIRED, and NETWORK_ERROR.

3. Decision (decisionEngine.js): Allocates the recovery channel such as SMART_RETRY, PAYMENT_METHOD_UPDATE, and RECEIVABLES_CHASE. The decision process considers previous recovery attempts and can escalate cases when automated recovery should no longer continue.

4. Safety Gates (stoppingRules.js): Checks hard boundaries. Halts automated actions if the transaction has been recovered, manually closed, escalated, or retry limits have been exceeded. The maximum retry boundary is 3 attempts.

5. Simulated Recovery & Audit (recoveryEngine.js, auditTrail.js): Runs simulated recovery actions, records outcomes, builds a timeline (statusHistory), and preserves audit records to maintain a chronological history of the recovery process.

The overall APEX architecture follows:

DETECT → DIAGNOSE → DECIDE → SAFETY → RECOVER → AUDIT → METRICS

────────────────────────────────────────────────────────────────────────────────

Key Product Modules

1. Overview Dashboard: Unified command console displaying recovery chart lines, live activities, reactor core status pills, active cases grids, and timeline audit logs.

1. Case Details Drawer: Slide-over panel loading customer metadata, detailed explanations for each reasoning stage, audit history timestamps, and safe human action controls (Retry, Escalate, Close Case).

1. Search & Filters toolbar: Real-time filters allowing users to search customer names or filter lists by status, category, and threat level.

1. Support Escalation Modal: A compact helpdesk reporting dialog triggered from the bottom of the APEX Core status panel. Allows reviewers to select categories, submit problem logs, and confirm simulated delivery.

1. Targeted Product Tab Views:

2. Recovery: Displays dunning queues, channel strategy allocations, and overall success rates.

3. Payments: Details failed retail transaction recovery and gateway capture rates.

4. Subscriptions: Tracks renewal updates, card updater links, and subscription churn risk.

5. Invoices: Organizes overdue B2B receivables and automated invoice chasers.

6. Checkout: Monitors cart abandonment values and recovery rates.

7. Analytics: Charts chronological trends and provides failure category analysis.

────────────────────────────────────────────────────────────────────────────────

Razor AI

STARDUST includes Razor AI, an AI assistant integrated into the revenue recovery command center.

Razor AI can answer questions about the current STARDUST dashboard and APEX recovery system, including:

1. Active Cases

2. Escalated Cases

3. Recovery Rate

4. Recovered Revenue

5. Revenue at Risk

6. APEX recovery strategies and decisions

Example questions:

How many active cases are there?

What is the current recovery rate?

How much revenue is at risk?

How many cases are escalated?

What recovery strategies does APEX use?

Razor AI Architecture

STARDUST Dashboard

        ↓

    RazorAI.jsx

        ↓

   /api/razor-ai

        ↓

Node.js + Express

        ↓

     Groq API

        ↓

  Razor AI Response

The frontend sends the user's question together with available STARDUST dashboard context to the backend.

The backend securely communicates with the Groq API and returns the generated response.

The dashboard context includes Active Cases, Escalated Cases, Recovery Rate, Recovered Revenue, and Revenue at Risk.

The Groq API key remains on the backend and is not exposed through the frontend application.

Demo/Sandbox: Razor AI requires the Node.js backend to be running.

────────────────────────────────────────────────────────────────────────────────

Razorpay Integration Architecture

STARDUST communicates with Razorpay through a decoupled adapter service (razorpayAdapter.js):

1. Webhook Translators: Processes Razorpay-style webhook events such as payment.failed, subscription.charged, and invoice.expired, maps payloads, and normalizes currency by converting paise to INR.

1. Sandbox Fallback: The current demonstration environment uses simulated gateway payloads and recovery outcomes for safe testing without executing real customer payments.

1. API Routing & Proxy Security: Production payment processing requires secure server-side API routing so private credentials are not exposed to the client.

API Key Secret Security:

Private credentials such as RAZORPAY_KEY_SECRET must NEVER be prefixed with VITE_ or referenced in client-side bundles. Secrets must remain strictly configured on the backend/server environment to prevent key exposure in public client scripts.

────────────────────────────────────────────────────────────────────────────────

Tech Stack

1. Core: React 19, React DOM 19, Vite 8, JavaScript (ES6+).

2. Styling: Vanilla CSS (Fintech dark cinematic HUD).

3. Animations: Framer Motion.

4. Icons: Lucide React.

5. Backend: Node.js, Express, CORS, dotenv.

6. AI: Groq API.

7. Build: Vite production bundler.

────────────────────────────────────────────────────────────────────────────────

Local Setup Instructions

1. Installation

Clone the codebase and install package dependencies:

npm install

2. Environment Setup

Create the frontend environment file from the template.

On Windows:

copy .env.example .env

Inside .env, configure the Razorpay test credential placeholder if required:

VITE_RAZORPAY_KEY_ID=rzp_test_placeholder_key_id

Only use public/test configuration in the frontend. Private Razorpay credentials must remain server-side.

3. Razor AI Environment

Create a .env file inside the server directory:

server/.env

Add:

GROQ_API_KEY=your_groq_api_key

The Groq API key must remain server-side.

Never commit server/.env to GitHub.

4. Running Development Server

Start the Razor AI backend first:

npm run server

The backend runs on:

http://localhost:3001

You should see:

Razor AI backend running on http://localhost:3001

In a second terminal, start the frontend:

npm run dev

5. Build Production Bundling

Compile files for production deployment:

npm run build

The production build should complete without compilation errors.

────────────────────────────────────────────────────────────────────────────────

Demo Account Credentials

For testing and local verification:

Account Email: demo@stardust.com

Account Password: password

These credentials are intended for the demonstration environment.

────────────────────────────────────────────────────────────────────────────────

Simulation Features

Run APEX Simulation

The Run APEX Simulation action feeds predefined revenue-risk cases into the APEX engine.

The simulation can demonstrate scenarios involving:

1. Payment failures

2. Insufficient funds

3. Expired payment methods

4. Network errors

5. Subscription failures

6. Checkout abandonment

7. Overdue invoices

8. Retry-limit scenarios

The case then moves through the APEX workflow:

Detection

    ↓

Diagnosis

    ↓

Decision

    ↓

Safety

    ↓

Recovery Simulation

    ↓

Audit

    ↓

Metrics

Simulate Gateway Event

The Simulate Gateway Event action feeds simulated Razorpay-style webhook payloads through the adapter layer.

This demonstrates how external gateway events can be normalized before entering the APEX pipeline.

────────────────────────────────────────────────────────────────────────────────

Limitations & Future Roadmap

1. Mock Gateways: Direct gateway integrations are currently demonstrated using simulated/sandbox events. Live processing requires secure server-side payment controllers and verified webhook handling.

1. Persistence: Active state is stored in-memory; future updates can introduce database-backed persistence across sessions.

1. Automatic Updating: Future production integration can introduce real Card Updater APIs to automate expired credential resolution.

1. Production AI: Razor AI currently requires the configured Groq backend. Production deployment would require secure secret management, authentication, rate limiting, and monitoring.

1. Production Recovery: Real payment recovery would require secure server-side execution and appropriate payment-provider authorization.

────────────────────────────────────────────────────────────────────────────────

Security Considerations

The project separates frontend-visible configuration from backend secrets.

Never commit:

.env

server/.env

Never expose:

GROQ_API_KEY

RAZORPAY_KEY_SECRET

Private API credentials must remain on the backend.

For production deployment, additional controls such as webhook signature verification, authentication, rate limiting, secure secret storage, and server-side payment execution should be implemented.

────────────────────────────────────────────────────────────────────────────────

Project Architecture

src/

│

├── agent/

│   ├── apexEngine.js

│   ├── detector.js

│   ├── diagnostician.js

│   ├── decisionEngine.js

│   ├── stoppingRules.js

│   ├── recoveryEngine.js

│   ├── auditTrail.js

│   └── metrics.js

│

├── components/

│   └── dashboard/

│       └── Dashboard.jsx

│

├── services/

│   └── razorpayAdapter.js

│

├── RazorAI.jsx

├── RazorAI.css

│

└── server/

    └── ai.js

────────────────────────────────────────────────────────────────────────────────

Design Philosophy

STARDUST follows a simple principle:

“Detect the revenue threat, understand why it happened, choose the safest recovery path, stop when automation should stop, and preserve every decision in an auditable timeline.”

APEX provides the decision pipeline.

STARDUST provides the command center.

Razor AI provides the conversational interface.

Together they form a unified revenue recovery intelligence system.

────────────────────────────────────────────────────────────────────────────────

Project Status

STARDUST APEX 1.0 — Demonstration / Sandbox

Implemented components:

1. APEX event detection

2. Revenue-risk prioritization

3. Root-cause diagnosis

4. Recovery strategy selection

5. Retry attempt tracking

6. Safety stopping rules

7. Recovery simulation

8. Audit records

9. Derived revenue metrics

10. Razorpay-style webhook simulation

11. STARDUST command center dashboard

12. Razor AI backend integration

13. Groq-powered AI responses

14. Production build verification

The architecture is designed so that the simulated gateway and recovery layers can later be replaced with production server-side integrations without redesigning the core APEX decision pipeline.

