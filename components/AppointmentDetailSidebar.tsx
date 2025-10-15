import React from 'react';
import { Appointment, StaffMember, Permission, AppointmentStatus } from '../../types';
import { Icon } from './Icon';
import { APPOINTMENT_STATUS_DISPLAY_CONFIG } from '../../constants';

interface AppointmentDetailSidebarProps {
    appointment: Appointment | null;
    onClose: () => void;
    staffMembers: StaffMember[];
    onConfirm: (appointmentId: string) => void;
    onCancel: (appointmentId: string) => void;
    onCreateWorkOrder: (appointmentId: string) => void;
    onEdit: (appointment: Appointment) => void;
    hasPermission: (permission: Permission) => boolean;
}

const DetailItem: React.FC<{ label: string; value?: string | React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-xs font-semibold text-gray-400 uppercase">{label}</p>
        <div className="text-sm text-white mt-1">{value || 'N/A'}</div>
    </div>
);

const actionButtonClasses = "w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const AppointmentDetailSidebar: React.FC<AppointmentDetailSidebarProps> = ({
    appointment,
    onClose,
    staffMembers,
    onConfirm,
    onCancel,
    onCreateWorkOrder,
    onEdit,
    hasPermission,
}) => {
    if (!appointment) return null;
    
    const advisor = staffMembers.find(s => s.id === appointment.advisorId);
    const statusConfig = APPOINTMENT_STATUS_DISPLAY_CONFIG[appointment.status];

    const canConfirm = appointment.status === AppointmentStatus.PROGRAMADA;
    const canCancel = appointment.status === AppointmentStatus.PROGRAMADA || appointment.status === AppointmentStatus.CONFIRMADA;
    const canCreateWorkOrder = appointment.status === AppointmentStatus.CONFIRMADA && !appointment.linkedWorkOrderId;
    const canEdit = appointment.status === AppointmentStatus.PROGRAMADA || appointment.status === AppointmentStatus.CONFIRMADA;
    
    return (
        <>
            <div className="fixed inset-0 bg-black dark:bg-gray-900/60 z-40 animate-fade-in-scale" onClick={onClose} />

            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-dark-light shadow-2xl z-50 flex flex-col animate-fade-in-scale">
                <div className="flex-shrink-0 p-4 border-b border-gray-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-white">Detalle de la Cita</h2>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${statusConfig.bg} ${statusConfig.text}`}>
                            {appointment.status}
                        </span>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700">
                        <Icon name="x" className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    <DetailItem label="Cliente" value={appointment.clientName} />
                    <DetailItem label="Vehículo" value={appointment.vehicleSummary} />
                    <DetailItem 
                        label="Fecha y Hora" 
                        value={new Date(appointment.appointmentDateTime).toLocaleString('es-CO', { 
                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', 
                        })} 
                    />
                    <DetailItem label="Servicio Solicitado" value={<p className="whitespace-pre-wrap">{appointment.serviceRequested}</p>} />
                    <DetailItem label="Asesor Asignado" value={advisor?.name} />
                    <DetailItem label="Notas" value={appointment.notes} />
                    
                    {appointment.linkedWorkOrderId && (
                        <DetailItem 
                            label="Orden de Trabajo Vinculada" 
                            value={<span className="font-mono text-blue-400">{appointment.linkedWorkOrderId}</span>} 
                        />
                    )}
                </div>

                {hasPermission('manage:appointments') && (
                    <div className="flex-shrink-0 p-4 border-t border-gray-700 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                             <button onClick={() => onConfirm(appointment.id)} className={`${actionButtonClasses} bg-green-600 hover:bg-green-700`} disabled={!canConfirm}>
                                <Icon name="check-circle" className="w-4 h-4" /> Confirmar
                            </button>
                             <button onClick={() => onCreateWorkOrder(appointment.id)} className={`${actionButtonClasses} bg-blue-600 hover:bg-blue-700`} disabled={!canCreateWorkOrder}>
                                <Icon name="plus" className="w-4 h-4" /> Crear OT
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                             <button onClick={() => onEdit(appointment)} className={`${actionButtonClasses} bg-gray-600 hover:bg-gray-700`} disabled={!canEdit}>
                                <Icon name="edit" className="w-4 h-4" /> Editar
                            </button>
                             <button onClick={() => onCancel(appointment.id)} className={`${actionButtonClasses} bg-red-700 hover:bg-red-800`} disabled={!canCancel}>
                                <Icon name="x-circle" className="w-4 h-4" /> Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AppointmentDetailSidebar;