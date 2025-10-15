

import React, { useMemo, useState } from 'react';
import { TimeClockEntry, StaffMember } from '../types';
import { Icon } from './Icon';

interface TimeClockViewProps {
    timeClockEntries: TimeClockEntry[];
    staffMembers: StaffMember[];
}

const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    });
};

const TimeClockView: React.FC<TimeClockViewProps> = ({ timeClockEntries, staffMembers }) => {
    const [selectedStaffId, setSelectedStaffId] = useState('all');

    const staffMap = useMemo(() => new Map(staffMembers.map(s => [s.id, s.name])), [staffMembers]);

    const filteredEntries = useMemo(() => {
        const sorted = [...timeClockEntries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (selectedStaffId === 'all') {
            return sorted;
        }
        return sorted.filter(entry => entry.staffId === selectedStaffId);
    }, [timeClockEntries, selectedStaffId]);

    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-bold text-light-text dark:text-dark-text">Historial de Fichajes</h2>
                <div className="w-full sm:w-auto">
                    <select
                        value={selectedStaffId}
                        onChange={e => setSelectedStaffId(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm"
                    >
                        <option value="all">Todo el Personal</option>
                        {staffMembers
                            .filter(s => s.requiresTimeClock)
                            .map(staff => (
                            <option key={staff.id} value={staff.id}>{staff.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto max-h-[60vh]">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400 sticky top-0">
                        <tr>
                            <th className="px-6 py-3">Empleado</th>
                            <th className="px-6 py-3">Fecha y Hora</th>
                            <th className="px-6 py-3 text-center">Tipo</th>
                            <th className="px-6 py-3">Sede</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {filteredEntries.length > 0 ? (
                            filteredEntries.map(entry => (
                                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{staffMap.get(entry.staffId) || entry.staffId}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-300">{formatDateTime(entry.timestamp)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${entry.type === 'in' ? 'bg-green-200 text-green-800 dark:bg-green-800/50 dark:text-green-200' : 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800/50 dark:text-yellow-200'}`}>
                                            {entry.type === 'in' ? 'Entrada' : 'Salida'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-300">{entry.locationId === 'L1' ? 'Bogotá' : 'Cali'}</td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No hay registros horarios para la selección actual.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TimeClockView;
