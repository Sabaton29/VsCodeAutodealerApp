

import React, { useState, useMemo } from 'react';
import type { Invoice, FinancialAccount } from '../types';
import { Icon } from './Icon';

type FactoringData = {
    company: string;
    commission: number;
    retentionAmount: number;
    date: string;
    accountId: string;
};

interface FactorInvoiceFormProps {
    invoice: Invoice;
    accounts: FinancialAccount[];
    onSave: (invoiceId: string, factoringData: FactoringData) => void;
    onCancel: () => void;
}

const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const FactorInvoiceForm: React.FC<FactorInvoiceFormProps> = ({ invoice, accounts, onSave, onCancel }) => {
    
    const bankAccounts = useMemo(() => 
        accounts.filter(acc => acc.locationId === invoice.locationId && acc.type === 'Banco'), 
    [accounts, invoice.locationId]);

    const [formData, setFormData] = useState<FactoringData>({
        company: '',
        commission: 0,
        retentionAmount: 0,
        date: new Date().toISOString().split('T')[0],
        accountId: bankAccounts[0]?.id || '',
    });

    const [commissionPercentage, setCommissionPercentage] = useState('');
    const [retentionPercentage, setRetentionPercentage] = useState('');

    const calculatedValues = useMemo(() => {
        const commissionPercent = parseFloat(commissionPercentage) || 0;
        const retentionPercent = parseFloat(retentionPercentage) || 0;
        
        const commission = (invoice.total * commissionPercent) / 100;
        const retentionAmount = (invoice.total * retentionPercent) / 100;
        const receivedAmount = invoice.total - commission - retentionAmount;

        return { commission, retentionAmount, receivedAmount };
    }, [commissionPercentage, retentionPercentage, invoice.total]);

    const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'commission' | 'retention') => {
        const value = e.target.value;
        if (type === 'commission') {
            setCommissionPercentage(value);
        } else {
            setRetentionPercentage(value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { commission, retentionAmount } = calculatedValues;
        
        if (!formData.company || commission <= 0 || !formData.accountId) {
            alert('Por favor complete todos los campos, incluyendo un porcentaje de comisión válido.');
            return;
        }

        const dataToSave = {
            ...formData,
            commission,
            retentionAmount,
        };
        
        onSave(invoice.id, dataToSave);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Cliente: <span className="font-semibold text-light-text dark:text-dark-text">{invoice.clientName}</span></p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Factura: <span className="font-semibold text-light-text dark:text-dark-text">{formatCurrency(invoice.total)}</span></p>
            </div>

            <div>
                <label htmlFor="company" className={labelClasses}>Empresa de Factoring</label>
                <input type="text" id="company" name="company" value={formData.company} onChange={(e) => setFormData(p => ({ ...p, company: e.target.value }))} className={inputClasses} placeholder="Ej: Factor S.A.S." required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="commissionPercentage" className={labelClasses}>Comisión (%)</label>
                    <div className="relative"><input type="number" id="commissionPercentage" value={commissionPercentage} onChange={(e) => handlePercentageChange(e, 'commission')} className={inputClasses} placeholder="Ej: 4" step="0.01" required /><div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><Icon name="percentage" className="w-5 h-5 text-gray-400"/></div></div>
                    <p className="text-xs text-gray-400 mt-1">Valor: <span className="font-semibold text-gray-300">{formatCurrency(calculatedValues.commission)}</span></p>
                </div>
                 <div>
                    <label htmlFor="retentionPercentage" className={labelClasses}>Retención en Garantía (%)</label>
                    <div className="relative"><input type="number" id="retentionPercentage" value={retentionPercentage} onChange={(e) => handlePercentageChange(e, 'retention')} className={inputClasses} placeholder="Ej: 10" step="0.01" /><div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><Icon name="percentage" className="w-5 h-5 text-gray-400"/></div></div>
                    <p className="text-xs text-gray-400 mt-1">Valor: <span className="font-semibold text-gray-300">{formatCurrency(calculatedValues.retentionAmount)}</span></p>
                </div>
            </div>

             <div className="p-3 bg-blue-900/30 rounded-lg text-center">
                <p className="text-sm text-blue-300">Monto Recibido Hoy</p>
                <p className="text-xl font-bold text-blue-200">{formatCurrency(calculatedValues.receivedAmount)}</p>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="date" className={labelClasses}>Fecha de la Venta</label>
                    <input type="date" id="date" name="date" value={formData.date} onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="accountId" className={labelClasses}>Cuenta de Destino del Dinero</label>
                    <select id="accountId" name="accountId" value={formData.accountId} onChange={(e) => setFormData(p => ({ ...p, accountId: e.target.value }))} className={inputClasses} required>
                        <option value="">-- Seleccione una cuenta --</option>
                        {bankAccounts.map(acc => (<option key={acc.id} value={acc.id}>{acc.name}</option>))}
                    </select>
                </div>
            </div>


            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors">
                    Confirmar Venta y Registrar
                </button>
            </div>
        </form>
    );
};

export default FactorInvoiceForm;