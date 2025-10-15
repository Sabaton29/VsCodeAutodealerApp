
import React, { useMemo, useState } from 'react';
import { Invoice } from '../types';
import { Icon } from './Icon';

interface ProfitabilityReportProps {
    invoices: Invoice[];
    selectedLocationId: string;
    dateRange: { startDate: Date; endDate: Date };
}

type ProfitabilityData = {
    invoiceId: string;
    clientName: string;
    vehicleSummary: string;
    issueDate: string;
    totalSale: number;
    partsCost: number;
    commissionCost: number;
    factoringCost: number;
    grossProfit: number;
    margin: number;
};

type SortKey = keyof ProfitabilityData;
type SortDirection = 'ascending' | 'descending';

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const SortableHeader: React.FC<{
    title: string;
    sortKey: SortKey;
    sortConfig: { key: SortKey; direction: SortDirection };
    onSort: (key: SortKey) => void;
    className?: string;
}> = ({ title, sortKey, sortConfig, onSort, className = '' }) => {
    const isSorted = sortConfig.key === sortKey;
    const iconName = sortConfig.direction === 'ascending' ? 'chevron-up' : 'chevron-down';

    return (
        <th scope="col" className={`px-6 py-3 ${className}`}>
            <button className="flex items-center gap-1 uppercase" onClick={() => onSort(sortKey)}>
                {title}
                {isSorted && <Icon name={iconName} className="w-4 h-4" />}
            </button>
        </th>
    );
};

const ProfitabilityByWorkOrder: React.FC<ProfitabilityReportProps> = ({ invoices, selectedLocationId, dateRange }) => {
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'grossProfit', direction: 'descending' });

    const profitabilityData = useMemo<ProfitabilityData[]>(() => {
        const filteredInvoices = invoices.filter(inv => 
            inv.locationId === selectedLocationId &&
            new Date(inv.issueDate) >= dateRange.startDate &&
            new Date(inv.issueDate) <= dateRange.endDate,
        );

        return filteredInvoices.map(inv => {
            const partsCost = inv.items.reduce((acc, item) => {
                if (item.type === 'inventory' && item.costPrice) {
                    return acc + (item.costPrice * item.quantity);
                }
                return acc;
            }, 0);
            
            const commissionCost = inv.items.reduce((acc, item) => {
                return acc + (item.commission || 0);
            }, 0);

            const factoringCost = inv.factoringInfo?.commission || 0;

            const saleWithoutTax = inv.subtotal;
            const totalCosts = partsCost + commissionCost + factoringCost;
            const grossProfit = saleWithoutTax - totalCosts;
            const margin = saleWithoutTax > 0 ? (grossProfit / saleWithoutTax) * 100 : 0;

            return {
                invoiceId: inv.id,
                clientName: inv.clientName,
                vehicleSummary: inv.vehicleSummary,
                issueDate: inv.issueDate,
                totalSale: inv.total,
                partsCost,
                commissionCost,
                factoringCost,
                grossProfit,
                margin,
            };
        });
    }, [invoices, selectedLocationId, dateRange]);

    const sortedData = useMemo(() => {
        return [...profitabilityData].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }, [profitabilityData, sortConfig]);
    
    const handleSort = (key: SortKey) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'descending' ? 'ascending' : 'descending',
        }));
    };

    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text p-6 border-b border-gray-200 dark:border-gray-800">
                Análisis de Rentabilidad por Orden de Servicio
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Factura # / Cliente</th>
                            <SortableHeader title="Venta Total" sortKey="totalSale" sortConfig={sortConfig} onSort={handleSort} className="text-right" />
                            <th scope="col" className="px-6 py-3 text-right">Costos Totales</th>
                            <SortableHeader title="Utilidad Bruta" sortKey="grossProfit" sortConfig={sortConfig} onSort={handleSort} className="text-right" />
                            <SortableHeader title="Margen %" sortKey="margin" sortConfig={sortConfig} onSort={handleSort} className="text-right" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {sortedData.length > 0 ? (
                            sortedData.map(data => (
                                <tr key={data.invoiceId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900 dark:text-white">{data.invoiceId}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{data.clientName}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-300 font-mono">{formatCurrency(data.totalSale)}</td>
                                    <td className="px-6 py-4 text-right text-red-500 dark:text-red-400 font-mono">
                                        {formatCurrency(data.partsCost + data.commissionCost + data.factoringCost)}
                                        <p className="text-xs">R: {formatCurrency(data.partsCost)} / C: {formatCurrency(data.commissionCost)} / F: {formatCurrency(data.factoringCost)}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right text-green-600 dark:text-green-400 font-mono font-semibold text-base">{formatCurrency(data.grossProfit)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${data.margin > 20 ? 'bg-green-200 text-green-800 dark:bg-green-800/50 dark:text-green-200' : 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800/50 dark:text-yellow-200'}`}>
                                            {data.margin.toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No hay facturas en el período seleccionado para analizar.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProfitabilityByWorkOrder;
