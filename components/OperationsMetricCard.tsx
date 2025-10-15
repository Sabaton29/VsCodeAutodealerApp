
import React from 'react';
import { Icon, IconName } from './Icon';

interface OperationsMetricCardProps {
    title: string;
    count: number;
    description: string;
    iconName: IconName;
}

const OperationsMetricCard: React.FC<OperationsMetricCardProps> = ({ title, count, description, iconName }) => {
    return (
        <div className="bg-dark-light p-5 rounded-xl flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</p>
                <p className="mt-2 text-4xl font-bold text-dark-text">{count}</p>
                <p className="mt-1 text-xs text-gray-500">{description}</p>
            </div>
            <div className="p-2 rounded-lg bg-black dark:bg-gray-900/20">
                 <Icon name={iconName} className="w-5 h-5 text-gray-400" />
            </div>
        </div>
    );
};

export default OperationsMetricCard;