<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/activity.svg" alt="HepatoScope Logo" width="100" />
  <h1 align="center">HepatoScope</h1>
  <p align="center">
    <strong>An AI-powered predictive medical SaaS platform for liver risk analysis.</strong>
    <br />
    Next.js 15 • Supabase • Ollama AI • TailwindCSS v4 • Shadcn UI • Recharts
  </p>
  <p align="center">
    <a href="#features">Features</a>
    ·
    <a href="#architecture">Architecture</a>
    ·
    <a href="#installation">Installation</a>
    ·
    <a href="#usage">Usage</a>
  </p>
</div>

<hr />

## 🌟 Overview

**HepatoScope** is a comprehensive diagnostic support platform designed for healthcare professionals. Inspired by top-tier medical software, it provides **Doctors** with non-invasive, AI-driven insights from patient Liver Function Tests (LFTs), and presents **Patients** with an easy-to-understand portal tracking their hepatic health trends securely.

The application computes mathematical severity formulas natively and synthesizes medical language utilizing on-demand Large Language Models (LLMs)—generating a beautifully tailored report entirely exportable to physical PDF prescriptions.

## ✨ Core Features

### 🛡️ Secure Closed-Loop Identity
- **Three-Tier Architecture:** Admin, Doctor, and Patient roles, tightly controlled with Supabase Row-Level Security (RLS).
- **Admin Governance:** Patients cannot register themselves. Only validated Administrators can onboard doctors and assign patients under their care.

### 🧠 Real-Time Clinical Analysis Engine
- **Live Risk Preview:** As a doctor inputs LFT biomarkers (Total Bilirubin, SGOT, SGPT, Albumin), an analytic grid actively recalculates a deterministic risk multiplier (Low, Moderate, High, Critical) using standard clinical bounds.
- **AI Synthesis (Ollama):** At the click of a button, the system bundles the biometric data and risk factors to a secure local Ollama AI model (e.g., Llama3/Mistral), which outputs a polished, professional medical summary without sending patient data to public tech networks.

### 🎨 Premium Visual Identity
- **Glassmorphism & Micro-animations:** Framer Motion-powered page transitions, skeleton loaders, and interactive card hovers.
- **Data Visualization:** Actionable KPIs built dynamically with customized Recharts plotting historical patient trends over time.
- **Export Control:** Deep integration to parse and render native standard prescriptions via single-click PDF downloads.

---

## 🏗️ Architecture & Tech Stack

| Domain | Technology | Description |
|---|---|---|
| **Frontend Framework** | `Next.js 15 (App Router)` | React ecosystem optimized with Server Components and Layouts. |
| **Backend & Auth** | `Supabase` | PostgreSQL schema w/ highly-configured RLS policies & JWT magic. |
| **Machine Learning** | `Ollama` | Local LLMs for complete HIPAA-compliant privacy analysis. |
| **Styling** | `Tailwind CSS 4.0` | Next-generation ultra-fast CSS framework. |
| **UI Components** | `shadcn/ui` + `Lucide` | Accessible, highly-customizable atomic Radix unstyled components. |
| **Animations** | `framer-motion` | Spring and fade transitions across grids. |

---

## 🚀 Installation & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/udayvemula611-maker/hepatoscope-liver-risk-analysis.git
cd hepatoscope-liver-risk-analysis
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root utilizing your Supabase project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
OLLAMA_BASE_URL=http://localhost:11434 # Local or Cloud Ollama API endpoint
OLLAMA_MODEL=mistral # Or your preferred medical model
```

### 4. Database Setup (Supabase)
Run the provided SQL scripts located within `/scripts` sequentially in your Supabase SQL Editor.
- Start with standard table generation.
- Enforce RLS (`supabase_setup.sql`).
- Execute Phase 12 Updates (Doctor assignments, patient metrics).

### 5. Run the Application
```bash
npm run dev
```
Open `http://localhost:3000` to view the application.

---

## 👨‍⚕️ User Roles & Views

- **Administrator (`/admin`)**: Manages the platform, creates new doctor and patient accounts, and matches them. Displays a global statistical view of the hospital systems total reports.
- **Doctor (`/doctor`)**: Views assigned patients, manages LFT reports through interactive Dual-Panel analysis forms, commands the AI engine, sets follow-ups, and downloads dynamic PDFs.
- **Patient (`/patient`)**: Minimalist interface. Tracks past reports, views real-time diagnostic risk graphs, and downloads prescription advice uploaded by their assigned doctors.

---

