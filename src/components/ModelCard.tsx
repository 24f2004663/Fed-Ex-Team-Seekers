import React from 'react';
import { Card } from '@/components/Card';
import { Info } from 'lucide-react';

interface FeatureImportance {
    feature: string;
    value: number;
    contribution: number;
}

interface ModelCardProps {
    score: number;
    features: FeatureImportance[];
}

export function ModelCard({ score, features }: ModelCardProps) {
    return (
        <Card title="AI Model Explanation" icon={Info} className="bg-gradient-to-br from-indigo-50/50 to-white">
            <div className="mb-4">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-medium text-gray-600">Recovery Probability</span>
                    <span className="text-2xl font-bold text-[var(--color-primary)]">{score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-1000" style={{ width: `${score}%` }}></div>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Top Contributors</h4>
                {features.map((f, i) => (
                    <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                        <span className="text-gray-700">{f.feature}</span>
                        <span className={f.contribution < 0 ? "text-red-500 font-medium" : "text-green-600 font-medium"}>
                            {f.contribution > 0 ? '+' : ''}{f.contribution.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-4 p-2 bg-blue-50 rounded text-xs text-blue-700">
                <strong>Model:</strong> Logistic Regression v1.2 <br />
                <strong>Accuracy:</strong> 89.4% (Simulated)
            </div>
        </Card>
    );
}
