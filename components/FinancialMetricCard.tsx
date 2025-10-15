import React from 'react';
import { Icon, IconName } from './Icon';

interface FinancialMetricCardProps {
    title: string;
    value: string;
    icon: IconName;
    change?: { value: string; isPositive: boolean };
    colorClass: string; // e.g., 'text-green-400'
}

const FinancialMetricCard: React.FC<FinancialMetricCardProps> = ({ title, value, icon, change, colorClass }) => {
    return (
        <div className="bg-dark-light p-5 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-black dark:bg-gray-900/20 ${colorClass}`}>
                    <Icon name={icon} className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</h3>
                    <p className={`mt-1 text-2xl font-bold ${colorClass}`}>{value}</p>
                </div>
            </div>
            {change && (
                <p className={`mt-2 text-xs flex items-center ${change.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    <Icon name={change.isPositive ? 'arrow-trending-up' : 'arrow-trending-down'} className="w-4 h-4 mr-1"/>
                    {change.value}
                </p>
            )}
        </div>
    );
};

export default FinancialMetricCard;
