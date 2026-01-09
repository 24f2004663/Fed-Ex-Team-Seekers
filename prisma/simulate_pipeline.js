const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// In Next.js app we use `import`, here we use CommonJS or mock the Service class for the script
// For simplicity in this script, I'll inline the scoring logic to run it via `node` quickly.
// In the real app, we use `src/services/scoringService.ts`.

const COEFFICENTS = {
    intercept: 2.5,
    amount: -0.0001,
    daysOverdue: -0.05,
    regionEMEA: 0.2,
    regionAPAC: -0.1,
    regionLATAM: -0.3
};

function calculateScore(amount, daysOverdue, region) {
    let z = COEFFICENTS.intercept;
    z += amount * COEFFICENTS.amount;
    z += daysOverdue * COEFFICENTS.daysOverdue;
    if (region === 'EMEA') z += COEFFICENTS.regionEMEA;
    if (region === 'APAC') z += COEFFICENTS.regionAPAC;
    if (region === 'LATAM') z += COEFFICENTS.regionLATAM;

    const prob = 1 / (1 + Math.exp(-z));
    return {
        score: Math.round(prob * 100),
        prob: prob
    };
}

async function runPipeline() {
    console.log("--- Starting Pipeline Simulation ---");

    // 1. Mock Ingestion Data
    const mockInvoices = [
        { invoiceNumber: 'INV-2025-001', amount: 5000, dueDate: '2025-12-01', customerID: 'CUST01', region: 'NA' },   // Fresh, High Score
        { invoiceNumber: 'INV-2025-002', amount: 150000, dueDate: '2025-10-01', customerID: 'CUST02', region: 'APAC' }, // Old, Big amount -> Low Score
        { invoiceNumber: 'INV-2025-003', amount: 1200, dueDate: '2025-11-15', customerID: 'CUST03', region: 'EMEA' },  // Med
    ];

    console.log(`Ingesting ${mockInvoices.length} invoices...`);

    for (const inv of mockInvoices) {
        // Upsert Invoice
        const dbInv = await prisma.invoice.upsert({
            where: { invoiceNumber: inv.invoiceNumber },
            update: {},
            create: {
                invoiceNumber: inv.invoiceNumber,
                amount: inv.amount,
                dueDate: new Date(inv.dueDate),
                customerID: inv.customerID,
                customerName: `Mock Co ${inv.customerID}`,
                region: inv.region,
                status: 'OPEN'
            }
        });

        // Upsert Case
        // Calculate Days Overdue (Simulating "Today" as Jan 1 2026)
        const today = new Date('2026-01-01').getTime();
        const due = new Date(inv.dueDate).getTime();
        const daysOverdue = Math.max(0, Math.floor((today - due) / (1000 * 60 * 60 * 24)));

        // AI Scoring
        const { score, prob } = calculateScore(inv.amount, daysOverdue, inv.region);
        let priority = 'LOW';
        if (score >= 80) priority = 'HIGH';
        else if (score >= 40) priority = 'MEDIUM';

        console.log(`Invoice ${inv.invoiceNumber}: ${daysOverdue} days overdue, Amount $${inv.amount}. AI Score: ${score} (${priority})`);

        await prisma.case.upsert({
            where: { invoiceId: dbInv.id },
            update: {
                aiScore: score,
                recoveryProbability: prob,
                priority: priority,
                status: priority === 'HIGH' ? 'ASSIGNED' : 'NEW', // Auto-assign high priority logic simulation
                currentSLAStatus: 'ACTIVE'
            },
            create: {
                invoiceId: dbInv.id,
                aiScore: score,
                recoveryProbability: prob,
                priority: priority,
                status: 'NEW',
                currentSLAStatus: 'ACTIVE'
            }
        });
    }
    console.log("--- Pipeline Complete ---");
}

runPipeline()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
