import React, { memo } from 'react';
import { MetricCardVariant } from '../types';

interface MetricCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    change?: string;
    variant?: MetricCardVariant;
}

const MetricCard: React.FC<MetricCardProps> = memo(({ title, value, icon, change, variant = 'default' }) => {
    const valueColorClass = {
        'default': 'text-light-text dark:text-dark-text',
        'success': 'text-green-500',
        'danger': 'text-red-500',
    }[variant];

    return (
        <div className="bg-light dark:bg-dark-light p-5 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-start justify-between">
                <div className="text-brand-red">
                    {icon}
                </div>
            </div>
            <div className="mt-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
                <p className={`mt-1 text-3xl font-bold ${valueColorClass}`}>{value}</p>
                 {change && (
                    <p className={`mt-2 text-xs ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {change}
                    </p>
                )}
            </div>
        </div>
    );
});

MetricCard.displayName = 'MetricCard';

export default MetricCard;