import React from 'react';
import type { FinancialAccount } from '../types';
import { Icon } from './Icon';

interface FinancialSettingsProps {
    accounts: FinancialAccount[];
    onAdd: () => void;
    onEdit: (account: FinancialAccount) => void;
    onDelete: (accountId: string) => void;
}

const FinancialSettings: React.FC<FinancialSettingsProps> = ({ accounts, onAdd, onEdit, onDelete }) => {
    
    const handleDelete = (account: FinancialAccount) => {
        if (window.window.confirm(`¿Está seguro de que desea eliminar la cuenta "${account.name}"? Esta acción no se puede deshacer.`)) {
            onDelete(account.id);
        }
    };
    
    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
                <div>
                    <h2 className="text-lg font-bold text-light-text dark:text-dark-text">Gestión de Cuentas Financieras</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Crea y administra las cajas menores y cuentas bancarias.</p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors"
                >
                    <Icon name="plus" className="w-5 h-5" />
                    Añadir Cuenta
                </button>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                {accounts.map(account => (
                    <li key={account.id} className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Icon name={account.type === 'Banco' ? 'credit-card' : 'wallet'} className="w-8 h-8 text-brand-red flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-light-text dark:text-dark-text">{account.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{account.type} - {account.locationId === 'L1' ? 'Sede Bogotá' : 'Sede Cali'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => onEdit(account)} className="p-2 text-gray-400 hover:text-brand-red transition-colors" title="Editar Cuenta">
                                <Icon name="edit" className="w-5 h-5"/>
                            </button>
                             <button onClick={() => handleDelete(account)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Eliminar Cuenta">
                                <Icon name="trash" className="w-5 h-5"/>
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FinancialSettings;
