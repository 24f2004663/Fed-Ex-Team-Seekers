'use server';

import { cookies } from 'next/headers';

export async function loginUser(role: string, agencyId?: string) {
    const cookieStore = await cookies();
    // In a real app, sign a JWT here. For demo, a JSON string is fine.
    const sessionData = JSON.stringify({
        role,
        agencyId,
        lastActive: Date.now()
    });

    // Set 24h expiration
    cookieStore.set('fedex_auth_token', sessionData, {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * 60 * 24,
        path: '/',
    });

    return { success: true };
}

import { redirect } from 'next/navigation';

export async function logoutUser() {
    (await cookies()).delete('fedex_auth_token');
    redirect('/login');
}
