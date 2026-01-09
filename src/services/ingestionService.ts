import prisma from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export interface IngestionData {
    invoiceNumber: string;
    amount: number;
    dueDate: string; // YYYY-MM-DD
    customerID: string;
    customerName: string;
    region: string;
}

export class IngestionService {

    /**
     * Normalize and cleanse input data.
     * - Trims strings
     * - Ensures Region is one of [NA, EMEA, APAC, LATAM] or defaults to 'NA'
     */
    private cleanse(data: IngestionData): IngestionData {
        const validRegions = ['NA', 'EMEA', 'APAC', 'LATAM'];
        const region = data.region?.trim().toUpperCase();

        return {
            invoiceNumber: data.invoiceNumber.trim(),
            amount: Math.abs(data.amount), // Ensure positive
            dueDate: data.dueDate,
            customerID: data.customerID.trim(),
            customerName: data.customerName.trim(),
            region: validRegions.includes(region) ? region : 'NA',
        };
    }

    /**
     * Process a batch of raw invoice data.
     * Creates Invoice and initial Case records.
     */
    async processBatch(rawData: IngestionData[]) {
        const results = {
            success: 0,
            errors: 0,
            details: [] as string[]
        };

        for (const item of rawData) {
            try {
                const cleanData = this.cleanse(item);

                // Idempotency check: if invoice exists, skip
                const existing = await prisma.invoice.findUnique({
                    where: { invoiceNumber: cleanData.invoiceNumber }
                });

                if (existing) {
                    results.details.push(`Skipped duplicate: ${cleanData.invoiceNumber}`);
                    continue;
                }

                // Create Invoice
                const invoice = await prisma.invoice.create({
                    data: {
                        invoiceNumber: cleanData.invoiceNumber,
                        amount: cleanData.amount,
                        dueDate: new Date(cleanData.dueDate),
                        customerID: cleanData.customerID,
                        customerName: cleanData.customerName,
                        region: cleanData.region,
                        status: 'OPEN',
                    }
                });

                // Initialize Case (Status: New)
                // AI Scoring will happen in the subsequent step
                await prisma.case.create({
                    data: {
                        invoiceId: invoice.id,
                        aiScore: 0, // Placeholder
                        recoveryProbability: 0, // Placeholder
                        priority: 'LOW', // Default
                        status: 'NEW',
                        currentSLAStatus: 'PENDING',
                        // @ts-ignore - Field exists in Schema/Client, ignoring IDE cache delay
                        assignedAt: new Date(), // Critical for SLA Timer
                        updatedAt: new Date()
                    }
                });

                results.success++;
            } catch (error) {
                results.errors++;
                results.details.push(`Error processing ${item.invoiceNumber}: ${(error as Error).message}`);
            }
        }

        return results;
    }
}
