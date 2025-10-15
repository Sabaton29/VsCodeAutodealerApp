
import React, { useMemo } from 'react';
import MetricCard from './MetricCard';
import { Icon } from './Icon';
import { WorkOrder, StaffMember, Invoice } from '../types';

interface AdvisorDashboardProps {
    advisor: StaffMember;
    workOrders: WorkOrder[];
    invoices: Invoice[];
}

type CommissionDetail = {
    invoiceId: string;
    clientName: string;
    profit: number;
    commission: number;
};

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const AdvisorDashboard: React.FC<AdvisorDashboardProps> = ({ advisor, workOrders, invoices }) => {

    const commissionData = useMemo(() => {
        if (!advisor.commissionRate) {
            return { totalCommission: 0, details: [] };
        }
        
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const day = now.getDate();

        let startDate: Date;
        let endDate: Date;

        if (day <= 15) {
            startDate = new Date(year, month, 1, 0, 0, 0, 0);
            endDate = new Date(year, month, 15, 23, 59, 59, 999);
        } else {
            startDate = new Date(year, month, 16, 0, 0, 0, 0);
            const lastDayOfMonth = new Date(year, month + 1, 0);
            endDate = new Date(year, month, lastDayOfMonth.getDate(), 23, 59, 59, 999);
        }
        
        const workOrdersMap = new Map(workOrders.map(wo => [wo.id, wo]));

        const advisorInvoices = invoices.filter(inv => {
            const invDate = new Date(inv.issueDate);
            const wo = workOrdersMap.get(inv.workOrderId);
            return wo?.advisorId === advisor.id && invDate >= startDate && invDate <= endDate;
        });

        const details: CommissionDetail[] = [];
        let totalCommission = 0;

        for (const inv of advisorInvoices) {
            const profitOnInvoice = inv.items.reduce((profit, item) => {
                const itemRevenue = (item.unitPrice * item.quantity) - (item.discount || 0);
                let itemCost = item.commission || 0; // B2B commission is a cost
                if (item.type === 'inventory' && item.costPrice) {
                    itemCost += item.costPrice * item.quantity;
                }
                return profit + (itemRevenue - itemCost);
            }, 0);

            if (profitOnInvoice > 0) {
                const commissionEarned = profitOnInvoice * (advisor.commissionRate! / 100);
                totalCommission += commissionEarned;
                details.push({
                    invoiceId: inv.id,
                    clientName: inv.clientName,
                    profit: profitOnInvoice,
                    commission: commissionEarned,
                });
            }
        }
        
        return { totalCommission, details: details.sort((a, b) => b.commission - a.commission) };

    }, [advisor, workOrders, invoices]);
    
    const periodDescription = useMemo(() => {
        const day = new Date().getDate();
        return day <= 15 ? '1ra Quincena' : '2da Quincena';
    }, []);

    return (
        <div className="space-y-8">
            <h1 className="text-2xl md:text-3xl font-bold text-light-text dark:text-dark-text">Hola, {advisor.name.split(' ')[0]}</h1>
            
            <div className="grid grid-cols-1">
                <MetricCard 
                    title="Comisiones Acumuladas" 
                    value={formatCurrency(commissionData.totalCommission)} 
                    icon={<Icon name="wallet" className="w-8 h-8" />}
                    change={periodDescription}
                    variant="success"
                />
            </div>

            <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Facturas que Generan Comisión ({periodDescription})</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Factura #</th>
                                <th scope="col" className="px-6 py-3">Cliente</th>
                                <th scope="col" className="px-6 py-3 text-right">Utilidad Generada</th>
                                <th scope="col" className="px-6 py-3 text-right">Tu Comisión</th>
                            </tr>
                        </thead>
                        <tbody>
                            {commissionData.details.length > 0 ? (
                                commissionData.details.map(detail => (
                                    <tr key={detail.invoiceId} className="bg-light dark:bg-dark-light border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td scope="row" className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap dark:text-white">
                                            {detail.invoiceId}
                                        </td>
                                        <td className="px-6 py-4">{detail.clientName}</td>
                                        <td className="px-6 py-4 text-right font-mono">{formatCurrency(detail.profit)}</td>
                                        <td className="px-6 py-4 text-right font-mono font-semibold text-green-500">{formatCurrency(detail.commission)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500">
                                        Aún no has generado comisiones en este período. ¡Vamos por esas ventas!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdvisorDashboard;
