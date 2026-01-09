import sqlite3
import datetime
import uuid
import sys
import argparse

DB_PATH = 'prisma/dev.db'

# --- CONFIGURATION (Your Logic) ---
AGENCIES = {
    'user-agency-alpha': {'name': 'Alpha Collections', 'score': 92, 'capacity': 4},
    'user-agency-beta':  {'name': 'Beta Recovery',    'score': 78, 'capacity': 5},
    'user-agency-gamma': {'name': 'Gamma Partners',   'score': 60, 'capacity': 3}
}

def get_db_connection():
    # Timeout added to prevent immediate locking errors
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn

def log_audit(conn, case_id, actor_id, action, details):
    log_id = str(uuid.uuid4())
    # Use UTC ISO format compatible with Prisma
    # Use timezone-aware UTC to fix the warning
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    conn.execute(
        "INSERT INTO AuditLog (id, caseId, actorId, action, details, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
        (log_id, case_id, actor_id, action, details, timestamp)
    )

def get_agency_load(conn, agency_id):
    row = conn.execute(
        "SELECT COUNT(*) as count FROM 'Case' WHERE assignedToId = ? AND status IN ('ASSIGNED', 'WIP', 'PTP')", 
        (agency_id,)
    ).fetchone()
    return row['count']

def process_rejection_logic(case_id, reason, rejected_by_id):
    conn = get_db_connection()
    try:
        # --- PART 1: THE REJECTION ---
        case = conn.execute("SELECT * FROM 'Case' WHERE id = ?", (case_id,)).fetchone()
        if not case:
            print("Error: Case not found")
            return

        print(f"[Rejection.py] Rejecting Case {case_id} from {rejected_by_id}...")
        
        # 1. Reset Case to QUEUED
        conn.execute(
            "UPDATE 'Case' SET status = 'QUEUED', assignedToId = NULL, assignedAt = NULL, currentSLAStatus = 'PENDING' WHERE id = ?",
            (case_id,)
        )
        
        # 2. Log the Rejection
        # Note: If rejected_by_id doesn't exist in User table, this might fail (FK constraint).
        # We wrap in try/catch for safety, or you can use 'SYSTEM' if the ID is suspect.
        try:
            log_audit(conn, case_id, rejected_by_id, 'REJECTION', f"Reason: {reason}")
        except sqlite3.IntegrityError:
            # Fallback if the Actor ID (agency) is invalid
            log_audit(conn, case_id, 'user-agency-alpha', 'REJECTION', f"Reason: {reason} (Logged by System)")

        # 3. Stop if Low Priority
        if case['priority'] == 'LOW':
            print("[Rejection.py] Low priority case returned to queue.")
            conn.commit()
            return

        # --- PART 2: THE REALLOCATION (Merged Logic) ---
        print("[Rejection.py] Attempting immediate reallocation...")
        
        # Sort agencies by Score, excluding the one who just rejected it
        candidates = [aid for aid in AGENCIES if aid != rejected_by_id]
        candidates.sort(key=lambda x: AGENCIES[x]['score'], reverse=True)

        reallocated = False
        
        for agency_id in candidates:
            limit = AGENCIES[agency_id]['capacity']
            load = get_agency_load(conn, agency_id)
            
            if load < limit:
                # FOUND A SPOT!
                conn.execute(
                    "UPDATE 'Case' SET assignedToId = ?, status = 'ASSIGNED', assignedAt = ?, currentSLAStatus = 'ACTIVE' WHERE id = ?",
                    (agency_id, datetime.datetime.utcnow().isoformat() + "Z", case_id)
                )
                
                new_name = AGENCIES[agency_id]['name']
                log_audit(conn, case_id, 'SYSTEM', 'REALLOCATED', f"Reallocated to {new_name}")
                print(f"[Rejection.py] Success: Reallocated to {new_name}")
                reallocated = True
                break
        
        if not reallocated:
            print("[Rejection.py] No available agencies. Case remains in Queue.")

        conn.commit()

    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
        sys.exit(1) # Important: Exit with error code so Next.js knows it failed
    finally:
        conn.close()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--case_id', required=True)
    parser.add_argument('--reason', required=True)
    parser.add_argument('--rejected_by', required=True)
    args = parser.parse_args()
    
    process_rejection_logic(args.case_id, args.reason, args.rejected_by)