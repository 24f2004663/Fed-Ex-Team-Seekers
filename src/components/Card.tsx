import React from 'react';
import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    icon?: LucideIcon;
}

export function Card({ children, className, title, icon: Icon }: CardProps) {
    return (
        <div className={clsx("glass-panel p-6 flex flex-col gap-4", className)}>
            {title && (
                <div className="flex items-center gap-2 mb-2">
                    {Icon && <Icon className="w-5 h-5 text-purple-600" />}
                    <h3 className="font-semibold text-lg text-[var(--color-primary-dark)]">{title}</h3>
                </div>
            )}
            {children}
        </div>
    );
}
