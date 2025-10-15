import React, { useMemo } from 'react';
import type { Loan, LoanPayment, StaffMember, Permission } from '../types';
import { Icon } from './Icon';

interface LoansViewProps {
    loans: Loan[];
    loanPayments: LoanPayment[];
    staffMembers: StaffMember[];
    onAddLoan: () => void;
    onAddLoanPayment: () => void;
    hasPermission: (permission: Permission) => boolean;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-CO');

const LoansView: React.FC<LoansViewProps> = ({ loans, loanPayments, staffMembers, onAddLoan, onAddLoanPayment, hasPermission }) => {
    
    const staffMap = useMemo(() => new Map(staffMembers.map(s => [s.id, s.name])), [staffMembers]);

    const loanDetails = useMemo(() => {
        return loans.map(loan => {
            const payments = loanPayments.filter(p => p.loanId === loan.id);
            const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
            const balance = loan.amount - totalPaid;
            return {
                ...loan,
                totalPaid,
                balance,
                isCompleted: balance <= 0,
            };
        }).sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    }, [loans, loanPayments]);


    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-bold text-light-text dark:text-dark-text">Gestión de Préstamos</h2>
                {hasPermission('manage:loans') && (
                    <div className="flex gap-2">
                        <button onClick={onAddLoanPayment} className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                            <Icon name="plus" className="w-4 h-4" /> Registrar Abono
                        </button>
                        <button onClick={onAddLoan} className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors">
                            <Icon name="plus" className="w-4 h-4" /> Nuevo Préstamo
                        </button>
                    </div>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                     <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Empleado</th>
                            <th className="px-6 py-3">Fecha</th>
                            <th className="px-6 py-3 text-right">Monto Original</th>
                            <th className="px-6 py-3 text-right">Total Pagado</th>
                            <th className="px-6 py-3 text-right">Saldo Pendiente</th>
                            <th className="px-6 py-3 text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {loanDetails.map(loan => (
                            <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{staffMap.get(loan.staffId) || 'Desconocido'}</td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{formatDate(loan.issueDate)}</td>
                                <td className="px-6 py-4 text-right font-mono text-gray-900 dark:text-white">{formatCurrency(loan.amount)}</td>
                                <td className="px-6 py-4 text-right font-mono text-green-500">{formatCurrency(loan.totalPaid)}</td>
                                <td className="px-6 py-4 text-right font-mono font-semibold text-red-500">{formatCurrency(loan.balance)}</td>
                                <td className="px-6 py-4 text-center">
                                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${loan.isCompleted ? 'bg-green-200 text-green-800 dark:bg-green-800/50 dark:text-green-200' : 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800/50 dark:text-yellow-200'}`}>
                                        {loan.isCompleted ? 'Pagado' : 'Activo'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LoansView;