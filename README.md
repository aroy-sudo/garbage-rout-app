# 🌿 EcoRoute: State Logistics & Waste Management Platform
### *Empowering Rural Self-Help Groups, Enforcing EPR Compliance, and Optimizing Waste Logistics across Chhattisgarh*

---

## 👨‍💻 Author Attribution
**Built by Abhiraj Roy (CSE)**  
*Department of Computer Science & Engineering, IT Stream*

---

## 📌 Executive Summary

### 🛑 The Problem
Rural waste collection in Chhattisgarh has historically been **blind, unstructured, and highly fuel-inefficient**. Local authorities lacked visibility into actual trash accumulation, leading to trucks driving long distances for minimal waste. Concurrently, rural workers (Self-Help Groups/SHGs) faced transparency gaps in payouts, while state compliance bodies struggled to verify plastic collection proofs for **Extended Producer Responsibility (EPR)** credits.

### 🚀 The Solution
**EcoRoute** is a state-of-the-art Next.js 16 Web Platform designed to streamline regional waste logistics and enforce compliance. By merging state-level **Chhattisgarh Local Government Directory (LGD)** hierarchies with spatial mathematics and automated compliance layers, EcoRoute transforms environmental management into a transparent, secure, and route-optimized system.

---

## ⚡ Key Features (The "Wow" Factor)

### 📡 Offline-First Architecture
*   Fully optimized mobile PWA (Progressive Web App) capabilities.
*   Enables field collectors to log coordinate checkpoints and storage weights even in remote regional areas with spotty network coverage.

### 🗺️ State LGD Integration
*   Integrated mapping for Chhattisgarh’s administrative hierarchy: **District ➔ Block ➔ Panchayat ➔ Village**.
*   Restricts inputs and maps locations using database constraints to guarantee standardized reports.

### 🧠 Routing Intelligence
*   **Spatial Waypoint Clustering:** Groups nearby pickup requests using Turf.js centroids to reduce waypoints before hitting OpenRouteService APIs.
*   **Monsoon Waterlogging Multipliers:** Adjusts expected waste weight by **1.25x** during monsoon months (June-September) to account for wet, waterlogged plastics.
*   **Fuel-Saving Thresholds:** Filters out unprofitable pickups under **10kg** to prevent unnecessary travel.

### 🎙️ Bilingual Voice UI
*   Accessible regional speech-to-weight entry for SHG workers.
*   Converts spoken weight entries (Hindi, Chhattisgarhi, English) into digital metrics using Groq and Whisper API transcriptions.

### 💰 Transparent PR (Plastic Rupee) Wallet
*   Dynamic financial ledger showing live weight summaries and real-time earnings mapped to precise ₹/kg rates.
*   Establishes complete trust and motivation for rural collectors.

### 📸 EPR Photo Verification
*   Mobile-native camera interface forcing drivers to capture **live, rear-facing geofenced photos** of waste at drops.
*   Secures images directly inside Supabase Storage Buckets to enforce strict compliance proof.

### 📊 Executive Dashboard & Export APIs
*   Live geographic waste density maps using custom-scaled Leaflet `CircleMarker` points.
*   Fully secure integration APIs supporting CSV/JSON exports protected by token headers (`x-api-key`).

---

## 🛠️ Tech Stack

EcoRoute is built using the most robust, state-of-the-art modern stack available:

*   **Framework:** Next.js 16 (App Router) with React 19
*   **Styling & UI:** Tailwind CSS, shadcn/ui, Lucide Icons, and Phosphor React
*   **Database & Storage:** Supabase (PostgreSQL, Storage Buckets, and Row Level Security)
*   **Geospatial Processing:** React-Leaflet, Leaflet, and Turf.js (`@turf/turf`)
*   **Audio Transcription:** Web Audio API, Groq Cloud, and Whisper Large v3
*   **Languages:** TypeScript & NextJS Server Actions

---

## 💻 Local Setup Instructions

Follow these clear steps to run the EcoRoute environment locally.

### 1️⃣ Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/aroy-sudo/garbage-rout-app-main.git
cd garbage-rout-app-main

# Install production and development dependencies
npm install
```

### 2️⃣ Configure Environment Variables
Create a `.env.local` file in the root directory and specify the following variables:
```env
# Supabase Authentication and Database Details
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenRouteService API Integration
ORS_API_KEY=5b3ce3597851110001cf6248...

# Groq Cloud API Key (Bilingual Transcription Engine)
GROQ_API_KEY=gsk_y256bV...

# State API Key Authentication
INTEGRATION_API_KEY=cg_epr_secure_prod_key_2026
```

### 3️⃣ Seed the LGD Database Hierarchy
EcoRoute relies on seeded regional location tables matching the official local Chhattisgarh directory. Run the seed script:
```bash
npx tsx scripts/seed-locations.ts
```

### 4️⃣ Start the Local Development Server
Launch the server to verify the system locally:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your browser to view the interactive portal.

---

## 📂 Project Architecture

```
garbage-rout-app/
├── app/
│   ├── actions/                   # Next.js Server Actions (Database and Files)
│   │   ├── admin-actions.ts       # Executive Heatmap and Stats Fetcher
│   │   ├── location-actions.ts    # LGD Directory Hierarchical Actions
│   │   └── verification-actions.ts# EPR Storage Upload Actions
│   ├── api/                       # API Route Endpoints
│   │   ├── integration/v1/export/ # Standard CSV Integration API
│   │   └── transcribe/            # Voice Transcription Endpoint
│   └── dashboard/
│       └── admin/                 # Admin Dashboard Pages
├── src/
│   ├── components/                # React Map and UI Components
│   │   ├── AdminHeatmap.tsx       # Leaflet Spatial Density Component
│   │   ├── LocationSelector.tsx   # LGD Hierarchy Selector
│   │   └── PhotoProofCapture.tsx  # Mobile Geofenced Camera component
│   └── hooks/
│       └── useVoiceRecorder.ts    # Native Voice UI audio recorder hook
```

---
*EcoRoute is fully type-safe, validated by ESLint, and optimized to protect our environment while elevating rural livelihoods. Developed for Chhattisgarh State Urban Development Agency (SUDA) and EPR Corporations.*
