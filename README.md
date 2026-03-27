<div align="center">
  <img src="public/logo.png" alt="NextStepAI Logo" width="200"/>
  <h1>🌟 NextStepAI Platform</h1>
  <p><em>A professional-grade SaaS application designed for career acceleration</em></p>

  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostgreSQL-336791?style=flat&logo=postgresql)](https://postgresql.org/)
  [![Google Gemini AI](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=flat&logo=google)](https://ai.google.dev/)
  [![Vapi.ai](https://img.shields.io/badge/Voice%20AI-Vapi-teal?style=flat)](https://vapi.ai/)
</div>

<hr />

<details open>
  <summary><h2>📖 Table of Contents</h2></summary>

  - [1. Project Overview](#1-project-overview)
  - [2. Feature Analysis and User Flow](#2-feature-analysis-and-user-flow)
  - [3. Technology Stack & Implementation](#3-technology-stack--implementation)
  - [4. Project Directory Structure](#4-project-directory-structure)
  - [5. Glossary of Terms](#5-glossary-of-terms)
  - [6. Comprehensive Quiz](#6-comprehensive-quiz)
  - [7. Getting Started](#7-getting-started)

</details>

---

## 1. Project Overview
**NextStepAI** is a dual-purpose platform that integrates an **AI Interview Coach** with a suite of professional growth tools known as NextStepAI. The platform aims to provide an end-to-end solution for job seekers and professionals by offering realistic interview practice, resume optimization, and automated networking tools.

### Core Platform Components:
*   🎙️ **AI Interview Coach:** Provides realistic practice and multi-dimensional feedback.
*   🚀 **NextStepAI Suite:** Includes tools for building resumes, drafting professional emails, and tracking industry trends.

---

## 2. Feature Analysis and User Flow

### A. Navigation and Insights
The platform features a Navigation Header that provides immediate access to market intelligence:
*   **Industry Insights:** Displays market data including field growth, future scope, and average salaries.
*   **Automation:** Data is updated weekly via background cron jobs (Inngest or GitHub Actions).
*   **Growth Tools Dropdown:** Centralized access to the Resume Builder, Email Drafter, and Interview Prep.

### B. Growth Tools Suite
| Tool | Primary Function | Workflow/Mechanism |
| :--- | :--- | :--- |
| **Advanced Resume Builder** | Professional document creation | 1. Input fields (LinkedIn, experience, projects).<br>2. "Polish" via Gemini AI for professional language.<br>3. Live canvas editing.<br>4. Save to PostgreSQL; export via html2pdf.js. |
| **Smart Email Drafter** | Networking and follow-ups | 1. Context input (Company, title, description).<br>2. Personalization using saved user profile data.<br>3. One-click generation of professional cold emails. |
| **AI Interview Preparation** | Skill assessment and coaching | 1. Quiz: Identifies "Weak" vs. "Strong" areas; provides knowledge score.<br>2. Real-Time Interview: Custom topics/difficulty/tone via typed or voice-to-text (Web Speech API). |

### C. Performance Feedback and Analytics
The Performance Dashboard serves as the user's central hub for progress tracking:
*   📈 **Growth Graph:** Uses Recharts to visualize interview score improvements over time.
*   🔥 **Skill Heatmap:** Identifies technical gaps based on quiz and interview performance.
*   📚 **Unified History:** Centralized repository for all past transcripts and results.
*   🎯 **Scoring Metrics:** Interviews are rated on **Communication** (clarity/pace), **Technical** (accuracy/depth), and **Behavioral** (tone/confidence) scores.

---

## 3. Technology Stack & Implementation

<details>
  <summary>Click to view details of the Tech Stack.</summary>

| Technology | Category | How It's Used / Integrated | Key Benefits |
| :--- | :--- | :--- | :--- |
| **Next.js 15** | Core Framework | Backbone of the application. Handles routing, API routes, server-side logic. | Full-stack development, SEO, high performance. |
| **React 19** | Frontend Library | Manages the UI via components and hooks for state/effects. | Reusable components, declarative UI. |
| **PostgreSQL** | Database | Primary data store for profiles, resumes, and interview sessions. | Data integrity, ACID compliance. |
| **Prisma ORM** | Database Toolkit | Connects Next.js to PostgreSQL; provides type-safe queries. | Reduces boilerplate, easy migrations. |
| **Google Gemini AI**| AI Model | Generates questions, analyzes answers, polishes text, and drafts emails. | Fast inference, JSON mode for structured data. |
| **Vapi.ai** | Voice AI | Manages microphone streams and speech-to-text for interviews. | Low-latency voice streaming. |
| **Inngest** | Background Jobs | Runs background functions (e.g., weekly industry insights) without blocking UI. | Serverless queues, durable execution. |
| **Clerk** | Authentication | Manages sign-up, login, and social auth. | Secure, maintenance-free authentication. |
| **Tailwind CSS** | Styling | Utility classes for rapid, consistent UI development. | Small bundle size, highly customizable. |
| **shadcn/ui** | UI Component Library | Accessible building blocks (modals, accordions) styled with Tailwind. | WAI-ARIA compliance. |
| **React Hook Form & Zod** | Form Handling | Manages form state and validates input against schemas. | Type-safe validation, performance. |
| **Recharts** | Data Visualization | Creates Growth Graphs and Skill Heatmaps. | Composable, responsive charts. |
| **Sonner** | Toast Notifications | Temporary feedback for user actions (e.g., "Resume Saved"). | Simple API, non-intrusive. |
| **date-fns** | Date Manipulation | Formats dates for user-friendly display. | Modular, tree-shakable. |
| **html2pdf.js** | PDF Generation | Converts HTML resumes to downloadable PDF files. | Client-side only; no server load. |

</details>

---

## 4. Project Directory Structure
```text
├── actions/                  # Server Actions (Backend Logic)
│   ├── interview-ai.js       # Gemini Integration Logic
│   ├── interview-sessions.js # DB Operations for Interviews
│   ├── user.js               # User Profile Management
│   └── ...                   # (Other action files)
│
├── app/                      # Next.js App Router (Routes & Pages)
│   ├── (auth)/               # Auth Routes (Clerk Group)
│   │   ├── sign-in/          # Login Page
│   │   └── sign-up/          # Registration Page
│   │
│   ├── (main)/               # Core Application Layout Group
│   │   ├── ai-cover-letter/  # Feature: Cover Letter Generator
│   │   ├── dashboard/        # Main User Dashboard
│   │   ├── interview/        # Feature: AI Interview Mode
│   │   ├── onboarding/       # New User Setup Flow
│   │   └── resume/           # Feature: Resume Builder
│   │
│   ├── api/                  # Backend API Endpoints
│   │   └── inngest/          # Webhook Handler for Background Jobs
│   │
│   ├── layout.js             # Root Layout (Fonts, metadata)
│   ├── page.js               # Landing Page (Home)
│   └── globals.css           # Global Styles & Tailwind Directives
│
├── components/               # Reusable UI Components
│   ├── ui/                   # Radix+Tailwind Atoms (Button, Card, Input)
│   ├── header.jsx            # Main Navigation Header
│   ├── hero.jsx              # Landing Page Hero Section
│   └── theme-provider.jsx    # Dark Mode Context Provider
│
├── hooks/                    # Custom React Hooks
│   ├── useVapiInterview.js   # Voice Interview State & Logic
│   └── use-fetch.js          # Custom Data Fetching Hook
│
├── lib/                      # Libraries, Utils & Configs
│   ├── inngest/              # Inngest Background Job Defs
│   │   ├── client.js         # Inngest Client Setup
│   │   └── functions.js      # Business Logic (e.g., Cron Jobs)
│   ├── prisma.js             # Singleton DB Client Instance
│   ├── utils.js              # Helper Functions (cn, clsx)
│   └── checkUser.js          # Sync Clerk User with DB
│
├── prisma/                   # Database Configuration
│   ├── schema.prisma         # Data Models (User, Assessment, etc.)
│   └── migrations/           # SQL Migration History
│
├── public/                   # Static Assets
│   ├── logo.png              # App Logo
│   └── banner.jpeg           # Hero Banner Images
│
├── .env                      # Environment Variables (Secrets)
├── middleware.js             # Clerk Auth Middleware
├── next.config.mjs           # Next.js Configuration
├── package.json              # Project Dependencies & Scripts
├── tailwind.config.mjs       # Tailwind CSS Configuration
└── README.md                 # Project Documentation
```

---

## 5. Glossary of Terms

<dl>
  <dt><b>ACID Compliance</b></dt>
  <dd>A set of properties (Atomicity, Consistency, Isolation, Durability) that guarantee database transactions are processed reliably.</dd>

  <dt><b>Cron Job</b></dt>
  <dd>A time-based job scheduler used to run tasks automatically at fixed intervals.</dd>

  <dt><b>Inference</b></dt>
  <dd>The process of using a trained AI model (like Gemini) to make predictions or generate content based on new input.</dd>

  <dt><b>JSON Mode</b></dt>
  <dd>A configuration for AI models that ensures the output is formatted as structured JSON for easier programmatic use.</dd>

  <dt><b>Middleware</b></dt>
  <dd>Code that runs before a request is completed, used here by Clerk to manage authentication and sessions.</dd>

  <dt><b>ORM (Object-Relational Mapping)</b></dt>
  <dd>A technique (used by Prisma) that allows developers to query and manipulate a database using an object-oriented paradigm.</dd>

  <dt><b>SaaS (Software as a Service)</b></dt>
  <dd>A software distribution model where a third-party provider hosts applications and makes them available to customers over the internet.</dd>

  <dt><b>Server Actions</b></dt>
  <dd>Functions that run on the server but can be called from the client, a core feature of Next.js for handling logic like database updates.</dd>

  <dt><b>Type-Safe</b></dt>
  <dd>A programming feature (often involving TypeScript or Zod) that prevents errors by ensuring data matches specific formats and types.</dd>
</dl>

---
 

## 6. Getting Started
<details>
  <summary><b>Installation & Setup Guide</b></summary>
  <br/>

  1.  **Clone the repository:**
      ```bash
      git clone <repository-url>
      cd ai-career-coach
      ```
  2.  **Install dependencies:**
      ```bash
      npm install
      ```
  3.  **Set up environment variables:**
      Create a `.env` file in the root directory and fill in the variables.
      - `DATABASE_URL`
      - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
      - `CLERK_SECRET_KEY`
      - `GEMINI_API_KEY`
  4.  **Database Setup:**
      ```bash
      npx prisma db push
      ```
  5.  **Run Development Server:**
      ```bash
      npm run dev
      ```
  6.  **Run Inngest (Background Jobs UI):**
      Open a new terminal window and run:
      ```bash
      npx inngest-cli@latest dev
      ```
</details>

<div align="center">
  <sub>Built with ❤️ by the Roshan Awari</sub>
</div>
