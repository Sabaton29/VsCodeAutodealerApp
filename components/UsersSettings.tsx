

import React from 'react';
import { type StaffMember, UserRole } from '../types';
import { Icon } from './Icon';

interface UsersSettingsProps {
    staffMembers: StaffMember[];
    onUpdateRole: (staffId: string, newRole: UserRole) => void;
    onEditPermissions: (staffMember: StaffMember) => void;
    onAssignAccounts: (staffMember: StaffMember) => void;
}

const UsersSettings: React.FC<UsersSettingsProps> = ({ staffMembers, onUpdateRole, onEditPermissions, onAssignAccounts }) => {

    const handleRoleChange = (staffId: string, newRole: UserRole) => {
        onUpdateRole(staffId, newRole);
    };

    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-bold text-light-text dark:text-dark-text">Gestión de Usuarios y Permisos</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Asigna roles para controlar el acceso y gestiona permisos individuales.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">Sede</th>
                            <th scope="col" className="px-6 py-3">Rol del Sistema</th>
                            <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffMembers.map(staff => (
                            <tr key={staff.id} className="bg-light dark:bg-dark-light border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <div className="flex items-center gap-3">
                                        <img src={staff.avatarUrl} alt={staff.name} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <p>{staff.name}</p>
                                            <p className="text-xs text-gray-500">{staff.email}</p>
                                        </div>
                                    </div>
                                </th>
                                <td className="px-6 py-4">{staff.locationId === 'L1' ? 'Sede Bogotá' : 'Sede Cali'}</td>
                                <td className="px-6 py-4">
                                     <select
                                        value={staff.role}
                                        onChange={(e) => handleRoleChange(staff.id, e.target.value as UserRole)}
                                        className="w-full max-w-[200px] px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text"
                                    >
                                        {Object.values(UserRole).map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onAssignAccounts(staff)}
                                            className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors"
                                            title="Asignar Cuentas Financieras"
                                        >
                                            <Icon name="wallet" className="w-4 h-4" />
                                            Asignar Cuentas
                                        </button>
                                        <button
                                            onClick={() => onEditPermissions(staff)}
                                            className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors"
                                            title="Gestionar Permisos Individuales"
                                        >
                                            <Icon name="settings" className="w-4 h-4" />
                                            Permisos
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersSettings;