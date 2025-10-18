
import React, { useState, useMemo, memo } from 'react';
import { KanbanStage, UserRole, type WorkOrder, type StaffMember, Quote, type Invoice } from '../../types';
import { KANBAN_STAGES_ORDER } from '../../constants';
import OperationsMetricCard from '../OperationsMetricCard';
import ActiveWorkOrdersTable from '../ActiveWorkOrdersTable';
import { calculateBusinessMillisecondsInStage } from '../../utils/time';
import { Icon } from '../Icon';

interface WorkOrdersViewProps {
  selectedLocationId: string;
  workOrders: WorkOrder[];
  quotes: Quote[];
  invoices: Invoice[];
  staffMembers: StaffMember[];
  handleAssignTechnician: (workOrderId: string, staffMemberId: string) => void;
  handleAdvanceStage: (workOrderId: string, currentStage: KanbanStage) => void;
  handleCancelOrder: (workOrderId: string) => void;
  onStartDiagnostic: (workOrderId: string) => void;
  onViewDetails: (workOrderId: string) => void;
  onRegisterDelivery: (workOrderId: string) => void;
  onEditWorkOrder: (workOrder: WorkOrder) => void;
  currentUser: StaffMember | null;
  hasPermission: (permission: any) => boolean;
}

const WorkOrdersView: React.FC<WorkOrdersViewProps> = memo(({ 
  selectedLocationId, 
  workOrders, 
  quotes,
  invoices,
  staffMembers,
  handleAssignTechnician,
  handleAdvanceStage,
  handleCancelOrder,
  onStartDiagnostic,
  onViewDetails,
  onRegisterDelivery,
  currentUser,
  hasPermission,
  onEditWorkOrder,
}) => {
  const [activeFilter, setActiveFilter] = useState<KanbanStage | 'Todos'>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });
  
  // Removed unnecessary timer that caused re-renders every minute
  // Time updates are now handled more efficiently via useMemo dependencies

  const staffMap = useMemo(() => new Map(staffMembers.map(s => [s.id, s.name])), [staffMembers]);

  const ordersInLocation = useMemo(() => {
    let orders = workOrders.filter(order => order.stage !== KanbanStage.CANCELADO);
    
    // Data scoping for Technicians
    if (currentUser?.role === UserRole.MECANICO && hasPermission('view:own_work_orders')) {
        orders = orders.filter(order => order.staffMemberId === currentUser.id);
    }

    return orders;
  }, [workOrders, currentUser, hasPermission]);

  const sortedAndFilteredOrders = useMemo(() => {
    let filtered = ordersInLocation;

    if (activeFilter !== 'Todos') {
        filtered = filtered.filter(order => order.stage === activeFilter);
    }

    if (searchTerm) {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(order => {
            const technicianName = staffMap.get(order.staffMemberId || '') || '';
            return (
                order.id.toLowerCase().includes(lowercasedSearchTerm) ||
                order.vehicle.plate.toLowerCase().includes(lowercasedSearchTerm) ||
                order.client.name.toLowerCase().includes(lowercasedSearchTerm) ||
                order.serviceRequested.toLowerCase().includes(lowercasedSearchTerm) ||
                technicianName.toLowerCase().includes(lowercasedSearchTerm)
            );
        });
    }

    if (sortConfig !== null) {
        const sortableItems = [...filtered];
        sortableItems.sort((a, b) => {
            let aValue: any;
            let bValue: any;
            
            const key = sortConfig.key;

            if (key === 'timeInStage') {
                aValue = calculateBusinessMillisecondsInStage(a.history);
                bValue = calculateBusinessMillisecondsInStage(b.history);
            } else if (key === 'technician') {
                 aValue = staffMap.get(a.staffMemberId || '') || 'ZZZ';
                 bValue = staffMap.get(b.staffMemberId || '') || 'ZZZ';
            } else if (key === 'plate') {
                aValue = a.vehicle.plate;
                bValue = b.vehicle.plate;
            } else if (key === 'id' || key === 'serviceRequested' || key === 'stage' || key === 'date') {
                const typedKey = key as keyof WorkOrder;
                aValue = a[typedKey];
                bValue = b[typedKey];
            } else {
                aValue = a.date;
                bValue = b.date;
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        filtered = sortableItems;
    }
    return filtered;
  }, [ordersInLocation, activeFilter, searchTerm, sortConfig, staffMap]);
  
  const stageCounts = useMemo(() => {
    const counts = KANBAN_STAGES_ORDER.reduce((acc, stage) => {
      acc[stage] = 0;
      return acc;
    }, {} as Record<KanbanStage, number>);

    ordersInLocation.forEach(order => {
      if (counts[order.stage] !== undefined) {
        counts[order.stage]++;
      }
    });
    return counts;
  }, [ordersInLocation]);
  
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Operaciones del Taller</h1>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <OperationsMetricCard 
            title="Órdenes Activas" 
            count={ordersInLocation.filter(o => o.stage !== KanbanStage.ENTREGADO).length}
            description="Vehículos actualmente en el taller."
            iconName="chart-line"
        />
        <OperationsMetricCard 
            title="Esperando Aprobación" 
            count={stageCounts[KanbanStage.ESPERA_APROBACION]}
            description="Trabajos detenidos por el cliente."
            iconName="clock"
        />
        <OperationsMetricCard 
            title="En Reparación" 
            count={stageCounts[KanbanStage.EN_REPARACION]}
            description="Vehículos siendo intervenidos ahora."
            iconName="wrench"
        />
         <OperationsMetricCard 
            title="En Diagnóstico" 
            count={stageCounts[KanbanStage.DIAGNOSTICO]}
            description="Pendientes por revisión técnica."
            iconName="exclamation-triangle"
        />
      </div>

      {/* Filter Tabs */}
      <div className="bg-dark-light rounded-xl p-2 flex items-center space-x-1 overflow-x-auto">
        <button
          onClick={() => setActiveFilter('Todos')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeFilter === 'Todos' ? 'bg-brand-red text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
        >
          Todos <span className="ml-1.5 bg-black dark:bg-gray-900/30 text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full">{ordersInLocation.length}</span>
        </button>
        {KANBAN_STAGES_ORDER.map(stage => (
          <button
            key={stage}
            onClick={() => setActiveFilter(stage)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${activeFilter === stage ? 'bg-gray-600/50 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
          >
            {stage} <span className="ml-1.5 bg-black dark:bg-gray-900/30 text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full">{stageCounts[stage]}</span>
          </button>
        ))}
         <div className="relative flex-grow ml-4">
            <Icon name="search" className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
                type="text"
                placeholder="Buscar por placa, cliente, servicio, técnico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-lg bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
        </div>
      </div>

      {/* Active Work Orders Table */}
      <ActiveWorkOrdersTable 
        workOrders={sortedAndFilteredOrders} 
        activeFilter={activeFilter}
        quotes={quotes}
        invoices={invoices}
        staffMembers={staffMembers.filter(t => selectedLocationId === 'ALL_LOCATIONS' || t.locationId === selectedLocationId)}
        onAssignTechnician={handleAssignTechnician}
        onAdvanceStage={handleAdvanceStage}
        onCancelOrder={handleCancelOrder}
        onStartDiagnostic={onStartDiagnostic}
        onViewDetails={onViewDetails}
        onRegisterDelivery={(id) => onRegisterDelivery(id)}
        onEditWorkOrder={onEditWorkOrder}
        hasPermission={hasPermission}
        sortConfig={sortConfig}
        requestSort={requestSort}
      />
    </div>
  );
});

WorkOrdersView.displayName = 'WorkOrdersView';

export default WorkOrdersView;