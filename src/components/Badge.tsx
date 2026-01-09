import React from 'react';
import clsx from 'clsx';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
    const styles = {
        success: 'bg-green-100 text-green-800 border-green-200',
        warning: 'bg-orange-100 text-orange-800 border-orange-200',
        danger: 'bg-red-100 text-red-800 border-red-200',
        info: 'bg-blue-100 text-blue-800 border-blue-200',
        neutral: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
        <span className={clsx(
            "px-2.5 py-0.5 rounded-full text-xs font-medium border",
            styles[variant],
            className
        )}>
            {children}
        </span>
    );
}
