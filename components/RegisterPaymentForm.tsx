import React, { useState } from 'react';
import type { Invoice, PaymentMethod } from '../types';
import { getInvoiceDisplayId } from '../utils/invoiceId';

type PaymentData = {
    amount: number;
    paymentMethod: PaymentMethod;
    date: string;
};

interface RegisterPaymentFormProps {
    invoice: Invoice;
    onSave: (invoiceId: string, paymentData: PaymentData) => void;
    onCancel: () => void;
}

const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

const RegisterPaymentForm: React.FC<RegisterPaymentFormProps> = ({ invoice, onSave, onCancel }) => {
    const [formData, setFormData] = useState<PaymentData>({
        amount: invoice.total,
        paymentMethod: 'Efectivo',
        date: new Date().toISOString().split('T')[0],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.amount <= 0) {
            alert('El monto del pago debe ser mayor a cero.');
            return;
        }
        onSave(invoice.id, formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Factura: <span className="font-semibold text-light-text dark:text-dark-text">{getInvoiceDisplayId(invoice.id, invoice.issueDate, true, invoice.sequentialId)}</span></p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cliente: <span className="font-semibold text-light-text dark:text-dark-text">{invoice.clientName}</span></p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Factura: <span className="font-semibold text-light-text dark:text-dark-text">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(invoice.total)}</span></p>
            </div>

            <div>
                <label htmlFor="amount" className={labelClasses}>Monto a Pagar (COP)</label>
                <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className={inputClasses}
                    required
                />
            </div>
            
            <div>
                <label htmlFor="paymentMethod" className={labelClasses}>Método de Pago</label>
                <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className={inputClasses}
                    required
                >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                    {/* Add other non-credit methods like Transferencia if needed */}
                </select>
            </div>
            
            <div>
                <label htmlFor="date" className={labelClasses}>Fecha del Pago</label>
                <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={inputClasses}
                    required
                />
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors">
                    Registrar Pago
                </button>
            </div>
        </form>
    );
};

export default RegisterPaymentForm;
