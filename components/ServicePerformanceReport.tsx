
import React, { useMemo } from 'react';
import { Invoice, Service } from '../types';

interface ServicePerformanceReportProps {
    invoices: Invoice[];
    services: Service[];
    selectedLocationId: string;
    dateRange: { startDate: Date; endDate: Date };
}

type PerformanceData = {
    serviceId: string;
    serviceName: string;
    timesPerformed: number;
    totalHoursBilled: number;
    totalRevenue: number;
};

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const ServicePerformanceReport: React.FC<ServicePerformanceReportProps> = ({ invoices, services, selectedLocationId, dateRange }) => {

    const performanceData = useMemo<PerformanceData[]>(() => {
        const serviceMap = new Map(services.map(s => [s.id, s]));
        const performanceMap = new Map<string, PerformanceData>();

        const filteredInvoices = invoices.filter(inv =>
            inv.locationId === selectedLocationId &&
            new Date(inv.issueDate) >= dateRange.startDate &&
            new Date(inv.issueDate) <= dateRange.endDate,
        );

        for (const inv of filteredInvoices) {
            for (const item of inv.items) {
                if (item.type === 'service') {
                    const performance = performanceMap.get(item.id) || {
                        serviceId: item.id,
                        serviceName: item.description,
                        timesPerformed: 0,
                        totalHoursBilled: 0,
                        totalRevenue: 0,
                    };
                    performance.timesPerformed += item.quantity;
                    performance.totalRevenue += item.unitPrice * item.quantity;
                    const serviceDetails = serviceMap.get(item.id);
                    if (serviceDetails) {
                        performance.totalHoursBilled += serviceDetails.durationHours * item.quantity;
                    }
                    performanceMap.set(item.id, performance);
                }
            }
        }
        return Array.from(performanceMap.values()).sort((a, b) => b.timesPerformed - a.timesPerformed);
    }, [invoices, services, selectedLocationId, dateRange]);

    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text p-4 border-b border-gray-200 dark:border-gray-800">
                Rendimiento de Servicios
            </h3>
            <div className="overflow-y-auto max-h-96">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400 sticky top-0">
                        <tr>
                            <th className="px-4 py-2">Servicio</th>
                            <th className="px-4 py-2 text-center">Veces Realizado</th>
                            <th className="px-4 py-2 text-center">Horas Facturadas</th>
                            <th className="px-4 py-2 text-right">Ingreso Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {performanceData.length > 0 ? (
                            performanceData.map(data => (
                                <tr key={data.serviceId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{data.serviceName}</td>
                                    <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-300 font-mono text-base">{data.timesPerformed}</td>
                                    <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-300 font-mono text-base">{data.totalHoursBilled.toFixed(2)} h</td>
                                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white font-mono">{formatCurrency(data.totalRevenue)}</td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No hay datos de servicios para el período.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ServicePerformanceReport;
