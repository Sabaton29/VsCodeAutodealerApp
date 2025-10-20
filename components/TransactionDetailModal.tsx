import React from 'react';
import { PettyCashTransaction, OperatingExpense, FinancialAccount, StaffMember, Supplier } from '../types';
import { Icon } from './Icon';
import { formatDateTime } from '../utils/format';

type UnifiedTransaction = (PettyCashTransaction | OperatingExpense) & { transactionType: 'pettyCash' | 'operatingExpense' };

interface TransactionDetailModalProps {
    transaction: UnifiedTransaction;
    staffMembers: StaffMember[];
    financialAccounts: FinancialAccount[];
    suppliers: Supplier[];
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const DetailItem: React.FC<{ label: string; value?: string; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div>
        <p className="text-xs font-semibold text-gray-400 uppercase">{label}</p>
        <p className="text-sm text-white">{value || children || 'N/A'}</p>
    </div>
);

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ transaction, staffMembers, financialAccounts, suppliers }) => {
    
    const user = staffMembers.find(s => s.id === transaction.userId);
    const account = financialAccounts.find(a => a.id === transaction.accountId);

    const isPettyCash = transaction.transactionType === 'pettyCash';
    const pettyCashTx = isPettyCash ? (transaction as PettyCashTransaction) : null;
    const opExpenseTx = !isPettyCash ? (transaction as OperatingExpense) : null;
    
    const supplier = pettyCashTx?.supplierId ? suppliers.find(s => s.id === pettyCashTx.supplierId) : null;

    return (
        <div className="space-y-4">
            <div className={`p-4 rounded-lg flex items-center gap-4 ${isPettyCash && pettyCashTx?.type === 'income' ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                <div className={`p-3 rounded-full ${isPettyCash && pettyCashTx?.type === 'income' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    <Icon name={isPettyCash && pettyCashTx?.type === 'income' ? 'arrow-trending-up' : 'arrow-trending-down'} className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-400">{isPettyCash && pettyCashTx?.type === 'income' ? 'Ingreso' : 'Gasto'}</p>
                    <p className="text-2xl font-bold font-mono text-white">{formatCurrency(transaction.amount)}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Descripción" value={transaction.description} />
                <DetailItem label="Fecha y Hora" value={formatDateTime(transaction.date)} />
                <DetailItem label="Usuario Responsable" value={user?.name} />
                <DetailItem label="Cuenta Afectada" value={account?.name} />

                {isPettyCash && pettyCashTx && (
                    <>
                        <DetailItem label="Método de Pago" value={pettyCashTx.paymentMethod} />
                        {supplier && <DetailItem label="Proveedor" value={supplier.name} />}
                    </>
                )}
                {!isPettyCash && opExpenseTx && (
                    <DetailItem label="Categoría" value={opExpenseTx.category} />
                )}
            </div>

            {isPettyCash && pettyCashTx?.receiptImageUrl && (
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Recibo Adjunto</p>
                    <img src={pettyCashTx.receiptImageUrl} alt="Recibo" className="max-w-full max-h-64 object-contain rounded-lg border border-gray-700" />
                </div>
            )}
        </div>
    );
};

export default TransactionDetailModal;
