import { AppointmentStatus } from './types';

export const APPOINTMENT_STATUS_DISPLAY_CONFIG: Record<AppointmentStatus, { text: string; bg: string; borderColor: string; }> = {
    [AppointmentStatus.PROGRAMADA]: { text: 'text-blue-800 dark:text-blue-200', bg: 'bg-blue-200 dark:bg-blue-800/50', borderColor: 'border-blue-500' },
    [AppointmentStatus.CONFIRMADA]: { text: 'text-green-800 dark:text-green-200', bg: 'bg-green-200 dark:bg-green-800/50', borderColor: 'border-green-500' },
    [AppointmentStatus.CANCELADA]: { text: 'text-red-800 dark:text-red-200', bg: 'bg-red-200 dark:bg-red-800/50', borderColor: 'border-red-500' },
    [AppointmentStatus.COMPLETADA]: { text: 'text-gray-800 dark:text-gray-200', bg: 'bg-gray-200 dark:bg-gray-700', borderColor: 'border-gray-500' },
};
