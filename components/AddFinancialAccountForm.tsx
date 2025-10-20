import React, { useState, useEffect, useMemo } from 'react';
import type { FinancialAccount, StaffMember, Location } from '../types';
import { Icon } from './Icon';

interface AddFinancialAccountFormProps {
    onSave: (data: FinancialAccount | Omit<FinancialAccount, 'id'>) => void;
    onCancel: () => void;
    initialData?: FinancialAccount;
    selectedLocationId: string;
    staffMembers: StaffMember[];
    locations: Location[];
}

const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

const AddFinancialAccountForm: React.FC<AddFinancialAccountFormProps> = ({ onSave, onCancel, initialData, selectedLocationId, staffMembers, locations }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'Caja Menor' as 'Caja Menor' | 'Banco',
        locationId: selectedLocationId || (locations.length > 0 ? locations[0].id : ''),
        assignedUserIds: [] as string[],
    });

    const isEditing = !!initialData;

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                type: initialData.type,
                locationId: initialData.locationId,
                assignedUserIds: initialData.assignedUserIds || [],
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const staffMap = useMemo(() => new Map(staffMembers.map(s => [s.id, s])), [staffMembers]);
    const assignedUsers = formData.assignedUserIds.map(id => staffMap.get(id)).filter(Boolean) as StaffMember[];
    const unassignedUsers = staffMembers.filter(s => !formData.assignedUserIds.includes(s.id));

    const handleRemoveUser = (userId: string) => {
        setFormData(prev => ({
            ...prev,
            assignedUserIds: prev.assignedUserIds.filter(id => id !== userId),
        }));
    };

    const handleAddUser = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const userId = e.target.value;
        if (userId && userId !== 'undefined' && userId !== undefined && !formData.assignedUserIds.includes(userId)) {
            setFormData(prev => ({
                ...prev,
                assignedUserIds: [...prev.assignedUserIds, userId],
            }));
        }
        e.target.value = ''; // Reset dropdown
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            console.warn('Por favor, ingrese un nombre para la cuenta.');
            return;
        }
        if (!formData.locationId) {
            console.warn('Por favor, seleccione una sede.');
            return;
        }
        
        // Filtrar valores undefined del array assignedUserIds
        const cleanFormData = {
            ...formData,
            assignedUserIds: formData.assignedUserIds.filter(id => id && id !== 'undefined' && id !== undefined),
        };
        
        console.warn('🔍 AddFinancialAccountForm - Form data before sending:', cleanFormData);
        console.warn('🔍 AddFinancialAccountForm - assignedUserIds:', cleanFormData.assignedUserIds);
        
        if (isEditing) {
            onSave({ ...initialData!, ...cleanFormData });
        } else {
            onSave(cleanFormData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className={labelClasses}>Nombre de la Cuenta</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="type" className={labelClasses}>Tipo de Cuenta</label>
                    <select id="type" name="type" value={formData.type} onChange={handleChange} className={inputClasses}>
                        <option>Caja Menor</option>
                        <option>Banco</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="locationId" className={labelClasses}>Sede</label>
                     <select id="locationId" name="locationId" value={formData.locationId} onChange={handleChange} className={inputClasses}>
                        {locations.map(location => (
                            <option key={location.id} value={location.id}>{location.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className={labelClasses}>Usuarios con Acceso</label>
                    <div className="min-h-[4rem] p-2 border border-gray-700 rounded-lg bg-gray-900/50 flex flex-wrap gap-2 items-start">
                        {assignedUsers.length > 0 ? (
                            assignedUsers.map(user => (
                                <div key={user.id} className="flex items-center gap-2 bg-blue-900/50 text-blue-200 text-sm pl-3 pr-1 py-1 rounded-full animate-fade-in-scale">
                                    <span>{user.name}</span>
                                    <button type="button" onClick={() => handleRemoveUser(user.id)} className="text-gray-400 hover:text-white bg-gray-800 rounded-full p-0.5">
                                        <Icon name="x" className="w-3 h-3" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <span className="text-sm text-gray-500 p-2">No hay usuarios asignados.</span>
                        )}
                    </div>
                </div>
                <div>
                    <label htmlFor="addUser" className={labelClasses}>Añadir Usuario</label>
                    <select 
                        id="addUser" 
                        onChange={handleAddUser}
                        className={inputClasses}
                        value=""
                    >
                        <option value="" disabled>-- Seleccionar para añadir --</option>
                        {unassignedUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700">
                    {isEditing ? 'Guardar Cambios' : 'Crear Cuenta'}
                </button>
            </div>
        </form>
    );
};

export default AddFinancialAccountForm;