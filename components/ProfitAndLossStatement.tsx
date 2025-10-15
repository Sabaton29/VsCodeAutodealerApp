import React, { useState, useMemo } from 'react';
import { Invoice, OperatingExpense, OperatingExpenseCategory } from '../types';

interface ProfitAndLossStatementProps {
    invoices: Invoice[];
    operatingExpenses: OperatingExpense[];
    selectedLocationId: string;
}

type DateFilter = 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear';

const FILTERS: { key: DateFilter; label: string }[] = [
    { key: 'thisMonth', label: 'Este Mes' },
    { key: 'lastMonth', label: 'Mes Pasado' },
    { key: 'thisQuarter', label: 'Este Trimestre' },
    { key: 'thisYear', label: 'Este Año' },
];

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const ProfitAndLossStatement: React.FC<ProfitAndLossStatementProps> = ({ invoices, operatingExpenses, selectedLocationId }) => {
    const [filter, setFilter] = useState<DateFilter>('thisMonth');
    const isGlobalView = selectedLocationId === 'ALL_LOCATIONS';

    const dateRange = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        let startDate: Date;
        let endDate: Date;

        switch (filter) {
            case 'lastMonth':
                startDate = new Date(year, month - 1, 1);
                endDate = new Date(year, month, 0, 23, 59, 59, 999);
                break;
            case 'thisQuarter':
                const quarter = Math.floor(month / 3);
                startDate = new Date(year, quarter * 3, 1);
                endDate = new Date(year, quarter * 3 + 3, 0, 23, 59, 59, 999);
                break;
            case 'thisYear':
                startDate = new Date(year, 0, 1);
                endDate = new Date(year, 11, 31, 23, 59, 59, 999);
                break;
            case 'thisMonth':
            default:
                startDate = new Date(year, month, 1);
                endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
                break;
        }
        return { startDate, endDate };
    }, [filter]);
    
    const pnlData = useMemo(() => {
        const locationFilter = (item: { locationId: string }) => isGlobalView || item.locationId === selectedLocationId;
        const dateFilter = (item: { date: string } | { issueDate: string }) => {
            const itemDate = new Date('issueDate' in item ? item.issueDate : item.date);
            return itemDate >= dateRange.startDate && itemDate <= dateRange.endDate;
        };

        const filteredInvoices = invoices.filter(inv => locationFilter(inv) && dateFilter(inv));
        const filteredExpenses = operatingExpenses.filter(exp => locationFilter(exp) && dateFilter(exp));

        const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
        
        const costOfGoodsSold = filteredInvoices.reduce((sum, inv) => {
            return sum + inv.items.reduce((itemSum, item) => {
                if (item.type === 'inventory' && item.costPrice) {
                    return itemSum + (item.costPrice * item.quantity);
                }
                return itemSum;
            }, 0);
        }, 0);

        const grossProfit = totalRevenue - costOfGoodsSold;

        const expensesByCategory = filteredExpenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {} as Record<OperatingExpenseCategory, number>);

        const totalOperatingExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);

        const netProfit = grossProfit - totalOperatingExpenses;

        return {
            totalRevenue,
            costOfGoodsSold,
            grossProfit,
            expensesByCategory,
            totalOperatingExpenses,
            netProfit,
        };
    }, [invoices, operatingExpenses, selectedLocationId, isGlobalView, dateRange]);

    const ProfitRow: React.FC<{ label: string; value: number; level: 1 | 2 | 3; isNegative?: boolean }> = 
        ({ label, value, level, isNegative = false }) => {
        
        const levelClasses = {
            1: 'text-lg text-white font-bold', // Main categories
            2: 'text-base text-gray-300', // Sub-categories
            3: 'text-base text-green-400 font-bold', // Totals
        };

        const valueColor = isNegative ? 'text-red-400' : level === 3 ? 'text-green-400' : 'text-white';
        
        return (
            <div className={`flex justify-between items-center py-2.5 border-t border-gray-800 ${level === 2 ? 'pl-6' : ''}`}>
                <span className={levelClasses[level]}>{label}</span>
                <span className={`font-mono ${levelClasses[level]} ${valueColor}`}>
                    {formatCurrency(value)}
                </span>
            </div>
        );
    };

    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Estado de Resultados (P&L)</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Análisis financiero detallado para el período seleccionado.</p>
                </div>
                 <div className="flex flex-wrap items-center gap-2">
                    {FILTERS.map(({ key, label }) => (
                        <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === key ? 'bg-brand-red text-white' : 'bg-gray-200 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-800'}`}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="p-6">
                <div className="max-w-3xl mx-auto">
                    <ProfitRow label="Ingresos Totales (Ventas)" value={pnlData.totalRevenue} level={1} />
                    <ProfitRow label="(-) Costo de Ventas (Repuestos)" value={pnlData.costOfGoodsSold} level={2} />
                    <ProfitRow label="(=) Utilidad Bruta" value={pnlData.grossProfit} level={3} isNegative={pnlData.grossProfit < 0} />
                    
                    <div className="mt-4">
                        <ProfitRow label="(-) Gastos Operativos Totales" value={pnlData.totalOperatingExpenses} level={1} />
                        {Object.entries(pnlData.expensesByCategory).sort(([, a], [, b]) => b - a).map(([category, amount]) => (
                            <ProfitRow key={category} label={category} value={amount} level={2} />
                        ))}
                    </div>
                    
                    <div className="mt-4">
                         <ProfitRow label="(=) Utilidad Neta (Beneficio)" value={pnlData.netProfit} level={3} isNegative={pnlData.netProfit < 0} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfitAndLossStatement;
