
import React, { useState, useMemo } from 'react';
import type { Invoice, FinancialAccount } from '../types';
import { Icon } from './Icon';

interface ReleaseRetentionModalProps {
    invoice: Invoice;
    accounts: FinancialAccount[];
    onSave: (invoiceId: string, releaseData: { date: string; accountId: string; }) => void;
    onCancel: () => void;
}

const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const ReleaseRetentionModal: React.FC<ReleaseRetentionModalProps> = ({ invoice, accounts, onSave, onCancel }) => {
    
    const bankAccounts = useMemo(() => 
        accounts.filter(acc => acc.locationId === invoice.locationId && acc.type === 'Banco'), 
    [accounts, invoice.locationId]);

    const [releaseData, setReleaseData] = useState({
        date: new Date().toISOString().split('T')[0],
        accountId: bankAccounts[0]?.id || '',
    });

    if (!invoice.factoringInfo) {
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setReleaseData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!releaseData.accountId) {
            alert('Por favor, seleccione la cuenta donde se recibió el dinero.');
            return;
        }
        onSave(invoice.id, releaseData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg space-y-1">
                <p className="text-sm text-gray-400">Empresa de Factoring: <span className="font-semibold text-gray-200">{invoice.factoringInfo.company}</span></p>
                <p className="text-sm text-yellow-300">Monto de Retención a Liberar: <span className="font-bold text-lg text-yellow-200">{formatCurrency(invoice.factoringInfo.retentionAmount)}</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="date" className={labelClasses}>Fecha de Recepción del Dinero</label>
                    <input type="date" id="date" name="date" value={releaseData.date} onChange={handleChange} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="accountId" className={labelClasses}>Cuenta de Destino</label>
                    <select id="accountId" name="accountId" value={releaseData.accountId} onChange={handleChange} className={inputClasses} required>
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
                    Confirmar Liberación y Registrar Ingreso
                </button>
            </div>
        </form>
    );
};

export default ReleaseRetentionModal;