import React, { useState } from 'react';
import type { StaffMember, Loan } from '../types';

interface AddLoanFormProps {
    onSave: (loanData: Omit<Loan, 'id' | 'issueDate'>) => void;
    onCancel: () => void;
    staffMembers: StaffMember[];
    selectedLocationId: string;
}

const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

const AddLoanForm: React.FC<AddLoanFormProps> = ({ onSave, onCancel, staffMembers, selectedLocationId }) => {
    const [formData, setFormData] = useState({
        staffId: '',
        amount: 0,
        reason: '',
        deductionPerPayPeriod: 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.staffId || formData.amount <= 0 || formData.deductionPerPayPeriod <= 0) {
            alert('Por favor complete todos los campos con valores válidos.');
            return;
        }
        onSave({ ...formData, locationId: selectedLocationId });
    };
    
    const staffInLocation = staffMembers.filter(s => s.locationId === selectedLocationId);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="staffId" className={labelClasses}>Empleado</label>
                <select id="staffId" name="staffId" value={formData.staffId} onChange={handleChange} className={inputClasses} required>
                    <option value="">-- Seleccionar Empleado --</option>
                    {staffInLocation.map(staff => (
                        <option key={staff.id} value={staff.id}>{staff.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="amount" className={labelClasses}>Monto del Préstamo (COP)</label>
                <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} className={inputClasses} required min="1" />
            </div>
            <div>
                <label htmlFor="deductionPerPayPeriod" className={labelClasses}>Monto a Descontar por Período de Pago (COP)</label>
                <input type="number" id="deductionPerPayPeriod" name="deductionPerPayPeriod" value={formData.deductionPerPayPeriod} onChange={handleChange} className={inputClasses} required min="1" />
            </div>
             <div>
                <label htmlFor="reason" className={labelClasses}>Motivo del Préstamo</label>
                <textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} rows={3} className={inputClasses} placeholder="Ej: Adelanto de nómina, calamidad doméstica..."></textarea>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors">Guardar Préstamo</button>
            </div>
        </form>
    );
};

export default AddLoanForm;
