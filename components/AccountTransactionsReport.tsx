import React, { useMemo, useState } from 'react';
import { PettyCashTransaction, OperatingExpense, FinancialAccount, StaffMember, Supplier, ModalType } from '../types';
import { Icon } from './Icon';

type UnifiedTransaction = (PettyCashTransaction | OperatingExpense) & { transactionType: 'pettyCash' | 'operatingExpense' };

interface AccountTransactionsReportProps {
    pettyCashTransactions: PettyCashTransaction[];
    operatingExpenses: OperatingExpense[];
    financialAccounts: FinancialAccount[];
    staffMembers: StaffMember[];
    suppliers: Supplier[];
    openModal: (type: ModalType, data?: any) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const AccountTransactionsReport: React.FC<AccountTransactionsReportProps> = ({
    pettyCashTransactions, operatingExpenses, financialAccounts, staffMembers, suppliers, openModal,
}) => {
    const [selectedAccountId, setSelectedAccountId] = useState('all');

    const staffMap = useMemo(() => new Map(staffMembers.map(s => [s.id, s.name])), [staffMembers]);
    const accountMap = useMemo(() => new Map(financialAccounts.map(a => [a.id, a.name])), [financialAccounts]);

    const unifiedTransactions = useMemo<UnifiedTransaction[]>(() => {
        const pettyCash: UnifiedTransaction[] = pettyCashTransactions.map(t => ({ ...t, transactionType: 'pettyCash' }));
        const opExpenses: UnifiedTransaction[] = operatingExpenses.map(t => ({ ...t, transactionType: 'operatingExpense' }));
        return [...pettyCash, ...opExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [pettyCashTransactions, operatingExpenses]);
    
    const filteredTransactions = useMemo(() => {
        if (selectedAccountId === 'all') {
            return unifiedTransactions;
        }
        return unifiedTransactions.filter(t => t.accountId === selectedAccountId);
    }, [unifiedTransactions, selectedAccountId]);

    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-bold text-light-text dark:text-dark-text">Historial de Movimientos</h2>
                <div className="w-full sm:w-auto">
                    <select
                        value={selectedAccountId}
                        onChange={e => setSelectedAccountId(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm"
                    >
                        <option value="all">Todas las Cuentas</option>
                        {financialAccounts.map(account => (
                            <option key={account.id} value={account.id}>{account.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto max-h-[60vh]">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400 sticky top-0">
                        <tr>
                            <th className="px-6 py-3">Fecha</th>
                            <th className="px-6 py-3">Descripción</th>
                            <th className="px-6 py-3">Usuario</th>
                            <th className="px-6 py-3">Cuenta</th>
                            <th className="px-6 py-3 text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {filteredTransactions.map(t => {
                            const isIncome = t.transactionType === 'pettyCash' && (t as PettyCashTransaction).type === 'income';
                            const amount = t.amount;
                            return (
                                <tr key={t.id} onClick={() => openModal('TRANSACTION_DETAIL', t)} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{formatDate(t.date)}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{t.description}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{staffMap.get(t.userId) || 'N/A'}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{accountMap.get(t.accountId) || 'N/A'}</td>
                                    <td className={`px-6 py-4 text-right font-mono font-semibold ${isIncome ? 'text-green-500' : 'text-red-400'}`}>
                                        {isIncome ? '+' : '-'}{formatCurrency(amount)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AccountTransactionsReport;
