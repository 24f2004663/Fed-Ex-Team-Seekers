# FedEx Smart Recovery: AI-Driven Debt Collection & Allocation Engine

## 🚀 Problem Statement
In the traditional logistics and supply chain debt recovery process, **allocating delinquent accounts to collection agencies is often manual, biased, and inefficient.**

### Key Challenges:
1.  **Inefficient Allocation**: Assigning cases based on simple round-robin or manual preference fails to optimize for agency strengths (e.g., some agencies are better at high-value feedback, others at volume).
2.  **Lack of Real-Time Visibility**: Managers struggle to track "Promise to Pay" (PTP) commitments vs. actual recoveries in real-time across multiple external partners.
3.  **SLA Breaches**: Without automated monitoring, cases sit idle ("ghosting") for too long, reducing the likelihood of recovery as debt ages.
4.  **No Performance Incentives**: "Flat" allocation strategies don't reward high-performing agencies with better quality leads (High Priority cases).

---

## 💡 The Solution: FedEx Smart Recovery
We have built an **Intelligent Allocation Command Center** that acts as the brain between FedEx's outstanding invoices and the network of external collection agencies.

### Core Modules:

### 1. The Allocation Engine (Python + SQLite WAL)
Instead of random assignment, our system uses a **weighted, performance-based algorithm**:
*   **Performance Scoring**: Agencies are scored (0-100%) based on Recovery Rate and SLA Adherence.
*   **Dynamic Capacities**:
    *   **Alpha Collections**: Proven high-performer (Capacity: 4).
    *   **Beta Recovery**: Mid-tier performer (Capacity: 5).
    *   **Gamma Partners**: Probationary/New (Capacity: 3).
*   **Smart Tiering**:
    *   **High Priority Cases** (> $50k) are **exclusively** routed to agencies with >80% performance scores.
    *   **Low Performance Penalty**: Agencies dropping below 50% are cut off from High Priority allocations automatically.

### 2. The Agency Portal
A specialized interface for external partners to view their work without accessing sensitive FedEx internal data.
*   **Actions**: "Accept", "Reject", "Upload Proof", "Log Promise to Pay".
*   **Capacity Analysis**: A real-time dashboard showing their 12-month performance trend and their current **High Priority Allowance**. This gamifies the process—agencies know if they improve their score, they get better cases.
*   **Demo Safety**: Robust error handling ensures the portal works fluidly even under high load.

### 3. Automated Governance
*   **SLA Watchdog**: Background processes monitor "Assigned" cases. If an agency sits on a case for >48 hours without action, it is **automatically revoked** and reallocated to a competitor.
*   **Race-Condition Safe**: Built with transactional integrity (SQLite WAL mode + Next.js Server Actions) to handle concurrent updates without data loss.

---

## 🛠️ Technology Stack
*   **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide Icons.
*   **Backend Logic**: Next.js Server Actions + Python Subprocesses (Interoperability Layer).
*   **Database**: SQLite (with Write-Ahead Logging for concurrency).
*   **Visualization**: Recharts (for Analytics & Historical Trends).

## ✅ Key Features
- [x] **Smart Ingestion**: Import raw Excel/CSV data and instantly classify priority (High/Medium/Low).
- [x] **Ghost Behavior Prevention**: Immediate UI updates using React Optimistic updates and enforced server revalidation.
- [x] **Conflict-Free Concurrency**: Python scripts and Node.js server actions share a database safely using robust locking strategies.
- [x] **Executive Dashboard**: A "Single Pane of Glass" view for FedEx Managers to see Total Exposure, Recovery Rate, and Live Agency Performance.
