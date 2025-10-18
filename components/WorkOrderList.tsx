import React, { useMemo } from 'react';
import { STATUS_DISPLAY_CONFIG } from '../constants';
import type { WorkOrder, StaffMember, KanbanStage, Permission, Quote } from '../types';
import { UserRole } from '../types';
import { Icon } from './Icon';
import WorkOrderActions from './WorkOrderActions';

interface WorkOrderListProps {
    workOrders: WorkOrder[];
    quotes: Quote[];
    staffMembers: StaffMember[];
    onAssignTechnician: (workOrderId: string, staffMemberId: string) => void;
    onAdvanceStage: (workOrderId: string, currentStage: KanbanStage) => void;
    onRetreatStage?: (workOrderId: string, currentStage: KanbanStage) => void;
    onCancelOrder: (workOrderId: string) => void;
    onStartDiagnostic: (workOrderId: string) => void;
    onViewDetails: (workOrderId: string) => void;
    onRegisterDelivery: (workOrderId: string) => void;
    onPrintReport?: (workOrderId: string) => void;
    onViewHistory?: (workOrderId: string) => void;
    onReopenOrder?: (workOrderId: string) => void;
    hasPermission: (permission: Permission) => boolean;
    onEditWorkOrder: (workOrder: WorkOrder) => void;
}

const WorkOrderRow: React.FC<{
    order: WorkOrder;
    quote?: Quote;
    staffMembers: StaffMember[];
    onAssignTechnician: (workOrderId: string, staffMemberId: string) => void;
    onAdvanceStage: (workOrderId: string, currentStage: KanbanStage) => void;
    onRetreatStage?: (workOrderId: string, currentStage: KanbanStage) => void;
    onCancelOrder: (workOrderId: string) => void;
    onStartDiagnostic: (workOrderId: string) => void;
    onViewDetails: (workOrderId: string) => void;
    onRegisterDelivery: (workOrderId: string) => void;
    onPrintReport?: (workOrderId: string) => void;
    onViewHistory?: (workOrderId: string) => void;
    onReopenOrder?: (workOrderId: string) => void;
    onEdit: () => void;
    hasPermission: (permission: Permission) => boolean;
}> = ({ order, quote, staffMembers, onAssignTechnician, onAdvanceStage, onRetreatStage, onCancelOrder, onStartDiagnostic, onViewDetails, onRegisterDelivery, onPrintReport, onViewHistory, onReopenOrder, hasPermission, onEdit }) => {
    const statusConfig = STATUS_DISPLAY_CONFIG[order.status] || { bg: 'bg-gray-200 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200' };

    const mechanics = useMemo(() =>
        staffMembers.filter(s => s.role === UserRole.MECANICO),
        [staffMembers],
    );

    return (
        <tr className="bg-light dark:bg-dark-light border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                {order.client?.name || 'Cliente no encontrado'}
            </td>
            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{`${order.vehicle?.make || 'N/A'} ${order.vehicle?.model || 'N/A'} (${order.vehicle?.plate || 'N/A'})`}</td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                    {order.status}
                </span>
            </td>
            <td className="px-6 py-4 text-right font-mono text-light-text dark:text-dark-text">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(order.total)}
            </td>
            <td className="px-6 py-4 text-right">
                <WorkOrderActions
                    workOrder={order}
                    quote={quote}
                    technicians={mechanics}
                    onAssignTechnician={(techId) => onAssignTechnician(order.id, techId)}
                    onAdvanceStage={() => onAdvanceStage(order.id, order.stage)}
                    onRetreatStage={onRetreatStage ? () => onRetreatStage(order.id, order.stage) : undefined}
                    onCancelOrder={() => onCancelOrder(order.id)}
                    onStartDiagnostic={() => onStartDiagnostic(order.id)}
                    onViewDetails={() => onViewDetails(order.id)}
                    onRegisterDelivery={() => onRegisterDelivery(order.id)}
                    onPrintReport={onPrintReport ? () => onPrintReport(order.id) : undefined}
                    onViewHistory={onViewHistory ? () => onViewHistory(order.id) : undefined}
                    onReopenOrder={onReopenOrder ? () => onReopenOrder(order.id) : undefined}
                    onEdit={onEdit}
                    hasPermission={hasPermission}
                />
            </td>
        </tr>
    );
};


const WorkOrderList: React.FC<WorkOrderListProps> = ({ workOrders, quotes, staffMembers, onAssignTechnician, onAdvanceStage, onCancelOrder, onStartDiagnostic, onViewDetails, onRegisterDelivery, onPrintReport, onViewHistory, onReopenOrder, hasPermission, onEditWorkOrder }) => {
    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Órdenes de Trabajo Recientes</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Listado de las últimas órdenes gestionadas en la sede.</p>
            </div>

            <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Cliente</th>
                            <th scope="col" className="px-6 py-3">Vehículo</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                            <th scope="col" className="px-6 py-3 text-right">Total</th>
                            <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workOrders.length > 0 ? (
                            workOrders.map(order => {
                                const quote = quotes.find(q => (order.linkedQuoteIds || []).includes(q.id));
                                return (
                                    <WorkOrderRow 
                                        key={order.id} 
                                        order={order}
                                        quote={quote}
                                        staffMembers={staffMembers}
                                        onAssignTechnician={onAssignTechnician}
                                        onAdvanceStage={onAdvanceStage}
                                        onCancelOrder={onCancelOrder}
                                        onStartDiagnostic={onStartDiagnostic}
                                        onViewDetails={onViewDetails}
                                        onRegisterDelivery={onRegisterDelivery}
                                        onPrintReport={onPrintReport}
                                        onViewHistory={onViewHistory}
                                        onReopenOrder={onReopenOrder}
                                        hasPermission={hasPermission}
                                        onEdit={() => onEditWorkOrder(order)}
                                    />
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">No hay órdenes de trabajo para esta sede.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WorkOrderList;