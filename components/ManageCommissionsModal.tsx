

import React, { useState, useMemo } from 'react';
import { Invoice, QuoteItem, Client } from '../types';
import { Icon } from './Icon';

interface ManageCommissionsModalProps {
    invoice: Invoice;
    client: Client;
    onSave: (invoiceId: string, commissions: { itemId: string; commission: number }[]) => void;
    onCancel: () => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const ManageCommissionsModal: React.FC<ManageCommissionsModalProps> = ({ invoice, client, onSave, onCancel }) => {
    
    const itemsToManage = useMemo(() => invoice.items, [invoice.items]);
    
    const [commissionPercentages, setCommissionPercentages] = useState<Record<string, string>>(() => 
        itemsToManage.reduce((acc, item) => {
            const itemTotal = (item.unitPrice * item.quantity) - (item.discount || 0);
            const currentCommission = item.commission || 0;
            const percentage = itemTotal > 0 ? (currentCommission / itemTotal) * 100 : 0;
            acc[item.id] = (item.commission !== undefined) ? percentage.toFixed(2) : (client.commissionRate || 0).toString();
            return acc;
        }, {} as Record<string, string>),
    );

    const handlePercentageChange = (itemId: string, value: string) => {
        setCommissionPercentages(prev => ({ ...prev, [itemId]: value }));
    };

    const handleSubmit = () => {
        const commissionsToSave = itemsToManage.map(item => {
            const percentage = parseFloat(commissionPercentages[item.id]) || 0;
            const itemTotal = (item.unitPrice * item.quantity) - (item.discount || 0);
            const commission = itemTotal * (percentage / 100);
            return {
                itemId: item.id,
                commission: commission,
            };
        });
        onSave(invoice.id, commissionsToSave);
    };
    
    const percentInputClasses = `w-24 text-right bg-gray-100 dark:bg-gray-800 rounded p-1 font-mono border border-gray-300 dark:border-gray-700 text-light-text dark:text-dark-text`;

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-400 -mt-2">
                Ajuste los porcentajes de comisión para cada ítem facturado. El valor se calculará automáticamente.
            </p>
            
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg max-h-[50vh]">
                <table className="w-full text-sm text-light-text dark:text-dark-text">
                    <thead className="bg-gray-50 dark:bg-black dark:bg-gray-900/20 text-xs text-gray-700 dark:text-gray-400 uppercase sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left">Ítem</th>
                            <th className="px-4 py-2 text-right">Valor Ítem</th>
                            <th className="px-4 py-2 text-center w-48">Comisión (%)</th>
                            <th className="px-4 py-2 text-right w-36">Valor Comisión</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {itemsToManage.map(item => {
                            const percentage = parseFloat(commissionPercentages[item.id]) || 0;
                            const itemTotal = (item.unitPrice * item.quantity) - (item.discount || 0);
                            const commissionValue = itemTotal * (percentage / 100);

                            return (
                            <tr key={item.id}>
                                <td className="px-4 py-2 font-medium">
                                    <p>{item.description}</p>
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${item.type === 'service' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/50 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-200'}`}>{item.type === 'service' ? 'Servicio' : 'Repuesto'}</span>
                                </td>
                                <td className="px-4 py-2 text-right font-mono">{formatCurrency(itemTotal)}</td>
                                <td className="px-2 py-1 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <input 
                                            type="number"
                                            value={commissionPercentages[item.id]}
                                            onChange={(e) => handlePercentageChange(item.id, e.target.value)}
                                            className={percentInputClasses}
                                            step="0.01"
                                            placeholder="0"
                                        />
                                        <Icon name="percentage" className="w-4 h-4 text-gray-400"/>
                                    </div>
                                </td>
                                <td className="px-4 py-2 text-right font-mono text-red-500 dark:text-red-400">
                                    {formatCurrency(commissionValue)}
                                </td>
                            </tr>
                        );})}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">Cancelar</button>
                <button onClick={handleSubmit} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-500">
                    <Icon name="check-circle" className="w-5 h-5" />
                    Guardar Comisiones
                </button>
            </div>
        </div>
    );
};

export default ManageCommissionsModal;