
import React, { useState, useEffect } from 'react';
import type { BillingSettings } from '../types';
import { Icon } from './Icon';

interface BillingSettingsProps {
    settings: BillingSettings | null;
    onSave: (settings: BillingSettings) => void;
}

const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

const BillingSettings: React.FC<BillingSettingsProps> = ({ settings, onSave }) => {
    const defaultSettings: BillingSettings = {
        vatRate: 19,
        currencySymbol: '$',
        defaultTerms: 'El pago debe realizarse dentro de los 30 días posteriores a la fecha de la factura. Todos los trabajos están garantizados por 3 meses o 5,000 km, lo que ocurra primero.',
        bankInfo: 'Cuenta de Ahorros Bancolombia #123-456789-00 a nombre de Autodealer Taller SAS.',
    };

    const [formData, setFormData] = useState<BillingSettings>(settings || defaultSettings);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

    useEffect(() => {
        setFormData(settings || defaultSettings);
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseFloat(value) || 0 : value, 
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    };

    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Ajustes de Facturación y Finanzas</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="vatRate" className={labelClasses}>Tasa de IVA (%)</label>
                        <input type="number" id="vatRate" name="vatRate" value={formData.vatRate} onChange={handleChange} className={inputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="currencySymbol" className={labelClasses}>Símbolo de Moneda</label>
                        <input type="text" id="currencySymbol" name="currencySymbol" value={formData.currencySymbol} onChange={handleChange} className={inputClasses} required />
                    </div>
                </div>
                <div>
                    <label htmlFor="defaultTerms" className={labelClasses}>Términos y Condiciones por Defecto</label>
                    <textarea id="defaultTerms" name="defaultTerms" value={formData.defaultTerms} onChange={handleChange} rows={4} className={inputClasses}></textarea>
                </div>
                 <div>
                    <label htmlFor="bankInfo" className={labelClasses}>Información Bancaria para Pagos</label>
                    <textarea id="bankInfo" name="bankInfo" value={formData.bankInfo} onChange={handleChange} rows={2} className={inputClasses}></textarea>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="submit" className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">
                        <Icon name={saveStatus === 'saved' ? 'check-circle' : 'upload'} className="w-5 h-5" />
                        {saveStatus === 'saved' ? 'Guardado' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BillingSettings;
