
import React, { useMemo } from 'react';
import { Invoice, InvoiceStatus } from '../types';
import { Icon } from './Icon';
import MetricCard from './MetricCard';

interface AccountsReceivableReportProps {
    invoices: Invoice[];
    selectedLocationId: string;
    onViewInvoiceDetails: (invoiceId: string) => void;
}

type ReceivableData = {
    invoiceId: string;
    clientName: string;
    issueDate: string;
    dueDate: string;
    daysOverdue: number;
    amountDue: number;
};

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const AccountsReceivableReport: React.FC<AccountsReceivableReportProps> = ({ invoices, selectedLocationId, onViewInvoiceDetails }) => {

    const { reportData, totalReceivable, overdueCount } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const pendingInvoices = invoices.filter(inv =>
            inv.locationId === selectedLocationId &&
            (inv.status === InvoiceStatus.PENDIENTE || inv.status === InvoiceStatus.VENCIDA),
        );

        const totalReceivable = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);
        
        const reportData = pendingInvoices.map(inv => {
            const dueDate = new Date(inv.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const daysOverdue = today > dueDate ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
            return {
                invoiceId: inv.id,
                clientName: inv.clientName,
                issueDate: inv.issueDate,
                dueDate: inv.dueDate,
                daysOverdue,
                amountDue: inv.total,
            };
        });
        
        const overdueCount = reportData.filter(d => d.daysOverdue > 0).length;

        reportData.sort((a, b) => b.daysOverdue - a.daysOverdue);

        return { reportData, totalReceivable, overdueCount };
    }, [invoices, selectedLocationId]);

    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text p-6 border-b border-gray-200 dark:border-gray-800">
                Análisis de Cuentas por Cobrar
            </h2>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <MetricCard 
                    title="Total por Cobrar"
                    value={formatCurrency(totalReceivable)}
                    icon={<Icon name="wallet" className="w-8 h-8"/>}
                    variant="default"
                />
                <MetricCard 
                    title="Facturas Vencidas"
                    value={String(overdueCount)}
                    icon={<Icon name="exclamation-triangle" className="w-8 h-8"/>}
                    variant="danger"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Factura # / Cliente</th>
                            <th className="px-6 py-3">Fechas (Emisión / Vence)</th>
                            <th className="px-6 py-3 text-center">Días Vencidos</th>
                            <th className="px-6 py-3 text-right">Monto Pendiente</th>
                            <th className="px-6 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {reportData.length > 0 ? (
                            reportData.map(data => (
                                <tr key={data.invoiceId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900 dark:text-white">{data.invoiceId}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{data.clientName}</p>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                        <p>{formatDate(data.issueDate)}</p>
                                        <p className="font-semibold text-red-400">{formatDate(data.dueDate)}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono text-base">
                                        {data.daysOverdue > 0 ? (
                                            <span className="font-bold text-red-500">{data.daysOverdue}</span>
                                        ) : (
                                            <span className="text-gray-400">0</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-mono font-semibold text-base">{formatCurrency(data.amountDue)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => onViewInvoiceDetails(data.invoiceId)} 
                                            className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white"
                                            title="Ver detalles de la factura"
                                        >
                                            <Icon name="eye" className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    ¡Excelente! No hay cuentas por cobrar pendientes.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AccountsReceivableReport;
