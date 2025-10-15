import React, { useMemo } from 'react';
import { PettyCashTransaction, Supplier } from '../types';
import MetricCard from './MetricCard';
import { Icon } from './Icon';

interface AccountsPayableReportProps {
    pettyCashTransactions: PettyCashTransaction[];
    suppliers: Supplier[];
    selectedLocationId: string;
}

type PayableData = {
    entityId: string;
    entityName: string;
    totalDue: number;
};

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const AccountsPayableReport: React.FC<AccountsPayableReportProps> = ({ pettyCashTransactions, suppliers, selectedLocationId }) => {

    const { reportData, totalPayable } = useMemo(() => {
        const debtMap = new Map<string, number>();
        
        pettyCashTransactions
            .filter(t => t.locationId === selectedLocationId && t.type === 'expense')
            .forEach(t => {
                let entityId: string | undefined;
                if (t.paymentMethod === 'Crédito') {
                    entityId = t.supplierId;
                } else if (t.paymentMethod === 'Tarjeta de Crédito (Socio)') {
                    entityId = t.paymentPartnerId;
                }

                if (entityId) {
                    debtMap.set(entityId, (debtMap.get(entityId) || 0) + t.amount);
                }
            });
        
        const totalPayable = Array.from(debtMap.values()).reduce((sum, debt) => sum + debt, 0);

        const supplierMap = new Map(suppliers.map(s => [s.id, s.name]));

        const reportData = Array.from(debtMap.entries())
            .map(([entityId, totalDue]) => ({
                entityId,
                entityName: supplierMap.get(entityId) || 'Entidad Desconocida',
                totalDue,
            }))
            .sort((a, b) => b.totalDue - a.totalDue);

        return { reportData, totalPayable };
    }, [pettyCashTransactions, suppliers, selectedLocationId]);

    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text p-6 border-b border-gray-200 dark:border-gray-800">
                Análisis de Cuentas por Pagar
            </h2>
            <div className="p-6">
                 <MetricCard 
                    title="Total por Pagar a Proveedores y Socios"
                    value={formatCurrency(totalPayable)}
                    icon={<Icon name="truck" className="w-8 h-8"/>}
                    variant="danger"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Proveedor / Socio</th>
                            <th className="px-6 py-3 text-right">Monto Pendiente</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {reportData.length > 0 ? (
                            reportData.map(data => (
                                <tr key={data.entityId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{data.entityName}</td>
                                    <td className="px-6 py-4 text-right text-red-500 dark:text-red-400 font-mono font-semibold text-base">{formatCurrency(data.totalDue)}</td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={2} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No hay cuentas por pagar pendientes.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AccountsPayableReport;