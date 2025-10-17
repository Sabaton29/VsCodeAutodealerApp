import React, { useMemo } from 'react';
import MetricCard from './MetricCard';
import WorkOrderList from './WorkOrderList';
import WorkshopKanban from './WorkshopKanban';
import AdvisorDashboard from './AdvisorDashboard';
import MechanicDashboard from './MechanicDashboard';
import { Icon } from './Icon';
import { WorkOrder, Client, PettyCashTransaction, WorkOrderStatus, KanbanTask, StaffMember, KanbanStage, Vehicle, Quote, Permission, UserRole, Invoice, Appointment, AppointmentStatus } from '../types';
import MaintenanceReminders from './MaintenanceReminders';

interface DashboardProps {
    selectedLocationId: string;
    workOrders: WorkOrder[];
    clients: Client[];
    pettyCashTransactions: PettyCashTransaction[];
    staffMembers: StaffMember[];
    vehicles: Vehicle[];
    quotes: Quote[];
    invoices: Invoice[];
    appointments: Appointment[];
    handleAssignTechnician: (workOrderId: string, staffMemberId: string) => void;
    handleAdvanceStage: (workOrderId: string, currentStage: KanbanStage) => void;
    handleRetreatStage?: (workOrderId: string, currentStage: KanbanStage) => void;
    handleCancelOrder: (workOrderId: string) => void;
    onStartDiagnostic: (workOrderId: string) => void;
    onViewDetails: (workOrderId: string) => void;
    onRegisterDelivery: (workOrderId: string) => void;
    hasPermission: (permission: Permission) => boolean;
    currentUser: StaffMember | null;
    onEditWorkOrder: (workOrder: WorkOrder) => void;
    migrateClientsRegistrationDate?: () => Promise<void>;
}

