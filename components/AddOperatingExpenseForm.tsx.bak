import React, { useState, useMemo } from 'react';
import type { OperatingExpense, OperatingExpenseCategory, FinancialAccount, StaffMember, Permission } from '../types';

interface AddOperatingExpenseFormProps {
    onSave: (data: Omit<OperatingExpense, 'id' | 'date'>) => void;
    onCancel: () => void;
    selectedLocationId: string;
    accounts: FinancialAccount[];
    currentUser: StaffMember | null;
    hasPermission: (permission: Permission) => boolean;
}

const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const categories: OperatingExpenseCategory[] = ['Nómina', 'Arriendo', 'Servicios Públicos', 'Marketing', 'Administrativos', 'Otro'];

const AddOperatingExpenseForm: React.FC<AddOperatingExpenseFormProps> = ({ onSave, onCancel, selectedLocationId, accounts, currentUser, hasPermission }) => {
    
    const availableAccounts = useMemo(() => {
        if (!currentUser) return [];
        const accountsInLocation = accounts.filter(acc => acc.locationId === selectedLocationId);
        if (hasPermission('manage:finance')) {
            return accountsInLocation;
        }
        return accountsInLocation.filter(acc => 
            !acc.assignedUserIds || acc.assignedUserIds.length === 0 || acc.assignedUserIds.includes(currentUser.id),
        );
    }, [accounts, currentUser, hasPermission, selectedLocationId]);
    
    const [formData, setFormData] = useState<Omit<OperatingExpense, 'id' | 'date' | 'userId'>>({
        description: '',
        category: 'Otro',
        amount: 0,
        locationId: selectedLocationId,
        accountId: availableAccounts.find(a => a.type === 'Banco')?.id || availableAccounts[0]?.id || '',
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
        if (!currentUser) return;
        if (!formData.description || formData.amount <= 0 || !formData.accountId) {
            alert('Por favor complete la descripción, un monto válido y seleccione una cuenta.');
            return;
        }
        onSave({ ...formData, userId: currentUser.id });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">
                Registre los gastos fijos o administrativos del taller para incluirlos en el Estado de Resultados.
            </p>
            
            <div>
                <label htmlFor="description" className={labelClasses}>Descripción del Gasto</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={2} className={inputClasses} required placeholder="Ej: Pago de nómina, Arriendo del local..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="amount" className={labelClasses}>Monto (COP)</label>
                    <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} className={inputClasses} min="1" required />
                </div>
                <div>
                    <label htmlFor="category" className={labelClasses}>Categoría</label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} className={inputClasses} required>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

             <div>
                <label htmlFor="accountId" className={labelClasses}>Cuenta de Origen</label>
                <select id="accountId" name="accountId" value={formData.accountId} onChange={handleChange} className={inputClasses} required>
                     {availableAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors">
                    Guardar Gasto
                </button>
            </div>
        </form>
    );
};

export default AddOperatingExpenseForm;