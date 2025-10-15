import React, { useState } from 'react';
import { StaffMember, FinancialAccount } from '../types';

interface AssignAccountsModalProps {
    staffMember: StaffMember;
    allAccounts: FinancialAccount[];
    onSave: (staffId: string, accountIds: string[]) => void;
    onCancel: () => void;
}

const AssignAccountsModal: React.FC<AssignAccountsModalProps> = ({ staffMember, allAccounts, onSave, onCancel }) => {
    
    const [selectedAccountIds, setSelectedAccountIds] = useState<Set<string>>(() => {
        const assignedAccounts = allAccounts
            .filter(acc => acc.assignedUserIds?.includes(staffMember.id))
            .map(acc => acc.id);
        return new Set(assignedAccounts);
    });

    const handleToggle = (accountId: string) => {
        setSelectedAccountIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(accountId)) {
                newSet.delete(accountId);
            } else {
                newSet.add(accountId);
            }
            return newSet;
        });
    };
    
    const handleSave = () => {
        onSave(staffMember.id, Array.from(selectedAccountIds));
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-gray-400 -mt-2">
                Seleccione las cuentas financieras a las que <strong className="text-gray-200">{staffMember.name}</strong> tendrá acceso para registrar gastos e ingresos.
            </p>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-4">
                {allAccounts.map(account => (
                    <label 
                        key={account.id} 
                        className="flex items-center p-3 rounded-md transition-colors hover:bg-gray-800/50 cursor-pointer border border-transparent has-[:checked]:border-brand-red has-[:checked]:bg-red-900/20"
                    >
                        <input
                            type="checkbox"
                            checked={selectedAccountIds.has(account.id)}
                            onChange={() => handleToggle(account.id)}
                            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-brand-red focus:ring-brand-red focus:ring-2 flex-shrink-0"
                        />
                        <div className="ml-3">
                            <span className="text-sm font-medium text-gray-300">{account.name}</span>
                            <p className="text-xs text-gray-500">{account.type} - {account.locationId === 'L1' ? 'Bogotá' : 'Cali'}</p>
                        </div>
                    </label>
                ))}
            </div>

             <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">
                    Cancelar
                </button>
                <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700">
                    Guardar Asignaciones
                </button>
            </div>
        </div>
    );
};

export default AssignAccountsModal;
