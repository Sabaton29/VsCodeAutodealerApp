import React from 'react';
import { OperatingExpenseCategory } from '../types';

export interface ExpenseDataPoint {
    category: OperatingExpenseCategory;
    amount: number;
    color: string;
}

interface ExpenseDonutChartProps {
    data: ExpenseDataPoint[];
    total: number;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const ExpenseDonutChart: React.FC<ExpenseDonutChartProps> = ({ data, total }) => {
    const circumference = 2 * Math.PI * 40; // 2 * pi * radius
    let accumulatedOffset = 0;

    return (
        <div className="bg-dark-light rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-dark-text mb-4">Desglose de Gastos Operativos</h3>
            {data.length > 0 && total > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="relative w-48 h-48 mx-auto">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                            <circle cx="50" cy="50" r="40" strokeWidth="20" className="stroke-current text-gray-700/50" fill="transparent" />
                            {data.map(item => {
                                const percentage = (item.amount / total) * 100;
                                const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                                const strokeDashoffset = -accumulatedOffset;
                                accumulatedOffset += (percentage / 100) * circumference;

                                return (
                                    <circle
                                        key={item.category}
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        strokeWidth="20"
                                        className={`stroke-current ${item.color}`}
                                        fill="transparent"
                                        strokeDasharray={strokeDasharray}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="butt"
                                    />
                                );
                            })}
                        </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xs text-gray-400">Total</span>
                            <span className="font-bold text-xl text-white">{formatCurrency(total)}</span>
                        </div>
                    </div>
                     <div>
                        <ul className="space-y-2">
                            {data.map(item => (
                                <li key={item.category} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                        <span className={`w-3 h-3 rounded-full mr-2 ${item.color.replace('text-', 'bg-')}`}></span>
                                        <span className="text-gray-300">{item.category}</span>
                                    </div>
                                    <span className="font-mono text-white">{formatCurrency(item.amount)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : (
                 <div className="h-48 flex items-center justify-center text-gray-500">
                    No hay gastos operativos registrados en este período.
                </div>
            )}
        </div>
    );
};

export default ExpenseDonutChart;
