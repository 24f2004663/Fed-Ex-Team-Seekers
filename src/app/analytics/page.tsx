import { Card } from '@/components/Card';
import { ModelCard } from '@/components/ModelCard';
import { BarChart, Activity } from 'lucide-react';

export default function AnalyticsPage() {
    // Simulated Metrics for the Demo
    const modelFeatures = [
        { feature: 'Days Overdue', value: 45, contribution: -0.45 },
        { feature: 'Invoice Amount', value: 5000, contribution: -0.1 },
        { feature: 'Region (APAC)', value: 1, contribution: -0.1 },
    ];

    return (
        <main className="min-h-screen p-8 space-y-8">
            <h1 className="text-3xl font-bold flex items-center gap-3 text-[var(--color-primary)]">
                <BarChart className="w-8 h-8" /> Analytics & AI Governance
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left: Model Verification */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Model Performance (v1.2)</h2>
                    <ModelCard score={65} features={modelFeatures} />

                    <Card title="Confusion Matrix (Last 90 Days)" className="bg-white">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-green-50 rounded">
                                <div className="text-2xl font-bold text-green-700">850</div>
                                <div className="text-xs text-gray-500">True Positives (Accurate Recovery Prediction)</div>
                            </div>
                            <div className="p-4 bg-red-50 rounded">
                                <div className="text-2xl font-bold text-red-700">42</div>
                                <div className="text-xs text-gray-500">False Positives (Wasted Effort)</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right: Operational Metrics */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Operational Health</h2>
                    <Card title="DSO Trend" icon={Activity}>
                        <div className="h-40 flex items-end justify-between px-4 gap-2">
                            {/* Fake Chart Bars */}
                            {[45, 44, 46, 43, 42, 41].map((h, i) => (
                                <div key={i} className="w-10 bg-purple-200 rounded-t hover:bg-purple-300 transition-all relative group">
                                    <div className="absolute bottom-0 w-full bg-[var(--color-primary)] opacity-80" style={{ height: `${h * 1.5}px` }}></div>
                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-600 opacity-0 group-hover:opacity-100">{h}d</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-400">
                            <span>Jun</span>
                            <span>Jul</span>
                            <span>Aug</span>
                            <span>Sep</span>
                            <span>Oct</span>
                            <span>Nov</span>
                        </div>
                    </Card>

                    <Card title="SLA Breaches by Stage" className="bg-white">
                        <ul className="space-y-3">
                            <li className="flex justify-between items-center text-sm">
                                <span>First Contact (48h)</span>
                                <span className="font-bold text-red-500">12</span>
                            </li>
                            <li className="flex justify-between items-center text-sm">
                                <span>Agency Follow Up (7d)</span>
                                <span className="font-bold text-orange-500">4</span>
                            </li>
                            <li className="flex justify-between items-center text-sm">
                                <span>Dispute Resolution</span>
                                <span className="font-bold text-green-500">0</span>
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>
        </main>
    );
}
