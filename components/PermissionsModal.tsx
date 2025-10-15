
import React, { useState } from 'react';
import { type StaffMember, type Permission } from '../types';
import { ROLE_PERMISSIONS } from '../constants';
import { Icon } from './Icon';

interface PermissionsModalProps {
    staffMember: StaffMember;
    onSave: (staffId: string, permissions: Permission[]) => void;
    onCancel: () => void;
}

const PERMISSION_TRANSLATIONS: Record<Permission, string> = {
    'view:dashboard': 'Ver Dashboard',
    'view:work_orders': 'Ver Órdenes de Trabajo',
    'view:own_work_orders': 'Ver Propias Órdenes',
    'create:work_order': 'Crear Orden de Trabajo',
    'edit:work_order': 'Editar Orden de Trabajo',
    'cancel:work_order': 'Cancelar Orden de Trabajo',
    'assign:technician': 'Asignar Técnico',
    'advance:work_order_stage': 'Avanzar Etapa de OT',
    'start:diagnostic': 'Iniciar Diagnóstico',
    'view:clients': 'Ver Clientes',
    'manage:clients': 'Gestionar Clientes',
    'view:vehicles': 'Ver Vehículos',
    'manage:vehicles': 'Gestionar Vehículos',
    'view:inventory': 'Ver Inventario',
    'manage:inventory': 'Gestionar Inventario',
    'view:services': 'Ver Servicios',
    'manage:services': 'Gestionar Servicios',
    'view:suppliers': 'Ver Proveedores',
    'manage:suppliers': 'Gestionar Proveedores',
    'view:billing': 'Ver Facturación',
    'manage:billing': 'Gestionar Facturación',
    'view:finance': 'Ver Finanzas',
    'manage:finance': 'Gestionar Finanzas',
    'view:staff': 'Ver Personal',
    'manage:staff': 'Gestionar Personal',
    'view:reports': 'Ver Reportes',
    'view:environmental': 'Ver Gestión Ambiental',
    'manage:environmental': 'Gestionar G. Ambiental',
    'view:settings': 'Ver Ajustes',
    'manage:settings': 'Gestionar Ajustes',
    'view:quotes': 'Ver Cotizaciones',
    'manage:quotes': 'Gestionar Cotizaciones',
    'approve:quote': 'Aprobar Cotización',
    'view:purchase_orders': 'Ver Órdenes de Compra',
    'manage:purchase_orders': 'Gestionar Ó. de Compra',
    'receive:purchase_order': 'Recibir Ó. de Compra',
    'view:payroll': 'Ver Nómina',
    'manage:payroll': 'Gestionar Nómina',
    'view:time_clock': 'Ver Registro Horario',
    'manage:time_clock': 'Gestionar Registro Horario',
    'view:loans': 'Ver Préstamos',
    'manage:loans': 'Gestionar Préstamos',
    'post:progress_update': 'Publicar Avance de OT',
    'toggle:task_completed': 'Marcar Tarea como Completada',
    'report:unforeseen_issue': 'Reportar Imprevisto',
    'view:appointments': 'Ver Citas',
    'manage:appointments': 'Gestionar Citas',
};

const PERMISSION_GROUPS: { title: string; permissions: Permission[] }[] = [
    { title: 'Órdenes de Trabajo', permissions: ['view:work_orders', 'view:own_work_orders', 'create:work_order', 'edit:work_order', 'cancel:work_order', 'assign:technician', 'advance:work_order_stage', 'start:diagnostic', 'post:progress_update', 'toggle:task_completed', 'report:unforeseen_issue'] },
    { title: 'Citas', permissions: ['view:appointments', 'manage:appointments'] },
    { title: 'Clientes y Vehículos', permissions: ['view:clients', 'manage:clients', 'view:vehicles', 'manage:vehicles'] },
    { title: 'Inventario y Servicios', permissions: ['view:inventory', 'manage:inventory', 'view:services', 'manage:services'] },
    { title: 'Proveedores y Compras', permissions: ['view:suppliers', 'manage:suppliers', 'view:purchase_orders', 'manage:purchase_orders', 'receive:purchase_order'] },
    { title: 'Cotizaciones', permissions: ['view:quotes', 'manage:quotes', 'approve:quote'] },
    { title: 'Finanzas y Facturación', permissions: ['view:billing', 'manage:billing', 'view:finance', 'manage:finance'] },
    { title: 'Personal y Nómina', permissions: ['view:staff', 'manage:staff', 'view:payroll', 'manage:payroll', 'view:time_clock', 'manage:time_clock', 'view:loans', 'manage:loans'] },
    { title: 'Administración General', permissions: ['view:dashboard', 'view:reports', 'view:environmental', 'manage:environmental', 'view:settings', 'manage:settings'] },
];


const PermissionsModal: React.FC<PermissionsModalProps> = ({ staffMember, onSave, onCancel }) => {
    const [customPermissions, setCustomPermissions] = useState(new Set(staffMember.customPermissions || []));
    const rolePermissions = new Set(ROLE_PERMISSIONS[staffMember.role] || []);

    const handleToggle = (permission: Permission) => {
        setCustomPermissions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(permission)) {
                newSet.delete(permission);
            } else {
                newSet.add(permission);
            }
            return newSet;
        });
    };
    
    const handleSave = () => {
        onSave(staffMember.id, Array.from(customPermissions));
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-gray-400 -mt-2">
                Asigna o revoca permisos individuales para <strong className="text-gray-200">{staffMember.name}</strong>. 
                Estos permisos se añaden a los que ya tiene por su rol de <strong className="text-gray-200">{staffMember.role}</strong>.
            </p>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                {PERMISSION_GROUPS.map(group => (
                    <div key={group.title} className="bg-black dark:bg-gray-900/20 p-4 rounded-lg">
                        <h3 className="font-semibold mb-3 text-white border-b border-gray-700 pb-2">{group.title}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                            {group.permissions.filter(p => PERMISSION_TRANSLATIONS[p]).map(permission => {
                                const isEnabledByRole = rolePermissions.has(permission);
                                const isEnabledByCustom = customPermissions.has(permission);
                                const isChecked = isEnabledByRole || isEnabledByCustom;
                                
                                return (
                                    <label key={permission} className={`flex items-start p-2 rounded-md transition-colors ${isEnabledByRole ? 'bg-gray-700/50 cursor-not-allowed opacity-70' : 'hover:bg-gray-800/50 cursor-pointer'}`}>
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            disabled={isEnabledByRole}
                                            onChange={() => handleToggle(permission)}
                                            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-brand-red focus:ring-brand-red focus:ring-2 mt-0.5 flex-shrink-0"
                                        />
                                        <div className="ml-2">
                                            <span className="text-sm font-medium text-gray-300">{PERMISSION_TRANSLATIONS[permission] || permission}</span>
                                            {isEnabledByRole && <p className="text-xs text-gray-500">Habilitado por rol</p>}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">
                    Cancelar
                </button>
                <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700">
                    Guardar Permisos
                </button>
            </div>
        </div>
    );
};

export default PermissionsModal;
