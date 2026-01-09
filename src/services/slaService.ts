import prisma from '@/lib/db';

export class SLAService {

    // SLA Config in Hours
    private static readonly SLA_CONFIG = {
        HIGH: 48, // 2 Days to First Contact
        MEDIUM: 168, // 7 Days (1 Week)
        LOW: 720, // 30 Days
    };

    /**
     * Check all active cases for SLA breaches.
     * This would typically run via a cron job or nightly batch.
     */
    async checkBreaches() {
        const activeCases = await prisma.case.findMany({
            where: {
                status: { notIn: ['CLOSED', 'PAID'] },
                currentSLAStatus: { not: 'PAUSED' } // Don't check paused disputes
            }
        });

        const breaches = [];

        for (const kase of activeCases) {
            const allowedHours = SLAService.SLA_CONFIG[kase.priority as keyof typeof SLAService.SLA_CONFIG] || 720;
            const hoursElapsed = (Date.now() - kase.updatedAt.getTime()) / (1000 * 60 * 60);

            // Operational Matrix: 7-Day Follow-up Cadence for Medium Priority
            if (kase.priority === 'MEDIUM') {
                const daysSinceUpdate = hoursElapsed / 24;
                if (daysSinceUpdate >= 7 && daysSinceUpdate < 14) {
                    // Logic to ensure we don't spam: check last notification based on AuditLog (omitted for brevity)
                    console.log(`[SLA_MONITOR] Reminder: Case ${kase.id} requires weekly touchpoint.`);
                }
            }

            // Simple Logic: If no action (updatedAt) for X hours, it's a breach
            if (hoursElapsed > allowedHours) {
                // 1. Determine Escalation Path based on Priority
                let escalationAction = 'NOTIFY_MANAGER';
                if (kase.priority === 'HIGH') escalationAction = 'ESCALATE_TO_LEGAL_QUEUE'; // Serious breach

                // 2. Mark Breach & Escalate
                await prisma.case.update({
                    where: { id: kase.id },
                    data: {
                        currentSLAStatus: 'BREACHED',
                        slaBreachTime: new Date(),
                        // In a real app, we would change 'assignedTo' here to a Manager ID
                        status: 'ESCALATED'
                    }
                });

                // 3. Log Detailed Audit (Governance)
                await prisma.auditLog.create({
                    data: {
                        caseId: kase.id,
                        actorId: 'SYSTEM_SLA_ENGINE',
                        action: 'SLA_BREACH_ESCALATION',
                        details: `Breached ${kase.priority} Priority SLA limit of ${allowedHours} hours. Action Taken: ${escalationAction}.`
                    }
                });

                breaches.push(kase.id);
            }
        }

        return { checked: activeCases.length, breaches };
    }

    /**
     * Pauses SLA timer for disputes.
     */
    async pauseSLA(caseId: string) {
        await prisma.case.update({
            where: { id: caseId },
            data: { currentSLAStatus: 'PAUSED' }
        });
    }

    /**
     * Resumes SLA timer after dispute resolution.
     */
    async resumeSLA(caseId: string) {
        await prisma.case.update({
            where: { id: caseId },
            data: {
                currentSLAStatus: 'ACTIVE',
                updatedAt: new Date() // Reset the activity timer
            }
        });
    }
}
