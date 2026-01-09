# FedEx Smart Recovery - Detailed Project Documentation

This document provides a comprehensive breakdown of the application, detailing every component, user interaction, and underlying algorithm. The system is designed to automate debt recovery using AI scoring, intelligent allocation, and a collaborative agency portal.

---

## Part 1: Enterprise Dashboard (Admin View)

The Enterprise Dashboard is the command center for FedEx managers to oversee the entire debt recovery operation. It provides high-level metrics, real-time alerts, and granular control over case assignments.

### 1.1 Login Screen
*   **Role Switcher**: Two distinct tabs at the top allow selecting the user persona:
    *   **Enterprise Admin**: For FedEx internal managers.
    *   **Agency Partner**: For external collection agencies.
*   **Credentials**: The system provides pre-filled "Demo Credentials" for ease of access (e.g., `admin` / `admin@123`).
*   **Visuals**: The background features a glassmorphism effect with animated gradient orbs (purple and orange) to align with the premium design aesthetic.

### 1.2 Header Area
*   **Title**: Displays "FedEx Smart Recovery" with the tagline "AI-Driven Debt Collections Command Center".
*   **Import Action (Dropdown)**:
    *   A primary action button located in the top-right.
    *   **"Import CSV"**: Simulates uploading a raw debt file. Triggers the Python Ingestion Algorithm (see Part 3).
    *   **"Run Allocation"**: Manually triggers the distribution of queued cases to agencies.
    *   **"Reset Demo"**: Clears the database and reseeds it with fresh data for a clean demonstration.
*   **Logout Button**: Securely ends the session and returns the user to the Login screen.

### 1.3 KPI Metrics Grid
Four prominent cards display critical financial health indicators:
1.  **Total Exposure**: The sum of all outstanding invoice amounts (e.g., `\$254,000`). Includes a trend indicator (e.g., `+12% vs last month`).
2.  **High Priority Cases**: A count of cases flagged as 'HIGH' priority. Displayed in red to demand immediate attention.
3.  **Recovery Rate**: The percentage of debt successfully collected. Displayed in green with a target benchmark (e.g., `Target: 65%`).
4.  **Avg DSO (Days Sales Outstanding)**: The average time taken to collect payment. Includes an improvement metric (e.g., `-3 days improvement`).

### 1.4 Live Activity Monitor
A split-view section monitoring real-time operational status:
*   **Agency Performance Card**:
    *   Lists all partner agencies (Alpha, Beta, Gamma).
    *   Displays their current performance score (e.g., `92%` for Alpha).
    *   Color-coded scores (Green/Yellow/Orange) indicate health statuses like "Established" or "Probationary".
*   **SLA Breaches Card**:
    *   Alerts the manager to specific invoices that have exceeded their time limit.
    *   Shows the Invoice Number (e.g., `INV-2025-001`) and the breach duration (e.g., `-2h`).
    *   Includes "Warning" badges for cases approaching their deadline.

### 1.5 Intelligent Priority Queue (Main Table)
A detailed data table listing all active debt cases. Columns include:
*   **Invoice**: The unique identifier (e.g., `INV-2026-001`).
*   **Amount**: The currency value of the debt.
*   **Days Overdue**: Calculated based on the invoice due date.
*   **Agency**: Shows the currently assigned agency (e.g., "Alpha Collections") or "TBD" if queued.
*   **AI Score**: A visual progress bar and numerical score (0-100) representing the likelihood of recovery (see Part 3).
*   **Priority**: A badge (High/Medium/Low) derived from the AI score.
*   **Status**: Current state of the case (`QUEUED`, `ASSIGNED`, `WIP`, `PTP`, `PAID`).

---

## Part 2: Agency Portal (Partner View)

The Agency Portal is a restricted, tenant-specific view where external collection agencies manage their assigned workload.

### 2.1 Login & Authentication
*   **Agency Selection**: When logging in as an "Agency Partner", a searchable dropdown allows selecting the specific agency (Alpha, Beta, or Gamma).
*   **Secure Context**: The portal strictly strictly enforces data segregation. Alpha Collections can *only* see cases assigned to Alpha.

### 2.2 Header Area
*   **Agency Identity**: Displays the logged-in agency's name (e.g., "Authorized Partner View: Alpha Collections").
*   **SLA Adherence Widget**: A prominent metric showing the agency's specific compliance score (e.g., `92%`).
*   **Total Cases**: Learn count of total active assignments.

