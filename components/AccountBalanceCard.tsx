import React from 'react';
import { Icon } from './Icon';
import { FinancialAccount, StaffMember } from '../types';

interface AccountBalanceCardProps {
    account: FinancialAccount & { balance: number };
    staffMembers: StaffMember[];
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const AccountBalanceCard: React.FC<AccountBalanceCardProps> = ({ account, staffMembers }) => {
    const isBank = account.type === 'Banco';
    const iconName = isBank ? 'credit-card' : 'wallet';
    const colorClass = isBank ? 'text-blue-400' : 'text-purple-400';

    const assignedUsers = (account.assignedUserIds || [])
        .map(userId => staffMembers.find(s => s.id === userId))
        .filter(Boolean) as StaffMember[];

    return (
        <div className="bg-dark-light p-5 rounded-xl shadow-md flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-black dark:bg-gray-900/20 ${colorClass}`}>
                        <Icon name={iconName} className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{account.name}</h3>
                        <p className={`mt-1 text-2xl font-bold ${account.balance >= 0 ? 'text-white' : 'text-red-400'}`}>
                            {formatCurrency(account.balance)}
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-500">Responsables:</span>
                <div className="flex -space-x-2">
                    {assignedUsers.length > 0 ? (
                        assignedUsers.map(user => (
                            <img
                                key={user.id}
                                src={user.avatarUrl}
                                alt={user.name}
                                title={user.name}
                                className="w-6 h-6 rounded-full ring-2 ring-dark-light"
                            />
                        ))
                    ) : (
                        <span className="text-xs text-gray-500">General</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountBalanceCard;