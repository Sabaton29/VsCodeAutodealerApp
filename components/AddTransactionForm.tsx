import React, { useState, useMemo } from 'react';
import type { PettyCashTransaction, Supplier, PaymentMethod, FinancialAccount, StaffMember, Permission } from '../types';
import { Icon } from './Icon';

interface AddTransactionFormProps {
    onSave: (data: Omit<PettyCashTransaction, 'id' | 'date'>) => void;
    onCancel: () => void;
    selectedLocationId: string;
    suppliers: Supplier[]; // Suppliers who offer credit
    accounts: FinancialAccount[];
    currentUser: StaffMember | null;
    hasPermission: (permission: Permission) => boolean;
}

const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const actionButtonClasses = "cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500";


const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ onSave, onCancel, selectedLocationId, suppliers, accounts, currentUser, hasPermission }) => {
    
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

    const paymentPartners = useMemo(() => suppliers.filter(s => s.isPaymentPartner), [suppliers]);
    
    const [formData, setFormData] = useState<Omit<PettyCashTransaction, 'id' | 'date' | 'userId'>>({
        type: 'expense',
        description: '',
        amount: 0,
        paymentMethod: 'Efectivo',
        supplierId: '',
        paymentPartnerId: '',
        receiptImageUrl: '',
        locationId: selectedLocationId,
        accountId: availableAccounts[0]?.id || '',
    });
    const [receiptFile, setReceiptFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        let newFormData = { ...formData };

        if (name === 'paymentMethod') {
            newFormData.supplierId = '';
            newFormData.paymentPartnerId = '';
            if (value === 'Tarjeta de Crédito (Socio)') {
                newFormData.accountId = '';
            } else {
                newFormData.accountId = availableAccounts[0]?.id || '';
            }
        }
        
        if (name === 'type' && value === 'income') {
            newFormData.paymentMethod = 'Efectivo';
            newFormData.supplierId = '';
            newFormData.paymentPartnerId = '';
        }

        newFormData = {
            ...newFormData,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        };
        
        setFormData(newFormData);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setReceiptFile(file);
            // Simulate upload and get a URL
            setFormData(prev => ({ ...prev, receiptImageUrl: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        
        if (!formData.description || formData.amount <= 0) {
            console.warn('Por favor complete la descripción y un monto válido.');
            return;
        }
        if (formData.paymentMethod === 'Crédito' && !formData.supplierId) {
            console.warn('Por favor seleccione un proveedor para el gasto a crédito.');
            return;
        }
        if (formData.paymentMethod === 'Tarjeta de Crédito (Socio)' && !formData.paymentPartnerId) {
            console.warn('Por favor seleccione un socio comercial de pago.');
            return;
        }
        if (formData.paymentMethod !== 'Tarjeta de Crédito (Socio)' && !formData.accountId) {
            console.warn('Por favor seleccione una cuenta de origen/destino.');
            return;
        }

        onSave({ ...formData, userId: currentUser.id });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={labelClasses}>Tipo de Movimiento</label>
                <div className="flex gap-4">
                    <label className={`flex-1 p-3 border rounded-lg cursor-pointer ${formData.type === 'expense' ? 'border-brand-red bg-red-50 dark:bg-red-900/20' : 'dark:border-gray-700'}`}>
                        <input type="radio" name="type" value="expense" checked={formData.type === 'expense'} onChange={handleChange} className="sr-only" />
                        <span className="font-semibold">Gasto</span>
                        <p className="text-xs text-gray-500">Salida de dinero.</p>
                    </label>
                    <label className={`flex-1 p-3 border rounded-lg cursor-pointer ${formData.type === 'income' ? 'border-brand-red bg-green-50 dark:bg-green-900/20' : 'dark:border-gray-700'}`}>
                        <input type="radio" name="type" value="income" checked={formData.type === 'income'} onChange={handleChange} className="sr-only" />
                        <span className="font-semibold">Ingreso</span>
                        <p className="text-xs text-gray-500">Entrada de dinero.</p>
                    </label>
                </div>
            </div>

            <div>
                <label htmlFor="description" className={labelClasses}>Descripción</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={2} className={inputClasses} required />
            </div>

            <div>
                <label htmlFor="amount" className={labelClasses}>Monto (COP)</label>
                <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} className={inputClasses} min="1" required />
            </div>
            
             <div>
                <label htmlFor="paymentMethod" className={labelClasses}>Método de Pago</label>
                <select id="paymentMethod" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className={inputClasses} required>
                    <option disabled={formData.type === 'expense'}>Efectivo</option>
                    <option disabled={formData.type === 'income'}>Transferencia</option>
                    <option disabled={formData.type === 'income'}>Tarjeta de Crédito</option>
                    <option disabled={formData.type === 'income'}>Tarjeta de Crédito (Socio)</option>
                    <option disabled={formData.type === 'income'}>Crédito</option>
                </select>
            </div>
            
            {formData.paymentMethod !== 'Tarjeta de Crédito (Socio)' && (
                <div>
                    <label htmlFor="accountId" className={labelClasses}>Cuenta de Origen/Destino</label>
                    <select id="accountId" name="accountId" value={formData.accountId} onChange={handleChange} className={inputClasses} required>
                        {availableAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                </div>
            )}
            
            {formData.paymentMethod === 'Crédito' && (
                <div>
                    <label htmlFor="supplierId" className={labelClasses}>Proveedor (a quien se le debe)</label>
                    <select id="supplierId" name="supplierId" value={formData.supplierId} onChange={handleChange} className={inputClasses} required>
                        <option value="">- Seleccione un Proveedor -</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            )}

            {formData.paymentMethod === 'Tarjeta de Crédito (Socio)' && (
                 <div>
                    <label htmlFor="paymentPartnerId" className={labelClasses}>Socio Comercial de Pago</label>
                    <select id="paymentPartnerId" name="paymentPartnerId" value={formData.paymentPartnerId} onChange={handleChange} className={inputClasses} required>
                        <option value="">- Seleccione un Socio -</option>
                        {paymentPartners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            )}
            
            {formData.type === 'expense' && (
                <div>
                    <label className={labelClasses}>Recibo (Opcional)</label>
                    <div className="flex items-center gap-4">
                        <label htmlFor="receipt-upload" className={`${actionButtonClasses} bg-gray-600 hover:bg-gray-700`}>
                            <Icon name="upload" className="w-5 h-5"/>
                            <span>Adjuntar Recibo</span>
                        </label>
                        <input id="receipt-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        {formData.receiptImageUrl && (
                             <div className="relative">
                                <img src={formData.receiptImageUrl} alt="Recibo" className="w-16 h-16 object-cover rounded-lg" />
                             </div>
                        )}
                    </div>
                </div>
            )}
            
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors">
                    Guardar Movimiento
                </button>
            </div>
        </form>
    );
};

export default AddTransactionForm;