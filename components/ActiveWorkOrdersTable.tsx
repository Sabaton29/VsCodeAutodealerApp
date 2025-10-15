
import React, { useMemo, memo } from 'react';
import { KanbanStage, UserRole, type WorkOrder, type StaffMember, type Permission, type Quote } from '../types';
import { STAGE_DISPLAY_CONFIG } from '../constants';
import { Icon } from './Icon';
import WorkOrderActions from './WorkOrderActions';
import { calculateBusinessTimeInStage } from '../utils/time';

interface ActiveWorkOrdersTableProps {
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
    onEditWorkOrder: (workOrder: WorkOrder) => void;
    hasPermission: (permission: Permission) => boolean;
    activeFilter: KanbanStage | 'Todos';
    sortConfig: { key: string; direction: 'ascending' | 'descending' } | null;
    requestSort: (key: string) => void;
}

const SortableTh: React.FC<{
    children: React.ReactNode;
    sortKey: string;
    sortConfig: { key: string; direction: 'ascending' | 'descending' } | null;
    requestSort: (key: string) => void;
}> = ({ children, sortKey, sortConfig, requestSort }) => {
    const isSorted = sortConfig?.key === sortKey;
    const iconName = sortConfig?.direction === 'ascending' ? 'chevron-up' : 'chevron-down';

    return (
        <th scope="col" className="px-5 py-3">
            <button className="flex items-center gap-1 uppercase" onClick={() => requestSort(sortKey)}>
                <span>{children}</span>
                {isSorted && <Icon name={iconName} className="w-4 h-4 flex-shrink-0" />}
            </button>
        </th>
    );
};


