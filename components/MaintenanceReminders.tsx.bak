import React, { useMemo } from 'react';
import { WorkOrder, Client, Vehicle, KanbanStage } from '../types';
import { Icon } from './Icon';

interface MaintenanceRemindersProps {
    workOrders: WorkOrder[];
    clients: Client[];
    vehicles: Vehicle[];
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const MaintenanceReminders: React.FC<MaintenanceRemindersProps> = ({ workOrders, clients, vehicles }) => {
    const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c])), [clients]);
    const vehicleMap = useMemo(() => new Map(vehicles.map(v => [v.id, v])), [vehicles]);

    const reminders = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        const deliveredOrders = workOrders.filter(wo =>
            wo.stage === KanbanStage.ENTREGADO && wo.nextMaintenanceDate,
        );

        return deliveredOrders
            .map(wo => ({
                workOrder: wo,
                nextDate: new Date(wo.nextMaintenanceDate!),
            }))
            .filter(({ nextDate }) => nextDate <= thirtyDaysFromNow) // Due within 30 days or overdue
            .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime()); // Sort by soonest first

    }, [workOrders]);
    
    const handleContact = (clientId: string, vehicleId: string) => {
        const client = clientMap.get(clientId);
        const vehicle = vehicleMap.get(vehicleId);
        if (!client || !vehicle || !client.phone) {
            alert('No se puede contactar al cliente, falta información de contacto.');
            return;
        }

        const clientName = client.name.split(' ')[0]; // Just the first name
        const vehicleSummary = `${vehicle.make} ${vehicle.model} (${vehicle.plate})`;
        const message = `Hola ${clientName}, notamos que tu ${vehicleSummary} está próximo a su mantenimiento preventivo. ¿Te gustaría agendar una cita con nosotros para mantenerlo en perfecto estado? Puedes responder a este mensaje o llamarnos.`;
        const whatsappUrl = `https://wa.me/${client.phone.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Recordatorios de Mantenimiento</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Vehículos con mantenimiento próximo o vencido.</p>
            </div>

            <div className="overflow-x-auto max-h-96">
                {reminders.length > 0 ? (
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">Cliente / Vehículo</th>
                                <th scope="col" className="px-6 py-3">Fecha Sugerida</th>
                                <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reminders.map(({ workOrder, nextDate }) => {
                                const isOverdue = new Date() > nextDate;
                                const client = clientMap.get(workOrder.client?.id || '');
                                const vehicle = vehicleMap.get(workOrder.vehicle?.id || '');
                                return (
                                    <tr key={workOrder.id} className="bg-light dark:bg-dark-light border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900 dark:text-white">{client?.name || 'Cliente no encontrado'}</p>
                                            <p className="text-xs">{`${vehicle?.make || 'N/A'} ${vehicle?.model || 'N/A'} (${vehicle?.plate || 'N/A'})`}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-semibold ${isOverdue ? 'text-red-500 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                                {formatDate(workOrder.nextMaintenanceDate!)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleContact(workOrder.clientId, workOrder.vehicleId)}
                                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors ml-auto"
                                            >
                                                <Icon name="share" className="w-4 h-4" /> Contactar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">No hay recordatorios de mantenimiento activos.</p>
                )}
            </div>
        </div>
    );
};

export default MaintenanceReminders;
