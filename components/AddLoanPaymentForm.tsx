import React, { useState, useMemo } from 'react';
import type { Loan, LoanPayment } from '../types';

interface AddLoanPaymentFormProps {
    onSave: (paymentData: Omit<LoanPayment, 'id' | 'paymentDate'>) => void;
    onCancel: () => void;
    loans: Loan[];
}

const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

const AddLoanPaymentForm: React.FC<AddLoanPaymentFormProps> = ({ onSave, onCancel, loans }) => {
    const [formData, setFormData] = useState({
        loanId: '',
        amount: 0,
    });
    
    const activeLoans = useMemo(() => loans, [loans]); // In a real app, this would filter for active loans only

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.loanId || formData.amount <= 0) {
            console.warn('Por favor complete todos los campos con valores válidos.');
            return;
        }
        onSave({ ...formData, isPayrollDeduction: false });
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="loanId" className={labelClasses}>Préstamo</label>
                <select id="loanId" name="loanId" value={formData.loanId} onChange={handleChange} className={inputClasses} required>
                    <option value="">-- Seleccionar Préstamo --</option>
                    {activeLoans.map(loan => (
                        <option key={loan.id} value={loan.id}>{loan.id} - Empleado: {loan.staffId}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="amount" className={labelClasses}>Monto del Abono (COP)</label>
                <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} className={inputClasses} required min="1" />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors">Registrar Abono</button>
            </div>
        </form>
    );
};

export default AddLoanPaymentForm;
