
import React from 'react';
import { Icon } from '../Icon';
import { PurchaseOrder, Permission, PurchaseOrderStatus } from '../../types';
import { PURCHASE_ORDER_STATUS_DISPLAY_CONFIG } from '../../constants';

interface PurchaseOrderDetailViewProps {
    purchaseOrder: PurchaseOrder;
    onBack: () => void;
    onReceive: (poId: string) => void;
    hasPermission: (permission: Permission) => boolean;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const PurchaseOrderDetailView: React.FC<PurchaseOrderDetailViewProps> = ({ purchaseOrder, onBack, onReceive, hasPermission }) => {
    
    const statusConfig = PURCHASE_ORDER_STATUS_DISPLAY_CONFIG[purchaseOrder.status];
    const canReceive = hasPermission('receive:purchase_order') && purchaseOrder.status === PurchaseOrderStatus.PEDIDO;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700/50 transition-colors">
                        <Icon name="arrow-left" className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold">Detalle de Orden de Compra</h1>
                        <p className="mt-1 text-gray-400">Orden de Compra #{purchaseOrder.id}</p>
                    </div>
                </div>
                <span className={`px-4 py-2 text-sm font-bold rounded-md ${statusConfig.bg} ${statusConfig.text}`}>
                    {purchaseOrder.status}
                </span>
            </div>
            
            <div className="bg-dark-light rounded-xl p-3 flex flex-wrap items-center justify-end gap-3">
                 <button 
                    onClick={() => onReceive(purchaseOrder.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!canReceive}
                >
                    <Icon name="check-circle" className="w-4 h-4" /> Marcar como Recibido
                </button>
            </div>

            <div className="bg-dark-light rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-gray-700 pb-6">
                    <div>
                        <h3 className="font-bold text-white mb-2">Proveedor</h3>
                        <p className="text-gray-300">{purchaseOrder.supplierName}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-white mb-2">Fecha de Emisión</h3>
                        <p className="text-gray-300">{formatDate(purchaseOrder.issueDate)}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-white mb-2">Entrega Estimada</h3>
                        <p className="text-gray-300">{formatDate(purchaseOrder.expectedDeliveryDate)}</p>
                    </div>
                </div>
                
                <div className="mt-6">
                    <h3 className="text-xl font-bold text-white mb-4">Artículos Pedidos</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-black dark:bg-gray-900/20 text-xs text-gray-400 uppercase">
                                <tr>
                                    <th className="px-4 py-2 text-left">Descripción</th>
                                    <th className="px-4 py-2 text-center w-24">Cant.</th>
                                    <th className="px-4 py-2 text-right w-36">Costo Unit.</th>
                                    <th className="px-4 py-2 text-right w-36">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {purchaseOrder.items.map(item => (
                                    <tr key={item.inventoryItemId}>
                                        <td className="px-4 py-3 font-medium">{item.description}</td>
                                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right font-mono">{formatCurrency(item.cost)}</td>
                                        <td className="px-4 py-3 text-right font-mono text-gray-300">{formatCurrency(item.quantity * item.cost)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 mt-6 gap-6">
                     <div className="text-sm text-gray-400">
                        {purchaseOrder.notes && (
                            <>
                                <h4 className="font-bold text-gray-300 mb-2">Notas</h4>
                                <p className="italic">"{purchaseOrder.notes}"</p>
                            </>
                        )}
                    </div>
                     <div className="bg-black dark:bg-gray-900/20 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between items-center text-gray-300"><span>Subtotal:</span> <span className="font-mono">{formatCurrency(purchaseOrder.subtotal)}</span></div>
                        <div className="flex justify-between items-center text-gray-300"><span>IVA:</span> <span className="font-mono">{formatCurrency(purchaseOrder.taxAmount)}</span></div>
                        <div className="flex justify-between items-center text-white text-xl font-bold border-t border-gray-700 pt-2 mt-2"><span>Total Orden:</span> <span className="font-mono text-brand-red">{formatCurrency(purchaseOrder.total)}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderDetailView;
