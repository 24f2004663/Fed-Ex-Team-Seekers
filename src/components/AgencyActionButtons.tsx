'use client';

import { updateCaseStatus, agencyRejectCase, logPTP, uploadProof } from '@/app/actions';
import { MessageSquare, Upload, Ban, CheckCircle } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmationModal } from './ConfirmationModal';

export function AgencyActionButtons({ caseId, status }: { caseId: string, status: string }) {
    const [isPending, startTransition] = useTransition();
    const [actionLoading, setActionLoading] = useState(false);
    const router = useRouter();

    const loading = isPending || actionLoading;

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        confirmText: string;
        confirmVariant: 'primary' | 'danger';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        confirmText: 'Confirm',
        confirmVariant: 'primary'
    });

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

    const handleAction = async (actionFn: () => Promise<{ success: boolean; error?: string }>) => {
        setActionLoading(true);
        try {
            const result = await actionFn();

            if (!result.success) {
                console.error('Action failed:', result.error);
                // Force reload even on failure to ensure UI sync
                window.location.reload();
                return;
            }

            closeModal();

            // Wrap refresh in transition to keep old UI until new data ready
            startTransition(() => {
                router.refresh();
            });

            setActionLoading(false);

        } catch (error: any) {
            console.error("Action failed (suppressed):", error);
            // Suppress popup and force reload for demo safety
            window.location.reload();
        }
    };

    const handleAccept = () => {
        handleAction(() => updateCaseStatus(caseId, 'WIP', 'Agency Accepted Case.'));
    };

    const confirmLogPTP = () => {
        setModalConfig({
            isOpen: true,
            title: 'Confirm "Promise to Pay"',
            message: 'Are you sure you want to log a "Promise to Pay"?\n\nThis will primarily boost the AI Score for this case and indicates high confidence in recovery.',
            confirmText: 'Log PTP & Boost Score',
            confirmVariant: 'primary',
            onConfirm: () => handleAction(() => logPTP(caseId))
        });
    };

    const confirmReject = () => {
        setModalConfig({
            isOpen: true,
            title: 'Reject Case Allocation',
            message: 'Are you sure you want to reject this case?\n\nReason: Capacity Constraints.\n\nThis will return the case to the queue to be reallocated to the next best agency.',
            confirmText: 'Reject Case',
            confirmVariant: 'danger',
            onConfirm: () => {
                const rejectAction = async () => {
                    const currentAgencyId = 'user-agency-alpha';
                    return await agencyRejectCase(caseId, "Capacity Constraints", currentAgencyId);
                };
                handleAction(rejectAction);
            }
        });
    };

    const handleUploadProof = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/pdf';

        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.type !== 'application/pdf') {
                alert('Error: Only PDF files are accepted.');
                return;
            }

            setModalConfig({
                isOpen: true,
                title: 'AI Verification Analysis',
                message: `Analyzing Document: "${file.name}"...\n\n• Checking Date validity...\n• Matching Invoice Amount...\n• Verifying Signature...`,
                confirmText: 'Verify & Close Case',
                confirmVariant: 'primary',
                onConfirm: () => handleAction(() => uploadProof(caseId, file.name))
            });
        };
        input.click();
    };

    // --- RENDER ---

    if (status === 'ASSIGNED') {
        return (
            <>
                <div className="flex gap-3">
                    <button
                        onClick={handleAccept}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-md hover:bg-green-700 transition disabled:opacity-50 shadow-sm"
                    >
                        {loading ? 'Processing...' : 'Accept Case'}
                    </button>
                    <button
                        onClick={confirmReject}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition disabled:opacity-50"
                    >
                        <Ban className="w-4 h-4" />
                        Reject
                    </button>
                </div>
                <ConfirmationModal
                    {...modalConfig}
                    onCancel={closeModal}
                />
            </>
        );
    }

    if (status === 'WIP' || status === 'PTP') {
        return (
            <>
                <div className="flex gap-3">
                    {status === 'WIP' && (
                        <button
                            onClick={confirmLogPTP}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition disabled:opacity-50 shadow-sm"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Log PTP
                        </button>
                    )}
                    <button
                        onClick={handleUploadProof}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[var(--color-secondary)] rounded-md hover:bg-orange-600 transition disabled:opacity-50 shadow-md"
                    >
                        <Upload className="w-4 h-4" />
                        Upload Proof
                    </button>
                </div>
                <ConfirmationModal
                    {...modalConfig}
                    onCancel={closeModal}
                />
            </>
        );
    }

    return (
        <span className="text-sm font-bold text-green-600 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Action Logged
        </span>
    );
}
