import React, { useMemo } from 'react';
import MetricCard from './MetricCard';
import { Icon } from './Icon';
import { WorkOrder, StaffMember, KanbanStage } from '../types';

interface MechanicDashboardProps {
    mechanic: StaffMember;
    workOrders: WorkOrder[];
    onViewDetails: (workOrderId: string) => void;
}

const MechanicDashboard: React.FC<MechanicDashboardProps> = ({ mechanic, workOrders, onViewDetails }) => {

    const assignedOrders = useMemo(() => {
        return workOrders.filter(wo => wo.staffMemberId === mechanic.id && wo.stage !== KanbanStage.ENTREGADO && wo.stage !== KanbanStage.CANCELADO);
    }, [workOrders, mechanic.id]);

    const metrics = useMemo(() => {
        const inDiagnosis = assignedOrders.filter(wo => wo.stage === KanbanStage.DIAGNOSTICO).length;
        const inRepair = assignedOrders.filter(wo => wo.stage === KanbanStage.EN_REPARACION).length;
        const needsAttention = assignedOrders.filter(wo => wo.stage === KanbanStage.ATENCION_REQUERIDA).length;

        return {
            assignedCount: assignedOrders.length,
            inDiagnosis,
            inRepair,
            needsAttention,
        };
    }, [assignedOrders]);

    return (
        <div className="space-y-8">
            <h1 className="text-2xl md:text-3xl font-bold text-light-text dark:text-dark-text">Hola, {mechanic.name.split(' ')[0]}</h1>
            <p className="text-gray-400 -mt-6">Este es tu resumen de trabajo para hoy.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Órdenes Asignadas"
                    value={String(metrics.assignedCount)}
                    icon={<Icon name="clipboard" className="w-8 h-8" />}
                />
                <MetricCard
                    title="En Diagnóstico"
                    value={String(metrics.inDiagnosis)}
                    icon={<Icon name="search" className="w-8 h-8" />}
                />
                <MetricCard
                    title="En Reparación"
                    value={String(metrics.inRepair)}
                    icon={<Icon name="wrench" className="w-8 h-8" />}
                />
                 <MetricCard
                    title="Requieren Atención"
                    value={String(metrics.needsAttention)}
                    icon={<Icon name="exclamation-triangle" className="w-8 h-8" />}
                    variant={metrics.needsAttention > 0 ? 'danger' : 'default'}
                />
            </div>

            <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Mis Órdenes de Trabajo Activas</h2>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Vehículo</th>
                                <th scope="col" className="px-6 py-3">Servicio Solicitado</th>
                                <th scope="col" className="px-6 py-3">Etapa Actual</th>
                                <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignedOrders.length > 0 ? (
                                assignedOrders.map(order => (
                                    <tr key={order.id} className="bg-light dark:bg-dark-light border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900 dark:text-white">{`${order.vehicle.make} ${order.vehicle.model}`}</p>
                                            <p className="font-mono text-xs">{order.vehicle.plate}</p>
                                        </td>
                                        <td className="px-6 py-4">{order.serviceRequested}</td>
                                        <td className="px-6 py-4">{order.stage}</td>
                                        <td className="px-6 py-4 text-right">
                                             <button onClick={() => onViewDetails(order.id)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-brand-red rounded-lg hover:bg-red-700 ml-auto">
                                                Ver Detalles
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500">No tienes órdenes de trabajo activas asignadas.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MechanicDashboard;