### 2.3 New Allocations Section
Lists cases that have been assigned by the AI but not yet accepted by the agency.
*   **Case Card**: Displays Invoice Number, Customer Name, and Amount.
*   **"New Offer" Badge**: Highlights that this is a fresh assignment.
*   **"Accept Case" Button**:
    *   **Action**: Moves the case status from `ASSIGNED` to `WIP` (Work In Progress).
    *   **System Effect**: Stops the initial "Acceptance Timer" and signals the Enterprise Dashboard that work has commenced.
*   **"Reject" Button**:
    *   **Modal**: Opens a confirmation dialog asking for a reason (e.g., "Capacity Constraints").
    *   **Action**: Returns the case to the global queue.
    *   **System Effect**: Triggers the **Reallocation Algorithm** (see Part 3) to find a replacement agency immediately.

### 2.4 Active Work (WIP) Section
Lists cases currently being worked on.
*   **"Log PTP" (Promise to Pay) Button**:
    *   **Modal**: Confirms the action.
    *   **Action**: Updates status to `PTP`.
    *   **System Effect**: Boots the AI Score by +15 points, reflecting higher recovery confidence.
*   **"Upload Proof" Button**:
    *   **Input**: Opens a file picker (strictly accepts `.pdf` files only).
    *   **Modal**: "AI Verification Analysis". Simulates scanning the document.
    *   **Action**: If valid, updates status to `PAID`.
    *   **System Effect**: Marks the case as closed and updates global recovery metrics.

---

## Part 3: Algorithms, Formulas & Logic

The intelligence of the system relies on three core Python-based algorithms running in the background.

### 3.1 Data Ingestion & Scoring Algorithm (`ingest_mock_data`)
*   **Purpose**: Simulates the daily intake of debt files from the ERP system.
*   **Clean Slate**: Wipes existing data to ensure a fresh simulation state.
*   **Data Generation**: Creates 14 high-fidelity mock cases with varying profiles:
    *   **High Priority (4 cases)**: Amount > $50,000, AI Score > 80.
    *   **Medium Priority (5 cases)**: Amount > $10,000, AI Score 50-80.
    *   **Low Priority (5 cases)**: Amount > $2,000, AI Score < 50.
*   **Seeding**: Automatically creates valid User accounts (Agencies and Managers) to ensure database referential integrity.

### 3.2 Intelligent Allocation Logic (`Allocation.py`)
This algorithm decides which agency gets which case.
1.  **Probationary Reserve**: Scans for "Probationary" agencies (e.g., Gamma) and forcefully reserves ~10% of Medium priority cases for them to build history.
2.  **Capacity Check**: Before assigning, it checks if the agency has reached its `totalCapacity` (hardcoded limit, e.g., 5 cases).
3.  **High Priority Matching**:
    *   High Priority cases are preferentially routed to High Scoring agencies (Alpha).
    *   **Threshold Rule**: Alpha can only take High Priority cases up to 75% of its capacity, ensuring it doesn't get clogged and has room for critical overflow.
4.  **Sequential Fill**: Iterates through sorted agencies (highest score first) to fill the remaining slots.

### 3.3 Reallocation & Swapping Algorithm (`reallocate_case`)
Triggered when an agency rejects a case.
*   **Rule 1 (Low Priority)**: If a Low priority case is rejected, it is simply returned to the `QUEUED` pool to wait for auto-assignment.
*   **Rule 2 (Search)**: If a High/Medium case is rejected:
    *   The system scans all *other* agencies (excluding the rejector).
    *   **Capacity Check**: Looks for an agency with open slots.
    *   **The "Swap" Logic**: If all capable agencies are full, the system looks for a **LOW priority case** currently assigned to a high-performing agency.
    *   **Displacement**: It *revokes* the Low priority case (sends it back to queue) and *inserts* the rejected High priority case in its place. This ensures high-value debts are never left unassigned.

### 3.4 SLA & Breach Detection (`check_sla_breaches`)
A daemon process that monitors case aging.
*   **Timers**: Checks the `assignedAt` timestamp against priority-based limits:
    *   **High**: 24 Hours.
    *   **Medium**: 72 Hours.
    *   **Low**: 120 Hours (5 Days).
*   **Breach Action**:
    *   If current time > limit, the case status is set to `REVOKED`.
    *   `currentSLAStatus` is updated to `BREACHED`.
    *   The assignment is cleared (`assignedToId = NULL`), effectively firing the agency from that case.

### 3.5 Proof Verification Logic (`Proof.py`)
*   **Input Validation**: Rejects any file that does not end in `.pdf`.
*   **AI Simulation**:
    *   Checks the filename for the keyword "invalid". If found, returns `False` (simulating a detected forgery).
    *   Otherwise, returns `True` with a high confidence score (e.g., 0.98), simulating a successful match of date and invoice amount.
