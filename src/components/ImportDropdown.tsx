'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, FileSpreadsheet, Database, Loader2, RefreshCcw } from 'lucide-react';
import { ingestMockData, resetDatabase } from '@/app/actions';
import clsx from 'clsx';

export default function ImportDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'IMPORTING' | 'CLEANING'>('IDLE');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleConnectDB = async () => {
        setIsOpen(false);
        setStatus('CONNECTING');
        // Simulate Connection Delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log("Database Connection Successful! (Mock)");
        setStatus('IDLE');
    };

    const handleImportExcel = async () => {
        setIsOpen(false);
        setStatus('IMPORTING');
        setIsLoading(true);

        try {
            // 1. Clear existing data first (to avoid duplicates for demo)
            await resetDatabase();

            // 2. Ingest new batch
            await ingestMockData();

            setIsLoading(false);
            setStatus('IDLE');
        } catch (error) {
            console.error("Import failed (suppressed):", error);
            window.location.reload();
        }
    };

    const handleClear = async () => {
        setIsOpen(false);
        setStatus('CLEANING');
        try {
            await resetDatabase();
            setStatus('IDLE');
        } catch (error) {
            console.error("Clear failed (suppressed):", error);
            window.location.reload();
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={status !== 'IDLE'}
                className="bg-[var(--color-secondary)] text-white px-4 py-2 rounded-lg shadow hover:bg-[var(--color-secondary-dark)] transition flex items-center gap-2 disabled:opacity-70"
            >
                {status === 'IDLE' && 'Import Data'}
                {status === 'CONNECTING' && 'Connecting...'}
                {status === 'IMPORTING' && 'Importing...'}
                {status === 'CLEANING' && 'Clearing...'}

                {status === 'IDLE' ? <ChevronDown className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                    <button
                        onClick={handleImportExcel}
                        className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors flex items-center gap-3 border-b border-gray-50"
                    >
                        <div className="bg-green-100 p-1.5 rounded-md">
                            <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Import Excel</p>
                            <p className="text-xs text-gray-400">Legacy AR Data (CSV)</p>
                        </div>
                    </button>

                    <button
                        onClick={handleConnectDB}
                        className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors flex items-center gap-3 border-b border-gray-50"
                    >
                        <div className="bg-blue-100 p-1.5 rounded-md">
                            <Database className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Connect Database</p>
                            <p className="text-xs text-gray-400">External SQL/Oracle</p>
                        </div>
                    </button>

                    <button
                        onClick={handleClear}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center gap-3"
                    >
                        <div className="bg-red-100 p-1.5 rounded-md">
                            <RefreshCcw className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Reset System</p>
                            <p className="text-xs text-gray-400">Clear all data</p>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}