const UpcomingAppointments: React.FC<{ appointments: Appointment[] }> = ({ appointments }) => {
    const upcoming = useMemo(() => {
        console.log('🔍 Dashboard - Total appointments:', appointments.length);
        console.log('🔍 Dashboard - Appointments data:', appointments);
        
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Reset to start of day
        
        const filtered = appointments
            .filter(a => {
                console.log('🔍 Checking appointment:', a.id, 'Status:', a.status, 'Date:', a.appointmentDateTime);
                return a.status === AppointmentStatus.PROGRAMADA || a.status === AppointmentStatus.CONFIRMADA;
            })
            .filter(a => {
                const appointmentDate = new Date(a.appointmentDateTime);
                appointmentDate.setHours(0, 0, 0, 0);
                const isUpcoming = appointmentDate >= now;
                console.log('🔍 Date comparison:', appointmentDate, '>=', now, '=', isUpcoming);
                return isUpcoming;
            })
            .sort((a, b) => new Date(a.appointmentDateTime).getTime() - new Date(b.appointmentDateTime).getTime())
            .slice(0, 5);
            
        console.log('🔍 Dashboard - Filtered upcoming appointments:', filtered);
        return filtered;
    }, [appointments]);

    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Próximas Citas</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {upcoming.length > 0 ? upcoming.map(app => (
                    <div key={app.id} className="p-4">
                        <p className="font-semibold text-light-text dark:text-dark-text">{app.clientName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{app.vehicleSummary}</p>
                        <p className="text-xs text-brand-red font-bold mt-1">
                            {new Date(app.appointmentDateTime).toLocaleString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })}
                        </p>
                    </div>
                )) : (
                    <p className="p-6 text-sm text-gray-500 dark:text-gray-400">No hay citas programadas.</p>
                )}
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ 
    selectedLocationId, workOrders, clients, pettyCashTransactions, staffMembers, vehicles, quotes, invoices, appointments,
    handleAssignTechnician, handleAdvanceStage, handleRetreatStage, handleCancelOrder, onStartDiagnostic, onViewDetails, onRegisterDelivery, hasPermission,
    currentUser, onEditWorkOrder, migrateClientsRegistrationDate,
}) => {
    const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

    const staffMap = useMemo(() => new Map(staffMembers.map(s => [s.id, s.name])), [staffMembers]);

    const metrics = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Data is already filtered by location from App.tsx

        // 1. Ingresos del Mes
        const monthlyIncome = pettyCashTransactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return t.type === 'income' &&
                       transactionDate.getMonth() === currentMonth &&
                       transactionDate.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);

        // 2. Órdenes Activas
        const activeOrders = workOrders.filter(wo =>
            wo.status !== WorkOrderStatus.LISTO_ENTREGA &&
            wo.status !== WorkOrderStatus.FACTURADO &&
            wo.status !== WorkOrderStatus.CANCELADO &&
            wo.stage !== KanbanStage.ENTREGADO,
        );

        // 3. Vehículos en Taller & Espera Repuestos
        const waitingForParts = activeOrders.filter(wo => wo.status === WorkOrderStatus.ESPERA_REPUESTOS).length;

        // 4. Clientes Nuevos
        const newClientsThisMonth = clients.filter(c => {
            if (!c.registrationDate) {
                return false;
            }
            const registrationDate = new Date(c.registrationDate);
            return registrationDate.getMonth() === currentMonth &&
                   registrationDate.getFullYear() === currentYear;
        }).length;
        
        return {
            monthlyIncome,
            activeOrdersCount: activeOrders.length,
            waitingForParts,
            newClientsThisMonth,
        };
    }, [workOrders, clients, pettyCashTransactions]);
    
    // Create Kanban tasks from work orders
    const kanbanTasks = useMemo((): KanbanTask[] => {
        return workOrders
            .filter(wo => wo.stage !== KanbanStage.CANCELADO)
            .map(wo => ({
                id: wo.id,
                vehicle: wo.vehicle,
                stage: wo.stage,
                mechanic: staffMap.get(wo.staffMemberId || '') || 'Sin Asignar',
                locationId: wo.locationId,
            }));
    }, [workOrders, staffMap]);

    const recentWorkOrders = useMemo(() => {
        return workOrders
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5); // Show latest 5
    }, [workOrders]);

    if (currentUser && currentUser.role === UserRole.ASESOR_SERVICIO) {
        return <AdvisorDashboard advisor={currentUser} workOrders={workOrders} invoices={invoices} />;
    }
    
    if (currentUser && currentUser.role === UserRole.MECANICO) {
        return <MechanicDashboard 
                    mechanic={currentUser} 
                    workOrders={workOrders} 
                    onViewDetails={onViewDetails}
                />;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl md:text-3xl font-bold text-light-text dark:text-dark-text">Dashboard</h1>
            
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                    title="Ingresos del Mes" 
                    value={formatCurrency(metrics.monthlyIncome)} 
                    icon={<Icon name="invoice" className="w-8 h-8" />}
                />
                <MetricCard 
                    title="Órdenes Activas" 
                    value={String(metrics.activeOrdersCount)} 
                    icon={<Icon name="clipboard" className="w-8 h-8" />}
                />
                <MetricCard 
                    title="Vehículos en Taller" 
                    value={String(metrics.activeOrdersCount)} 
                    icon={<Icon name="car" className="w-8 h-8" />}
                    change={metrics.waitingForParts > 0 ? `${metrics.waitingForParts} en espera de repuestos` : undefined}
                />
                <MetricCard 
                    title="Clientes Nuevos" 
                    value={String(metrics.newClientsThisMonth)} 
                    icon={<Icon name="users" className="w-8 h-8" />}
                    change="este mes"
                />
            </div>

            {/* Botón de migración para clientes */}
            {migrateClientsRegistrationDate && (
                <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                                🔧 Migración de Datos
                            </h3>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                Los clientes existentes no tienen fecha de registro. Ejecuta la migración para corregir el contador de "Clientes Nuevos".
                            </p>
                        </div>
                        <button
                            onClick={migrateClientsRegistrationDate}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Migrar Clientes
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <WorkOrderList 
                        workOrders={recentWorkOrders} 
                        quotes={quotes}
                        staffMembers={staffMembers}
                        onAssignTechnician={handleAssignTechnician}
                        onAdvanceStage={handleAdvanceStage}
                        onRetreatStage={handleRetreatStage}
                        onCancelOrder={handleCancelOrder}
                        onStartDiagnostic={onStartDiagnostic}
                        onViewDetails={onViewDetails}
                        onRegisterDelivery={onRegisterDelivery}
                        hasPermission={hasPermission}
                        onEditWorkOrder={onEditWorkOrder}
                    />
                </div>
                <div className="space-y-8">
                    <UpcomingAppointments appointments={appointments} />
                    <MaintenanceReminders workOrders={workOrders} clients={clients} vehicles={vehicles} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <WorkshopKanban tasks={kanbanTasks} />
            </div>
        </div>
    );
};

export default Dashboard;