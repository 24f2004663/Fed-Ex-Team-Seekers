'use client';

import { LogOut } from 'lucide-react';
import { logoutUser } from '@/app/auth-actions';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await logoutUser();
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            title="Sign Out"
        >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
        </button>
    );
}
