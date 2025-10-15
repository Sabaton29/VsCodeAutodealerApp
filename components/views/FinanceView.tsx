import React, { useMemo, useState } from 'react';
import type { PettyCashTransaction, OperatingExpense, Supplier, Permission, Invoice, OperatingExpenseCategory, FinancialAccount, StaffMember, TimeClockEntry, Loan, LoanPayment, WorkOrder, ModalType } from '../../types';
import { Icon } from '../Icon';
import FinancialMetricCard from '../FinancialMetricCard';
import CashFlowChart from '../CashFlowChart';
import ExpenseDonutChart from '../ExpenseDonutChart';
import { InvoiceStatus } from '../../types';
import AccountBalanceCard from '../AccountBalanceCard';
import PayrollReport from '../PayrollReport';
import AccountTransactionsReport from '../AccountTransactionsReport';
import ProfitAndLossStatement from '../ProfitAndLossStatement';

interface FinanceViewProps {
    selectedLocationId: string;
    invoices: Invoice[];
    workOrders: WorkOrder[];
    pettyCashTransactions: PettyCashTransaction[];
    operatingExpenses: OperatingExpense[];
    financialAccounts: FinancialAccount[];
    staffMembers: StaffMember[];
    timeClockEntries: TimeClockEntry[];
    loans: Loan[];
    loanPayments: LoanPayment[];
    onAddPettyCashTransaction: () => void;
    onAddOperatingExpense: () => void;
    handleAddOperatingExpense: (expenseData: Omit<OperatingExpense, 'id' | 'date'>) => Promise<void>;
    handleAddLoanPayment: (paymentData: Omit<LoanPayment, 'id' | 'paymentDate'>) => Promise<void>;
    hasPermission: (permission: Permission) => boolean;
    suppliers: Supplier[];
    openModal: (type: ModalType, data?: any) => void;
}

