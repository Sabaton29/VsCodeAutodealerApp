import { AppointmentStatus, Appointment } from './types';

export const APPOINTMENTS_DATA: Appointment[] = [
    { id: 'APP-1', clientId: 'C1', clientName: 'Juan Pérez', vehicleId: 'V1', vehicleSummary: 'Chevrolet Spark GT (ABC-123)', serviceRequested: 'Revisión de frenos', appointmentDateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), status: AppointmentStatus.PROGRAMADA, locationId: '550e8400-e29b-41d4-a716-446655440001', advisorId: 'S2' },
    { id: 'APP-2', clientId: 'C2', clientName: 'Ana Gómez', vehicleId: 'V2', vehicleSummary: 'Renault Duster (DEF-456)', serviceRequested: 'Cambio de aceite', appointmentDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), status: AppointmentStatus.CONFIRMADA, locationId: '550e8400-e29b-41d4-a716-446655440002' },
];

export const APPOINTMENT_STATUS_DISPLAY_CONFIG: Record<AppointmentStatus, { text: string; bg: string; borderColor: string; }> = {
    [AppointmentStatus.PROGRAMADA]: { text: 'text-blue-800 dark:text-blue-200', bg: 'bg-blue-200 dark:bg-blue-800/50', borderColor: 'border-blue-500' },
    [AppointmentStatus.CONFIRMADA]: { text: 'text-green-800 dark:text-green-200', bg: 'bg-green-200 dark:bg-green-800/50', borderColor: 'border-green-500' },
    [AppointmentStatus.CANCELADA]: { text: 'text-red-800 dark:text-red-200', bg: 'bg-red-200 dark:bg-red-800/50', borderColor: 'border-red-500' },
    [AppointmentStatus.COMPLETADA]: { text: 'text-gray-800 dark:text-gray-200', bg: 'bg-gray-200 dark:bg-gray-700', borderColor: 'border-gray-500' },
};
