import React, { useMemo } from 'react';
import { Invoice, OperatingExpense } from '../types';
import { Icon } from './Icon';

interface ProfitAndLossReportProps {
    invoices: Invoice[];
    operatingExpenses: OperatingExpense[];
    selectedLocationId: string;
    dateRange: { startDate: Date; endDate: Date };
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const ProfitAndLossReport: React.FC<ProfitAndLossReportProps> = ({ invoices, operatingExpenses, selectedLocationId, dateRange }) => {

    const pnlData = useMemo(() => {
        const filteredInvoices = invoices.filter(inv => 
            inv.locationId === selectedLocationId &&
            new Date(inv.issueDate) >= dateRange.startDate &&
            new Date(inv.issueDate) <= dateRange.endDate,
        );

        const filteredExpenses = operatingExpenses.filter(exp =>
            exp.locationId === selectedLocationId &&
            new Date(exp.date) >= dateRange.startDate &&
            new Date(exp.date) <= dateRange.endDate,
        );

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
        const totalOperatingExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const netProfit = grossProfit - totalOperatingExpenses;

        return {
            totalRevenue,
            costOfGoodsSold,
            grossProfit,
            totalOperatingExpenses,
            netProfit,
        };
    }, [invoices, operatingExpenses, selectedLocationId, dateRange]);

    const ProfitRow: React.FC<{ label: string; value: number; isSub?: boolean; isTotal?: boolean; isNegative?: boolean }> = 
        ({ label, value, isSub = false, isTotal = false, isNegative = false }) => (
        <div className={`flex justify-between items-center py-2 ${isSub ? 'pl-4' : ''} ${isTotal ? 'border-t-2 border-gray-700 font-bold' : 'border-t border-gray-800'}`}>
            <span className={isTotal ? 'text-lg text-white' : 'text-gray-300'}>{label}</span>
            <span className={`font-mono ${isTotal ? 'text-xl' : 'text-base'} ${isNegative ? 'text-red-400' : isTotal ? 'text-green-400' : 'text-white'}`}>
                {formatCurrency(value)}
            </span>
        </div>
    );

    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <div className="p-6">
                <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Estado de Resultados (Pérdidas y Ganancias)</h2>
                <div className="space-y-1">
                    <ProfitRow label="Ingresos Totales (Ventas)" value={pnlData.totalRevenue} />
                    <ProfitRow label="(-) Costo de Ventas (Repuestos)" value={pnlData.costOfGoodsSold} isSub />
                    <ProfitRow label="(=) Utilidad Bruta" value={pnlData.grossProfit} isTotal isNegative={pnlData.grossProfit < 0} />
                    <ProfitRow label="(-) Gastos Operativos" value={pnlData.totalOperatingExpenses} isSub />
                    <ProfitRow label="(=) Utilidad Neta (Beneficio)" value={pnlData.netProfit} isTotal isNegative={pnlData.netProfit < 0}/>
                </div>
            </div>
        </div>
    );
};

export default ProfitAndLossReport;