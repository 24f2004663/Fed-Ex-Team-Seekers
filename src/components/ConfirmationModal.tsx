'use client';
import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    confirmVariant?: 'primary' | 'danger';
}

export function ConfirmationModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    confirmVariant = 'primary'
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-100 transform transition-all scale-100">
                {/* Header */}
                <div className="bg-[var(--color-primary)] px-6 py-4 flex items-center justify-between">
                    <h3 className="text-white font-bold text-lg">{title}</h3>
                    <button onClick={onCancel} className="text-white/70 hover:text-white transition">
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{message}</p>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-bold text-white rounded-md shadow-md transition transform active:scale-95 ${confirmVariant === 'danger'
                                ? 'bg-[var(--color-danger)] hover:bg-red-600'
                                : 'bg-[var(--color-secondary)] hover:bg-orange-600'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
