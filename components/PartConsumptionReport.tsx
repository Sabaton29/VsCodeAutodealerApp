
import React, { useMemo } from 'react';
import { Invoice, InventoryItem } from '../types';

interface PartConsumptionReportProps {
    invoices: Invoice[];
    inventoryItems: InventoryItem[];
    selectedLocationId: string;
    dateRange: { startDate: Date; endDate: Date };
}

type ConsumptionData = {
    itemId: string;
    itemName: string;
    quantitySold: number;
    totalRevenue: number;
    totalProfit: number;
};

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const PartConsumptionReport: React.FC<PartConsumptionReportProps> = ({ invoices, inventoryItems, selectedLocationId, dateRange }) => {
    
    const consumptionData = useMemo<ConsumptionData[]>(() => {
        const consumptionMap = new Map<string, ConsumptionData>();

        const filteredInvoices = invoices.filter(inv =>
            inv.locationId === selectedLocationId &&
            new Date(inv.issueDate) >= dateRange.startDate &&
            new Date(inv.issueDate) <= dateRange.endDate,
        );

        for (const inv of filteredInvoices) {
            for (const item of inv.items) {
                if (item.type === 'inventory') {
                    const consumption = consumptionMap.get(item.id) || {
                        itemId: item.id,
                        itemName: item.description,
                        quantitySold: 0,
                        totalRevenue: 0,
                        totalProfit: 0,
                    };
                    consumption.quantitySold += item.quantity;
                    consumption.totalRevenue += item.unitPrice * item.quantity;
                    if (item.costPrice) {
                        consumption.totalProfit += (item.unitPrice - item.costPrice) * item.quantity;
                    }
                    consumptionMap.set(item.id, consumption);
                }
            }
        }
        return Array.from(consumptionMap.values()).sort((a, b) => b.quantitySold - a.quantitySold);
    }, [invoices, selectedLocationId, dateRange]);

    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text p-4 border-b border-gray-200 dark:border-gray-800">
                Consumo de Repuestos
            </h3>
            <div className="overflow-y-auto max-h-96">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400 sticky top-0">
                        <tr>
                            <th className="px-4 py-2">Artículo</th>
                            <th className="px-4 py-2 text-center">Cant. Vendida</th>
                            <th className="px-4 py-2 text-right">Ingreso Total</th>
                            <th className="px-4 py-2 text-right">Utilidad Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {consumptionData.length > 0 ? (
                            consumptionData.map(data => (
                                <tr key={data.itemId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{data.itemName}</td>
                                    <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-300 font-mono text-base">{data.quantitySold}</td>
                                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white font-mono">{formatCurrency(data.totalRevenue)}</td>
                                    <td className="px-4 py-3 text-right text-green-500 font-mono">{formatCurrency(data.totalProfit)}</td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No hay consumo de repuestos para el período.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PartConsumptionReport;