const ActiveWorkOrdersTable: React.FC<ActiveWorkOrdersTableProps> = memo(({ workOrders, quotes, staffMembers, onAssignTechnician, onAdvanceStage, onRetreatStage, onCancelOrder, onStartDiagnostic, onViewDetails, onRegisterDelivery, hasPermission, activeFilter, sortConfig, requestSort, onEditWorkOrder }) => {
    const staffMap = useMemo(() => new Map(staffMembers.map(t => [t.id, t.name])), [staffMembers]);
    
    const showDeliveredSeparately = activeFilter === 'Todos';

    const activeOrders = useMemo(() => 
        showDeliveredSeparately 
            ? workOrders.filter(wo => wo.stage !== KanbanStage.ENTREGADO) 
            : (activeFilter !== KanbanStage.ENTREGADO ? workOrders : []),
    [workOrders, showDeliveredSeparately, activeFilter]);
    
    const deliveredOrders = useMemo(() => 
        showDeliveredSeparately 
            ? workOrders.filter(wo => wo.stage === KanbanStage.ENTREGADO)
            : (activeFilter === KanbanStage.ENTREGADO ? workOrders : []),
    [workOrders, showDeliveredSeparately, activeFilter]);

    const noOrdersMessage = activeFilter === 'Todos'
        ? "No hay órdenes de trabajo."
        : `No hay órdenes de trabajo en etapa de ${activeFilter}.`;

    return (
        <div className="bg-dark-light rounded-xl overflow-hidden">
             <div className="p-5">
                <h2 className="text-xl font-bold text-dark-text">Órdenes de Servicio</h2>
                <p className="text-sm text-gray-400 mt-1">
                    {activeFilter === 'Todos'
                        ? 'Mostrando todas las órdenes activas y entregadas recientemente.'
                        : `Mostrando órdenes en etapa: ${activeFilter}`
                    }
                </p>
            </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-400 uppercase bg-black dark:bg-gray-900/20">
                        <tr>
                            <SortableTh sortKey="id" sortConfig={sortConfig} requestSort={requestSort}>Orden</SortableTh>
                            <SortableTh sortKey="plate" sortConfig={sortConfig} requestSort={requestSort}>Placa / Cliente / Vehículo</SortableTh>
                            <SortableTh sortKey="serviceRequested" sortConfig={sortConfig} requestSort={requestSort}>Servicio Solicitado</SortableTh>
                            <SortableTh sortKey="technician" sortConfig={sortConfig} requestSort={requestSort}>Técnico</SortableTh>
                            <SortableTh sortKey="timeInStage" sortConfig={sortConfig} requestSort={requestSort}>Tiempo en Etapa (Hábil)</SortableTh>
                            <SortableTh sortKey="stage" sortConfig={sortConfig} requestSort={requestSort}>Etapa Actual</SortableTh>
                            <th scope="col" className="px-5 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {activeOrders.length === 0 && deliveredOrders.length === 0 && (
                            <tr><td colSpan={7} className="text-center py-10 text-gray-500">{noOrdersMessage}</td></tr>
                        )}
                        {activeOrders.length > 0 && activeOrders.map(order => {
                            const quote = quotes.find(q => (order.linkedQuoteIds || []).includes(q.id));
                            return (
                                <WorkOrderRow 
                                    key={order.id} 
                                    order={order} 
                                    quote={quote}
                                    technicianName={staffMap.get(order.staffMemberId || '')}
                                    staffMembers={staffMembers}
                                    onAssignTechnician={onAssignTechnician}
                                    onAdvanceStage={onAdvanceStage}
                                    onRetreatStage={onRetreatStage}
                                    onCancelOrder={onCancelOrder}
                                    onStartDiagnostic={onStartDiagnostic}
                                    onViewDetails={onViewDetails}
                                    onRegisterDelivery={onRegisterDelivery}
                                    onEdit={() => onEditWorkOrder(order)}
                                    hasPermission={hasPermission}
                                />
                            );
                        })}

                        {deliveredOrders.length > 0 && (
                            <>
                                {showDeliveredSeparately && activeOrders.length > 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-3 bg-black dark:bg-gray-900/30 text-xs font-bold uppercase text-gray-400 tracking-wider">
                                            Entregados Recientemente
                                        </td>
                                    </tr>
                                )}
                                {deliveredOrders.map(order => {
                                    const quote = quotes.find(q => (order.linkedQuoteIds || []).includes(q.id));
                                    return (
                                        <WorkOrderRow 
                                            key={order.id} 
                                            order={order} 
                                            quote={quote}
                                            isDelivered={true}
                                            technicianName={staffMap.get(order.staffMemberId || '')}
                                            staffMembers={staffMembers}
                                            onAssignTechnician={onAssignTechnician}
                                            onAdvanceStage={onAdvanceStage}
                                            onRetreatStage={onRetreatStage}
                                            onCancelOrder={onCancelOrder}
                                            onStartDiagnostic={onStartDiagnostic}
                                            onViewDetails={onViewDetails}
                                            onRegisterDelivery={onRegisterDelivery}
                                            onEdit={() => onEditWorkOrder(order)}
                                            hasPermission={hasPermission}
                                        />
                                    );
                                })}
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

ActiveWorkOrdersTable.displayName = 'ActiveWorkOrdersTable';

interface WorkOrderRowProps {
    order: WorkOrder;
    quote?: Quote;
    technicianName?: string;
    staffMembers: StaffMember[];
    onAssignTechnician: (workOrderId: string, staffMemberId: string) => void;
    onAdvanceStage: (workOrderId: string, currentStage: KanbanStage) => void;
    onRetreatStage?: (workOrderId: string, currentStage: KanbanStage) => void;
    onCancelOrder: (workOrderId: string) => void;
    onStartDiagnostic: (workOrderId: string) => void;
    onViewDetails: (workOrderId: string) => void;
    onRegisterDelivery: (workOrderId: string) => void;
    onEdit: () => void;
    hasPermission: (permission: Permission) => boolean;
    isDelivered?: boolean;
}


const WorkOrderRow: React.FC<WorkOrderRowProps> = ({ order, quote, technicianName, staffMembers, onAssignTechnician, onAdvanceStage, onRetreatStage, onCancelOrder, onStartDiagnostic, onViewDetails, onRegisterDelivery, hasPermission, isDelivered = false, onEdit }) => {
    const stageConfig = STAGE_DISPLAY_CONFIG[order.stage] || STAGE_DISPLAY_CONFIG.Recepción;
    const finalTechnicianName = technicianName || 'Sin asignar';
    const timeInStage = calculateBusinessTimeInStage(order.history);
    
    const mechanics = useMemo(() => 
        staffMembers.filter(s => s.role === UserRole.MECANICO), 
        [staffMembers],
    );

    return (
        <tr className={`hover:bg-gray-800/50 ${isDelivered ? 'opacity-60' : ''}`}>
            <td className="px-5 py-4 font-medium text-white">
                <div className="font-bold">{order.id}</div>
                <div className="text-xs text-gray-400">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Sin fecha'}
                </div>
            </td>
            <td className="px-5 py-4">
                <div className="font-mono font-bold text-white">{order.vehicle?.plate || 'N/A'}</div>
                <div className="text-xs text-gray-400">{order.client?.name || 'Cliente no encontrado'}</div>
                <div className="text-xs text-gray-500">{`${order.vehicle?.make || 'N/A'} ${order.vehicle?.model || 'N/A'}`}</div>
            </td>
            <td className="px-5 py-4 text-white">{order.serviceRequested}</td>
            <td className="px-5 py-4">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    order.staffMemberId ? 'bg-gray-700 text-gray-300' : 'bg-red-800/70 text-red-200'
                }`}>
                    {finalTechnicianName}
                </span>
            </td>
            <td className="px-5 py-4">
                <div className="flex items-center text-red-400 text-xs">
                    <Icon name="clock" className="w-4 h-4 mr-1.5" />
                    <span>{timeInStage}</span>
                </div>
            </td>
            <td className="px-5 py-4">
                 <span className={`px-3 py-1.5 text-xs font-bold rounded-md ${stageConfig.bg} ${stageConfig.text}`}>
                    {order.stage}
                </span>
            </td>
            <td className="px-5 py-4">
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
                    onEdit={onEdit}
                    hasPermission={hasPermission}
                 />
            </td>
        </tr>
    );
};

export default ActiveWorkOrdersTable;