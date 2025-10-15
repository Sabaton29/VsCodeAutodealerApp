

import React, { useState, useMemo } from 'react';
import { PurchaseOrder, Permission } from '../../types';
import { PURCHASE_ORDER_STATUS_DISPLAY_CONFIG } from '../../constants';
import { Icon } from '../Icon';

interface PurchaseOrdersViewProps {
    selectedLocationId: string;
    purchaseOrders: PurchaseOrder[];
    hasPermission: (permission: Permission) => boolean;
    onCreatePurchaseOrder: () => void;
    onViewPurchaseOrderDetails: (id: string) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const PurchaseOrdersView: React.FC<PurchaseOrdersViewProps> = ({ selectedLocationId, purchaseOrders, hasPermission, onCreatePurchaseOrder, onViewPurchaseOrderDetails }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPOs = useMemo(() => {
        if (!searchTerm) {
            return purchaseOrders;
        }
        return purchaseOrders.filter(po =>
            po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.status.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [searchTerm, purchaseOrders]);

    const isGlobalView = selectedLocationId === 'ALL_LOCATIONS';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Órdenes de Compra</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">Gestiona los pedidos de repuestos y consumibles a tus proveedores.</p>
            </div>

            <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
                <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="relative w-full sm:max-w-xs">
                        <Icon name="search" className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar por ID, proveedor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red"
                        />
                    </div>
                    {hasPermission('manage:purchase_orders') && (
                        <button
                            onClick={onCreatePurchaseOrder}
                            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isGlobalView}
                            title={isGlobalView ? 'Seleccione una sede para crear una orden de compra' : 'Crear Orden de Compra'}
                        >
                            <Icon name="plus" className="w-5 h-5" />
                            Crear Orden de Compra
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Orden #</th>
                                <th scope="col" className="px-6 py-3">Proveedor</th>
                                <th scope="col" className="px-6 py-3">Fecha Emisión</th>
                                <th scope="col" className="px-6 py-3">Estado</th>
                                <th scope="col" className="px-6 py-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPOs.length > 0 ? (
                                filteredPOs.map((po) => {
                                    const statusConfig = PURCHASE_ORDER_STATUS_DISPLAY_CONFIG[po.status];
                                    return (
                                        <tr 
                                            key={po.id} 
                                            onClick={() => onViewPurchaseOrderDetails(po.id)}
                                            className="bg-light dark:bg-dark-light border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                                        >
                                            <th scope="row" className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap dark:text-white">{po.id}</th>
                                            <td className="px-6 py-4">{po.supplierName}</td>
                                            <td className="px-6 py-4">{formatDate(po.issueDate)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>{po.status}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-semibold text-light-text dark:text-dark-text">{formatCurrency(po.total)}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">No se encontraron órdenes de compra.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrdersView;
