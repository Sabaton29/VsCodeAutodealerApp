
import React, { useMemo } from 'react';
import { Invoice, StaffMember, UserRole, WorkOrder } from '../types';

interface AdvisorPerformanceReportProps {
    invoices: Invoice[];
    workOrders: WorkOrder[];
    staffMembers: StaffMember[];
    selectedLocationId: string;
    dateRange: { startDate: Date; endDate: Date };
}

type PerformanceData = {
    advisorId: string;
    advisorName: string;
    invoicesIssued: number;
    totalValueBilled: number;
    totalProfitGenerated: number;
};

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const AdvisorPerformanceReport: React.FC<AdvisorPerformanceReportProps> = ({ invoices, workOrders, staffMembers, selectedLocationId, dateRange }) => {
    
    const performanceData = useMemo<PerformanceData[]>(() => {
        const advisors = staffMembers.filter(s => s.role === UserRole.ASESOR_SERVICIO && s.locationId === selectedLocationId);
        const workOrdersMap = new Map(workOrders.map(wo => [wo.id, wo]));

        const performanceMap = new Map<string, PerformanceData>(
            advisors.map(a => [a.id, {
                advisorId: a.id,
                advisorName: a.name,
                invoicesIssued: 0,
                totalValueBilled: 0,
                totalProfitGenerated: 0,
            }]),
        );

        for (const inv of invoices) {
            const invoiceDate = new Date(inv.issueDate);
            if (inv.locationId !== selectedLocationId || invoiceDate < dateRange.startDate || invoiceDate > dateRange.endDate) {
                continue;
            }

            const wo = workOrdersMap.get(inv.workOrderId);
            const advisorId = wo?.advisorId;
            
            if (advisorId && performanceMap.has(advisorId)) {
                const advisorData = performanceMap.get(advisorId)!;
                advisorData.invoicesIssued += 1;
                advisorData.totalValueBilled += inv.total;

                // Calculate profit from invoice items
                const inventoryProfit = inv.items.reduce((acc, item) => {
                    if (item.type === 'inventory' && item.costPrice) {
                        return acc + (item.unitPrice - item.costPrice) * item.quantity;
                    }
                    return acc;
                }, 0);
                const servicesProfit = inv.items.reduce((acc, item) => {
                    if (item.type === 'service') {
                        return acc + (item.unitPrice * item.quantity);
                    }
                    return acc;
                }, 0);
                advisorData.totalProfitGenerated += (inventoryProfit + servicesProfit);
            }
        }


        return Array.from(performanceMap.values()).sort((a, b) => b.totalValueBilled - a.totalValueBilled);

    }, [invoices, workOrders, staffMembers, selectedLocationId, dateRange]);

    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text p-6 border-b border-gray-200 dark:border-gray-800">
                Rendimiento por Asesor de Servicio
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Asesor</th>
                            <th className="px-6 py-3 text-center">Facturas Emitidas</th>
                            <th className="px-6 py-3 text-right">Valor Facturado</th>
                            <th className="px-6 py-3 text-right">Utilidad Generada</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {performanceData.length > 0 ? (
                            performanceData.map(data => (
                                <tr key={data.advisorId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{data.advisorName}</td>
                                    <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-300 font-mono text-base">{data.invoicesIssued}</td>
                                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-mono font-semibold text-base">{formatCurrency(data.totalValueBilled)}</td>
                                    <td className="px-6 py-4 text-right text-green-500 font-mono font-semibold text-base">{formatCurrency(data.totalProfitGenerated)}</td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No hay datos de rendimiento para el período seleccionado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdvisorPerformanceReport;
