export interface ScoringFeatures {
    amount: number;
    daysOverdue: number; // Date.now - DueDate
    region: string; // 'NA', 'EMEA' ...
    customerName: string; // To simulate history lookup
}

interface FeatureImportance {
    feature: string;
    value: number;
    contribution: number; // Impact on Z-score
}

export class ScoringEngine {
    // Logistic Regression Coefficients
    // Formula: Z = B0 + B1*amount + B2*days + B3*region_risk
    private readonly coefficients = {
        intercept: 2.5, // Base log-odds (High baseline)
        amount: -0.0001, // Large amounts slightly harder
        daysOverdue: -0.05, // Critical factor: older = much harder (-0.05 per day)
        regionEMEA: 0.2, // Slightly easier
        regionAPAC: -0.1, // Slightly harder
        regionLATAM: -0.3 // Harder
    };

    /**
     * Calculates Recovery Probability and AI Score
     */
    public calculateScore(features: ScoringFeatures) {
        let z = this.coefficients.intercept;
        const explanation: FeatureImportance[] = [];

        // 1. Amount Impact
        const amountEffect = features.amount * this.coefficients.amount;
        z += amountEffect;
        explanation.push({ feature: 'Invoice Amount', value: features.amount, contribution: amountEffect });

        // 2. Days Overdue Impact
        const daysEffect = features.daysOverdue * this.coefficients.daysOverdue;
        z += daysEffect;
        explanation.push({ feature: 'Days Overdue', value: features.daysOverdue, contribution: daysEffect });

        // 3. Region Impact
        let regionEffect = 0;
        if (features.region === 'EMEA') regionEffect = this.coefficients.regionEMEA;
        if (features.region === 'APAC') regionEffect = this.coefficients.regionAPAC;
        if (features.region === 'LATAM') regionEffect = this.coefficients.regionLATAM;
        z += regionEffect;
        explanation.push({ feature: 'Region Risk', value: 0, contribution: regionEffect });

        // Sigmoid Function
        const probability = 1 / (1 + Math.exp(-z));

        // Scale to 0-100 Score
        const score = Math.round(probability * 100);

        return {
            probability,
            score,
            priority: this.determinePriority(score),
            zScore: z,
            explanation
        };
    }

    private determinePriority(score: number): 'HIGH' | 'MEDIUM' | 'LOW' {
        if (score >= 80) return 'HIGH';
        if (score >= 40) return 'MEDIUM';
        return 'LOW';
    }
}