const FinanceView: React.FC<FinanceViewProps> = (props) => {
    const [activeTab, setActiveTab] = useState('Dashboard');
    
    const tabs = useMemo(() => {
        const availableTabs = ['Dashboard', 'Movimientos de Cuentas', 'Estado de Resultados'];
        if (props.hasPermission('view:payroll')) {
            availableTabs.push('Nómina');
        }
        return availableTabs;
    }, [props.hasPermission]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Finanzas</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Análisis de la salud financiera, nómina y gastos.</p>
                </div>
                 <div className="flex items-center gap-2">
                    {props.hasPermission('manage:finance') && (
                        <>
                        <button onClick={props.onAddPettyCashTransaction} className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-brand-red/80 rounded-lg shadow-md hover:bg-brand-red transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed" disabled={props.selectedLocationId === 'ALL_LOCATIONS'} title={props.selectedLocationId === 'ALL_LOCATIONS' ? 'Seleccione una sede' : ''}><Icon name="wallet" className="w-4 h-4" />Mov. Caja</button>
                        <button onClick={props.onAddOperatingExpense} className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-blue-600/80 rounded-lg shadow-md hover:bg-blue-600 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed" disabled={props.selectedLocationId === 'ALL_LOCATIONS'} title={props.selectedLocationId === 'ALL_LOCATIONS' ? 'Seleccione una sede' : ''}><Icon name="plus" className="w-4 h-4" /> Gasto Op.</button>
                        </>
                    )}
                </div>
            </div>
            
            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                {tabs.map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 md:px-6 py-3 text-sm font-semibold transition-colors focus:outline-none whitespace-nowrap ${
                            activeTab === tab 
                                ? 'border-b-2 border-brand-red text-brand-red' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-light-text dark:hover:text-dark-text'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="mt-6">
                {activeTab === 'Dashboard' && <FinancialDashboard {...props} />}
                {activeTab === 'Nómina' && <PayrollReport staffMembers={props.staffMembers} timeClockEntries={props.timeClockEntries} loans={props.loans} loanPayments={props.loanPayments} handleAddOperatingExpense={props.handleAddOperatingExpense} handleAddLoanPayment={props.handleAddLoanPayment} selectedLocationId={props.selectedLocationId} workOrders={props.workOrders} invoices={props.invoices} hasPermission={props.hasPermission} />}
                {activeTab === 'Movimientos de Cuentas' && <AccountTransactionsReport 
                    pettyCashTransactions={props.pettyCashTransactions}
                    operatingExpenses={props.operatingExpenses}
                    financialAccounts={props.financialAccounts}
                    staffMembers={props.staffMembers}
                    suppliers={props.suppliers}
                    openModal={props.openModal}
                />}
                {activeTab === 'Estado de Resultados' && (
                    <ProfitAndLossStatement 
                        invoices={props.invoices}
                        operatingExpenses={props.operatingExpenses}
                        selectedLocationId={props.selectedLocationId}
                    />
                )}
            </div>
        </div>
    );
};


type DateFilter = '7d' | '30d' | 'thisMonth' | 'lastMonth';

const FILTERS: { key: DateFilter; label: string }[] = [
    { key: '7d', label: 'Últimos 7 días' },
    { key: '30d', label: 'Últimos 30 días' },
    { key: 'thisMonth', label: 'Este Mes' },
    { key: 'lastMonth', label: 'Mes Pasado' },
];

const FinancialDashboard: React.FC<Omit<FinanceViewProps, 'timeClockEntries' | 'handleAddOperatingExpense' | 'handleAddLoanPayment' | 'loans' | 'loanPayments' | 'workOrders' | 'openModal'>> = ({ selectedLocationId, invoices, pettyCashTransactions, operatingExpenses, financialAccounts, staffMembers, onAddPettyCashTransaction, onAddOperatingExpense, hasPermission }) => {
    const [filter, setFilter] = useState<DateFilter>('30d');
    const isGlobalView = selectedLocationId === 'ALL_LOCATIONS';

    const dateRange = useMemo(() => {
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date(now);

        switch (filter) {
            case '7d': startDate.setDate(now.getDate() - 7); break;
            case '30d': startDate.setDate(now.getDate() - 30); break;
            case 'thisMonth': startDate = new Date(now.getFullYear(), now.getMonth(), 1); break;
            case 'lastMonth':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
        }
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        return { startDate, endDate };
    }, [filter]);

    const financialData = useMemo(() => {
        const locationFilter = (item: { locationId: string }) => isGlobalView || item.locationId === selectedLocationId;

        const filteredInvoices = invoices.filter(inv =>
            locationFilter(inv) &&
            inv.status === InvoiceStatus.PAGADA &&
            new Date(inv.issueDate) >= dateRange.startDate &&
            new Date(inv.issueDate) <= dateRange.endDate,
        );

        const filteredOpExpenses = operatingExpenses.filter(exp =>
            locationFilter(exp) &&
            new Date(exp.date) >= dateRange.startDate &&
            new Date(exp.date) <= dateRange.endDate,
        );
        
        const filteredPettyCash = pettyCashTransactions.filter(t =>
            locationFilter(t) &&
            new Date(t.date) >= dateRange.startDate &&
            new Date(t.date) <= dateRange.endDate,
        );

        const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
        const costOfGoodsSold = filteredInvoices.reduce((sum, inv) =>
            sum + inv.items.reduce((itemSum, item) => 
                (item.type === 'inventory' && item.costPrice) ? itemSum + (item.costPrice * item.quantity) : itemSum, 0), 0);
        const grossProfit = totalRevenue - costOfGoodsSold;
        const totalOperatingExpenses = filteredOpExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const netProfit = grossProfit - totalOperatingExpenses;
        
        const expenseChartData: { category: OperatingExpenseCategory, amount: number, color: string }[] = Object.entries(
            filteredOpExpenses.reduce((acc, exp) => {
                acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
                return acc;
            }, {} as Record<OperatingExpenseCategory, number>),
        ).map(([category, amount]) => ({
            category: category as OperatingExpenseCategory, amount,
            color: 'text-gray-400', // Color assignment logic can be improved
        })).sort((a, b) => b.amount - a.amount);

        const dailyFlow: { [key: string]: { income: number, expense: number } } = {};
        const addDays = (date: Date, days: number) => { const result = new Date(date); result.setDate(result.getDate() + days); return result; };
        for (let d = new Date(dateRange.startDate); d <= dateRange.endDate; d = addDays(d, 1)) {
            dailyFlow[d.toISOString().split('T')[0]] = { income: 0, expense: 0 };
        }
        filteredInvoices.forEach(inv => { const dateStr = new Date(inv.issueDate).toISOString().split('T')[0]; if (dailyFlow[dateStr]) dailyFlow[dateStr].income += inv.total; });
        filteredPettyCash.forEach(t => { const dateStr = new Date(t.date).toISOString().split('T')[0]; if (dailyFlow[dateStr]) { if (t.type === 'income') dailyFlow[dateStr].income += t.amount; else dailyFlow[dateStr].expense += t.amount; }});
        filteredOpExpenses.forEach(exp => { const dateStr = new Date(exp.date).toISOString().split('T')[0]; if (dailyFlow[dateStr]) dailyFlow[dateStr].expense += exp.amount; });
        const cashFlowChartData = Object.entries(dailyFlow).map(([date, values]) => ({ label: new Date(date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }), ...values }));

        return { totalRevenue, costOfGoodsSold, grossProfit, totalOperatingExpenses, netProfit, expenseChartData, cashFlowChartData };
    }, [invoices, operatingExpenses, pettyCashTransactions, selectedLocationId, dateRange, isGlobalView]);

    const accountBalances = useMemo(() => {
        const accountsInLocation = financialAccounts.filter(acc => isGlobalView || acc.locationId === selectedLocationId);
        const relevantTransactions = pettyCashTransactions.filter(t => isGlobalView || t.locationId === selectedLocationId);
        const relevantExpenses = operatingExpenses.filter(e => isGlobalView || e.locationId === selectedLocationId);

        return accountsInLocation.map(account => {
            const income = relevantTransactions.filter(t => t.accountId === account.id && t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const pettyCashExpenses = relevantTransactions.filter(t => t.accountId === account.id && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            const opExpenses = relevantExpenses.filter(e => e.accountId === account.id).reduce((s, e) => s + e.amount, 0);
            return { ...account, balance: income - pettyCashExpenses - opExpenses };
        });
    }, [financialAccounts, pettyCashTransactions, operatingExpenses, selectedLocationId, isGlobalView]);

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-2">
                {FILTERS.map(({ key, label }) => (
                    <button key={key} onClick={() => setFilter(key)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filter === key ? 'bg-brand-red text-white' : 'bg-light dark:bg-dark-light text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'}`}>
                        {label}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <FinancialMetricCard title="Ingresos Totales" value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(financialData.totalRevenue)} icon="invoice" colorClass="text-green-400" />
                <FinancialMetricCard title="Costos Totales" value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(financialData.costOfGoodsSold + financialData.totalOperatingExpenses)} icon="credit-card" colorClass="text-red-400" />
                <FinancialMetricCard title="Utilidad Bruta" value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(financialData.grossProfit)} icon="chart" colorClass="text-blue-400" />
                <FinancialMetricCard title="Utilidad Neta" value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(financialData.netProfit)} icon="chart-line" colorClass={financialData.netProfit >= 0 ? "text-green-400" : "text-red-400"} />
            </div>
            <div>
                 <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">Saldos de Cuentas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {accountBalances.map(account => (<AccountBalanceCard key={account.id} account={account} staffMembers={staffMembers} />))}
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CashFlowChart data={financialData.cashFlowChartData} />
                <ExpenseDonutChart data={financialData.expenseChartData} total={financialData.totalOperatingExpenses}/>
            </div>
        </div>
    );
};

export default FinanceView;