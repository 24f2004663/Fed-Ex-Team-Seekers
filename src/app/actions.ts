"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { runPythonBackground } from "@/lib/python";

const CURRENT_USER_ID = "user-agency-001";

// --- INLINED UTILS FOR SAFETY ---
type ActionResult<T = undefined> = {
    success: boolean;
    data?: T;
    error?: string;
};

function ok<T>(data?: T): ActionResult<T> {
    return { success: true, data };
}

function fail(message: string): ActionResult {
    return { success: false, error: message };
}
// --------------------------------

/* ------------------ STATUS UPDATE ------------------ */
export async function updateCaseStatus(
    caseId: string,
    newStatus: string,
    note: string
) {
    try {
        let slaStatus = undefined;
        let scoreBoost = 0;

        if (newStatus === "WIP") slaStatus = "ACTIVE";
        if (newStatus === "DISPUTE") slaStatus = "PAUSED";
        // PTP handled separately but kept here for generic updates if needed
        if (newStatus === "PTP") {
            slaStatus = "ACTIVE";
            scoreBoost = 15;
        }
        if (newStatus === "PAID") slaStatus = "COMPLETED";

        await prisma.case.update({
            where: { id: caseId },
            data: {
                status: newStatus,
                ...(slaStatus && { currentSLAStatus: slaStatus }),
                ...(scoreBoost > 0 && { aiScore: { increment: scoreBoost } })
            }
        });

        await prisma.auditLog.create({
            data: {
                caseId,
                actorId: CURRENT_USER_ID,
                action: "STATUS_CHANGE",
                details: note
            }
        });

        revalidatePath("/agency");
        revalidatePath("/");

        return ok();
    } catch (e) {
        console.error(e);
        return fail("Failed to update case");
    }
}

/* ------------------ AGENCY REJECT ------------------ */
export async function agencyRejectCase(
    caseId: string,
    reason: string,
    agencyId: string
) {
    try {
        await prisma.case.update({
            where: { id: caseId },
            data: {
                status: "QUEUED",
                assignedToId: null,
                assignedAt: null,
                currentSLAStatus: "PENDING"
            }
        });

        await prisma.auditLog.create({
            data: {
                caseId,
                actorId: agencyId,
                action: "REJECT",
                details: reason
            }
        });

        const { stdout } = await runPythonBackground("Allocation.py", [
            "--mode", "reallocate",
            "--case_id", caseId,
            "--rejected_by", agencyId
        ]);
        console.log("[Setup] Python Reallocation Done:", stdout);

        // SQLite WAL Propagation Buffer
        await new Promise(resolve => setTimeout(resolve, 500));

        revalidatePath("/agency");
        revalidatePath("/");

        return ok();
    } catch (e) {
        console.error(e);
        return fail("Reject failed");
    }
}

/* ------------------ LOG PTP ------------------ */
export async function logPTP(caseId: string) {
    try {
        await prisma.case.update({
            where: { id: caseId },
            data: {
                status: "PTP",
                currentSLAStatus: "ACTIVE",
                aiScore: { increment: 15 }
            }
        });

        await prisma.auditLog.create({
            data: {
                caseId,
                actorId: CURRENT_USER_ID,
                action: "PTP",
                details: "Promise to Pay logged"
            }
        });

        revalidatePath("/agency");
        revalidatePath("/");

        return ok();
    } catch (e) {
        console.error(e);
        return fail("PTP failed");
    }
}

/* ------------------ UPLOAD PROOF ------------------ */
export async function uploadProof(caseId: string, filename: string) {
    try {
        await prisma.case.update({
            where: { id: caseId },
            data: { status: 'PAID', currentSLAStatus: 'COMPLETED' }
        });

        await prisma.auditLog.create({
            data: {
                caseId,
                actorId: CURRENT_USER_ID,
                action: "PROOF",
                details: filename
            }
        });

        await runPythonBackground("Proof.py", ["--file", `"${filename}"`]);

        // SQLite WAL Propagation Buffer
        await new Promise(resolve => setTimeout(resolve, 500));

        revalidatePath("/agency");
        revalidatePath("/");

        return ok();
    } catch (e) {
        console.error(e);
        return fail("Upload failed");
    }
}

/* ------------------ INGEST ------------------ */
export async function ingestMockData() {
    try {
        await runPythonBackground("Allocation.py", ["--mode", "ingest"]);

        // SQLite WAL Propagation Buffer
        await new Promise(resolve => setTimeout(resolve, 1000));

        revalidatePath("/");
        revalidatePath("/analytics");
        return ok();
    } catch {
        return fail("Ingestion failed");
    }
}

/* ------------------ RESET ------------------ */
export async function resetDatabase() {
    try {
        await prisma.auditLog.deleteMany();
        await prisma.sLA.deleteMany();
        await prisma.case.deleteMany();
        await prisma.invoice.deleteMany();
        revalidatePath('/');
        return ok();
    } catch {
        return fail("Reset failed");
    }
}
