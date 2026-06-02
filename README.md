# 🌍 EcoRoute: State-Level Logistics & Rural Waste Management Engine

> **An AI-optimized, offline-first routing platform designed for the Extended Producer Responsibility (EPR) framework.**

**Architected and Built by Abhiraj Roy (CSE)**

---

## 1. Executive Summary

### The Operational Challenge
Rural waste management frameworks currently operate entirely blind. Vehicles are dispatched on static schedules without any real-time data regarding actual waste accumulation at the village level. This structural inefficiency leads to massive fuel wastage, exorbitant logistical overhead for rural panchayats, and severely limits the financial compensation available to Self-Help Group (SHG) workers due to poor route density and collection volume.

### The EcoRoute Solution
EcoRoute digitizes the entire rural waste pipeline from the localized village panchayat level up to the state administrative dashboard. By shifting from reactive collection to proactive, AI-driven dispatching, EcoRoute mathematically minimizes fuel consumption while maximizing collection density. The platform bridges the digital literacy gap with accessible voice interfaces and ensures uncompromising data availability in remote zones via offline-first edge architecture.

---

## 2. System Architecture

EcoRoute is engineered on a modern, highly scalable technology stack designed to handle thousands of concurrent geographic queries and real-time state updates:

- **Frontend / Edge Layer:** Built on **Next.js 16 (App Router)** and **React**. The user interface utilizes **Tailwind CSS** and **shadcn/ui** to deliver a premium, glassmorphism-inspired aesthetic. The application is configured strictly as a Progressive Web App (PWA) with aggressive edge caching for offline availability.
- **Backend / Database Layer:** Powered by **Supabase (PostgreSQL)**. Data isolation and multi-tenant security are enforced at the database level using strict Row Level Security (RLS) policies. **Supabase Storage** securely hosts geofenced photo proofs required for EPR compliance.
- **Spatial / Routing Engine:** Integrates **OpenRouteService (ORS)** for robust geographic pathing and turn-by-turn navigation data. Client-side spatial clustering and geographic processing are handled by **Turf.js**.
- **AI / Voice Integration:** Utilizes the **Groq/Whisper API** pipeline to provide instantaneous, highly accurate localized voice-to-text processing for SHG workers.

---

## 3. Core Technical Innovations (Deep Dive)

### 🧠 CVRP Auto-Dispatch Algorithm
At the core of EcoRoute's logistical efficiency is its solution to the Capacitated Vehicle Routing Problem (CVRP). Instead of relying on human dispatchers, the platform utilizes **Turf.js** to perform dynamic geographic partitioning. When a dispatch is triggered, the engine calculates the spatial distances between all pending waste nodes (using Haversine formulas) relative to the depot. It then auto-clusters these nodes into highly optimized, localized routes, locking the assignment the moment the cumulative weight approaches the strict 400kg vehicle capacity limit, ensuring vehicles never exceed legal thresholds while minimizing empty-load mileage.

### 🗺️ LGD (Local Government Directory) Standardization
To ensure seamless integration with Indian governmental databases, EcoRoute implements rigorous LGD standardization. The platform maps incoming geographic coordinates through a highly structured JSON hierarchy—translating raw lat/long data into exact **District -> Block -> Panchayat -> Village** standard identifiers. This deterministic resolution guarantees that state executives view data partitioned by official administrative boundaries, ensuring strict data compliance and operational reporting accuracy.

### 📡 Offline-First Field Operations
Recognizing the reality of unpredictable network connectivity in rural Chhattisgarh, the application architecture relies heavily on service workers and local caching. SHG workers can continue to log waste accumulations, interact with the UI, and queue transactions even in complete dead zones. Once connectivity is restored, the Next.js edge runtime automatically synchronizes the localized state with the PostgreSQL backend, ensuring zero data loss and uninterrupted field operations.

### 🎙️ Bilingual Voice UI
Digital literacy and hardware familiarity are significant barriers for rural SHG workers. EcoRoute mitigates this by replacing complex form inputs with a highly accessible Voice UI. Workers can simply speak their inputs (e.g., "Pachis kilo"), and the platform securely proxies the audio blob to the Groq/Whisper API for localized, bilingual transcription. This transforms raw speech into structured numeric data points instantly, drastically lowering the barrier to entry for platform adoption.

### 💰 PR Wallet Economics
EcoRoute features a real-time Transparent PR (Plastic Recovery) Wallet system. This financial ledger operates synchronously with the collection database. As soon as a collector captures EPR-compliant proof and finalizes a pickup transaction, the system dynamically maps the exact kg-collected (separated precisely into PET, HDPE, LDPE, and PP sub-weights) to a direct ₹/kg monetary valuation. This instantaneous financial visibility ensures transparent compensation tracking for SHG workers.

---

## 4. API Documentation (EPR Integration)

EcoRoute provides a secure, structured export endpoint designed specifically for corporate Extended Producer Responsibility (EPR) sponsors to ingest compliance data into their internal analytics systems.

### Secure CSV Export Endpoint
- **Endpoint:** `GET /api/integration/v1/export`
- **Description:** Returns a fully flattened CSV ledger of all completed waste collections. The export merges raw collection sub-weights with precise Chhattisgarh LGD administrative hierarchy data and Supabase Storage photo proof URLs.
- **Authentication:** Requires a custom API token passed via headers.
  - **Header:** `x-api-key`
  - **Value:** Configured via `INTEGRATION_API_KEY` environment variable.

#### Output Structure (CSV Columns)
The returned CSV includes the following deterministic data points:
- `Collection ID`, `Date of Collection`
- Administrative Routing: `District Name`, `District LGD Code`, `Block Name`, `Block LGD Code`, `Panchayat Name`, `Panchayat LGD Code`, `Village Name`, `Village LGD Code`
- Material Segregation: `PET Weight (kg)`, `HDPE Weight (kg)`, `LDPE Weight (kg)`, `PP Weight (kg)`, `Total Weight (kg)`
- Compliance Verification: `EPR Compliance Status`, `Proof Image URL`

---

## 5. Local Development & Setup

To evaluate the platform locally, follow these technical setup procedures:

### Step 1: Install Dependencies
Ensure you are running a modern Node.js environment.
```bash
npm install
```

### Step 2: Configure Environment Variables
Create a `.env.local` file in the repository root and map your Supabase instance credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Step 3: Seed Realistic Demo Data
Populate the PostgreSQL database with a highly realistic, Turf.js-spaced matrix of waste accumulation nodes centered around the Durg/Bhilai administrative region.
```bash
npm run seed:demo
```

### Step 4: Initialize the Edge Server
Launch the Next.js development server.
```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to interface with the platform.
