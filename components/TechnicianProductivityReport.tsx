import React, { useMemo } from 'react';
import { WorkOrder, Quote, StaffMember, Service, WorkOrderStatus, UserRole } from '../types';
import { Icon } from './Icon';

interface TechnicianProductivityReportProps {
    workOrders: WorkOrder[];
    quotes: Quote[];
    staffMembers: StaffMember[];
    services: Service[];
    selectedLocationId: string;
    dateRange: { startDate: Date; endDate: Date };
}

type ProductivityData = {
    technicianId: string;
    technicianName: string;
    completedOrders: number;
    totalHoursBilled: number;
    totalValueBilled: number;
};

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const TechnicianProductivityReport: React.FC<TechnicianProductivityReportProps> = ({ workOrders, quotes, staffMembers, services, selectedLocationId, dateRange }) => {
    
    const productivityData = useMemo<ProductivityData[]>(() => {
        const technicians = staffMembers.filter(s => s.role === UserRole.MECANICO && s.locationId === selectedLocationId);
        const quoteMap = new Map(quotes.map(q => [q.id, q]));
        const serviceMap = new Map(services.map(s => [s.id, s]));

        const productivityMap = new Map<string, ProductivityData>(
            technicians.map(t => [t.id, {
                technicianId: t.id,
                technicianName: t.name,
                completedOrders: 0,
                totalHoursBilled: 0,
                totalValueBilled: 0,
            }]),
        );

        const facturedWorkOrders = workOrders.filter(wo => 
            wo.locationId === selectedLocationId &&
            wo.status === WorkOrderStatus.FACTURADO &&
            wo.staffMemberId &&
            new Date(wo.date) >= dateRange.startDate &&
            new Date(wo.date) <= dateRange.endDate,
        );

        for (const wo of facturedWorkOrders) {
            const techId = wo.staffMemberId;
            if (techId && productivityMap.has(techId)) {
                const techData = productivityMap.get(techId)!;
                techData.completedOrders += 1;

                for (const quoteId of wo.linkedQuoteIds) {
                    const linkedQuote = quoteMap.get(quoteId);
                    if (linkedQuote) {
                        for (const item of linkedQuote.items) {
                            if (item.type === 'service') {
                                techData.totalValueBilled += item.unitPrice * item.quantity;
                                const serviceDetails = serviceMap.get(item.id);
                                if (serviceDetails) {
                                    techData.totalHoursBilled += serviceDetails.durationHours * item.quantity;
                                }
                            }
                        }
                    }
                }
            }
        }

        return Array.from(productivityMap.values()).sort((a, b) => b.totalValueBilled - a.totalValueBilled);

    }, [workOrders, quotes, staffMembers, services, selectedLocationId, dateRange]);

    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text p-6 border-b border-gray-200 dark:border-gray-800">
                Productividad por Técnico
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Técnico</th>
                            <th className="px-6 py-3 text-center">Órdenes Completadas</th>
                            <th className="px-6 py-3 text-center">Horas Facturadas</th>
                            <th className="px-6 py-3 text-right">Total Facturado (Mano de Obra)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {productivityData.length > 0 ? (
                            productivityData.map(data => (
                                <tr key={data.technicianId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{data.technicianName}</td>
                                    <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-300 font-mono text-base">{data.completedOrders}</td>
                                    <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-300 font-mono text-base">{data.totalHoursBilled.toFixed(2)} h</td>
                                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-mono font-semibold text-base">{formatCurrency(data.totalValueBilled)}</td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No hay datos de productividad para el período seleccionado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TechnicianProductivityReport;