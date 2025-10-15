import React, { useMemo } from 'react';
import { Client, Invoice, WorkOrder } from '../types';
import { Icon } from './Icon';
import MetricCard from './MetricCard';

interface ClientRetentionReportProps {
    clients: Client[];
    invoices: Invoice[];
    workOrders: WorkOrder[];
    selectedLocationId: string;
}

type ClientReportData = {
    clientId: string;
    clientName: string;
    lastVehicle: string;
    lastVisit: string | null;
    historicalSpending: number;
    nextMaintenanceSuggested: string | null;
};

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const ClientRetentionReport: React.FC<ClientRetentionReportProps> = ({ clients, invoices, workOrders, selectedLocationId }) => {

    const { reportData, retentionRate, clientLifeValue } = useMemo(() => {
        const clientsInLocation = clients.filter(c => c.locationId === selectedLocationId);
        const workOrdersMap = new Map(workOrders.map(wo => [wo.id, wo]));
        
        const invoicesByClient = invoices.reduce((acc, inv) => {
            if (inv.locationId === selectedLocationId) {
                if (!acc[inv.clientId]) {
                    acc[inv.clientId] = [];
                }
                acc[inv.clientId].push(inv);
            }
            return acc;
        }, {} as Record<string, Invoice[]>);

        const totalClients = clientsInLocation.length;
        const retainedClients = clientsInLocation.filter(c => (invoicesByClient[c.id]?.length || 0) > 1).length;
        const retentionRate = totalClients > 0 ? (retainedClients / totalClients) * 100 : 0;

        const totalRevenue = Object.values(invoicesByClient).flat().reduce((sum, inv) => sum + inv.total, 0);
        const clientLifeValue = totalClients > 0 ? totalRevenue / totalClients : 0;
        
        const reportData = clientsInLocation.map(client => {
            const clientInvoices = (invoicesByClient[client.id] || []).sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
            const lastInvoice = clientInvoices[0];

            let nextMaintenanceSuggested: string | null = null;
            if (lastInvoice) {
                const workOrderForInvoice = workOrdersMap.get(lastInvoice.workOrderId);
                if (workOrderForInvoice?.nextMaintenanceDate) {
                    nextMaintenanceSuggested = formatDate(workOrderForInvoice.nextMaintenanceDate);
                } else {
                    const hasOilChange = lastInvoice.items?.some(item => item.id === 'SVC-001'); // Cambio de Aceite y Filtro
                    if (hasOilChange) {
                        const lastVisitDate = new Date(lastInvoice.issueDate);
                        const nextDate = new Date(lastVisitDate.setMonth(lastVisitDate.getMonth() + 6));
                        nextMaintenanceSuggested = formatDate(nextDate.toISOString());
                    }
                }
            }

            return {
                clientId: client.id,
                clientName: client.name,
                lastVehicle: lastInvoice?.vehicleSummary || 'N/A',
                lastVisit: lastInvoice ? formatDate(lastInvoice.issueDate) : null,
                historicalSpending: clientInvoices.reduce((sum, inv) => sum + inv.total, 0),
                nextMaintenanceSuggested,
            };
        }).sort((a, b) => b.historicalSpending - a.historicalSpending);

        return { reportData, retentionRate, clientLifeValue };

    }, [clients, invoices, workOrders, selectedLocationId]);

    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <MetricCard 
                    title="Tasa de Retención de Clientes"
                    value={`${retentionRate.toFixed(1)}%`}
                    icon={<Icon name="users" className="w-8 h-8"/>}
                    variant="default"
                />
                <MetricCard 
                    title="Valor de Vida del Cliente (CLV)"
                    value={formatCurrency(clientLifeValue)}
                    icon={<Icon name="chart" className="w-8 h-8"/>}
                    variant="success"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Cliente / Último Vehículo</th>
                            <th className="px-6 py-3">Última Visita</th>
                            <th className="px-6 py-3 text-right">Gasto Histórico</th>
                            <th className="px-6 py-3 text-center">Próximo Mantenimiento Sugerido</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {reportData.length > 0 ? (
                            reportData.map(data => (
                                <tr key={data.clientId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900 dark:text-white">{data.clientName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{data.lastVehicle}</p>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{data.lastVisit || 'Sin historial'}</td>
                                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-mono font-semibold text-base">{formatCurrency(data.historicalSpending)}</td>
                                    <td className="px-6 py-4 text-center">
                                        {data.nextMaintenanceSuggested ? (
                                            <span className="px-2 py-1 text-xs font-bold bg-blue-200 text-blue-800 dark:bg-blue-800/50 dark:text-blue-200 rounded-full">
                                                {data.nextMaintenanceSuggested}
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No hay clientes para analizar en esta sede.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientRetentionReport;