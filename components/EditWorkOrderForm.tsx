import React, { useState, useMemo } from 'react';
import { WorkOrder, StaffMember, UserRole } from '../types';

interface EditWorkOrderFormProps {
    initialData: WorkOrder;
    staffMembers: StaffMember[];
    onSave: (data: { id: string; serviceRequested: string; advisorId?: string; staffMemberId?: string; comments?: string; }) => void;
    onCancel: () => void;
}

const inputClasses = "w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

const EditWorkOrderForm: React.FC<EditWorkOrderFormProps> = ({ initialData, staffMembers, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        serviceRequested: initialData.serviceRequested || '',
        advisorId: initialData.advisorId || '',
        staffMemberId: initialData.staffMemberId || '',
        comments: initialData.comments || '',
    });

    const serviceAdvisors = useMemo(() => staffMembers.filter(s => s.locationId === initialData.locationId && s.role === UserRole.ASESOR_SERVICIO), [staffMembers, initialData.locationId]);
    const mechanics = useMemo(() => staffMembers.filter(s => s.locationId === initialData.locationId && s.role === UserRole.MECANICO), [staffMembers, initialData.locationId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: initialData.id, ...formData });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-black dark:bg-gray-900/20 rounded-lg">
                <p><strong>Cliente:</strong> {initialData.client.name}</p>
                <p><strong>Vehículo:</strong> {`${initialData.vehicle.make} ${initialData.vehicle.model} (${initialData.vehicle.plate})`}</p>
            </div>
            <div>
                <label htmlFor="serviceRequested" className={labelClasses}>Servicio Solicitado / Falla Reportada</label>
                <textarea id="serviceRequested" name="serviceRequested" value={formData.serviceRequested} onChange={handleChange} rows={3} className={inputClasses} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="advisorId" className={labelClasses}>Asesor de Servicio</label>
                    <select id="advisorId" name="advisorId" value={formData.advisorId} onChange={handleChange} className={inputClasses}>
                        <option value="">-- Sin Asesor --</option>
                        {serviceAdvisors.map(sa => <option key={sa.id} value={sa.id}>{sa.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="staffMemberId" className={labelClasses}>Técnico Asignado</label>
                    <select id="staffMemberId" name="staffMemberId" value={formData.staffMemberId} onChange={handleChange} className={inputClasses}>
                        <option value="">-- Sin Asignar --</option>
                        {mechanics.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label htmlFor="comments" className={labelClasses}>Comentarios Adicionales</label>
                <textarea id="comments" name="comments" value={formData.comments} onChange={handleChange} rows={3} className={inputClasses}></textarea>
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700">Guardar Cambios</button>
            </div>
        </form>
    );
};

export default EditWorkOrderForm;