import React, { useMemo, useState, useEffect } from 'react';
import { StaffMember, TimeClockEntry, SalaryType, OperatingExpense, Loan, LoanPayment, WorkOrder, Invoice, Permission } from '../types';
import { Icon } from './Icon';
import Modal from './Modal';

interface PayrollReportProps {
    staffMembers: StaffMember[];
    timeClockEntries: TimeClockEntry[];
    loans: Loan[];
    loanPayments: LoanPayment[];
    workOrders: WorkOrder[];
    invoices: Invoice[];
    selectedLocationId: string;
    handleAddOperatingExpense: (expenseData: Omit<OperatingExpense, 'id' | 'date'>) => Promise<void>;
    handleAddLoanPayment: (paymentData: Omit<LoanPayment, 'id' | 'paymentDate'>) => Promise<void>;
    hasPermission: (permission: Permission) => boolean;
}

type CommissionDetail = {
    invoiceId: string;
    profit: number;
    commission: number;
}

type PayrollData = {
    staffId: string;
    name: string;
    salaryType?: SalaryType;
    salaryAmount?: number;
    hoursWorked: number;
    basePay: number;
    commissionPay: number;
    calculatedPay: number; // basePay + commissionPay
    deduction: number;
    netPay: number;
    loanId?: string;
    commissionDetails: CommissionDetail[];
};

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const PayrollReport: React.FC<PayrollReportProps> = ({ staffMembers, timeClockEntries, loans, loanPayments, workOrders, invoices, selectedLocationId, handleAddOperatingExpense, handleAddLoanPayment, hasPermission }) => {
    const [days, setDays] = useState(15);
    const [paidStaffIds, setPaidStaffIds] = useState(new Set<string>());
    const [detailsModalData, setDetailsModalData] = useState<PayrollData | null>(null);

    useEffect(() => {
        setPaidStaffIds(new Set());
    }, [days, selectedLocationId]);

    const activeLoansByStaff = useMemo(() => {
        const activeLoans = new Map<string, Loan>();
        for (const loan of loans) {
            const payments = loanPayments.filter(p => p.loanId === loan.id);
            const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
            if (loan.amount > totalPaid) {
                activeLoans.set(loan.staffId, loan);
            }
        }
        return activeLoans;
    }, [loans, loanPayments]);

    const payrollData = useMemo<PayrollData[]>(() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        const relevantStaff = staffMembers.filter(s => selectedLocationId === 'ALL_LOCATIONS' || s.locationId === selectedLocationId);
        const workOrdersMap = new Map(workOrders.map(wo => [wo.id, wo]));

        const invoicesForPeriod = invoices.filter(inv => {
            const invDate = new Date(inv.issueDate);
            return invDate >= startDate && invDate <= endDate && (selectedLocationId === 'ALL_LOCATIONS' || inv.locationId === selectedLocationId);
        });

        return relevantStaff.map(staff => {
            let hoursWorked = 0;
            let basePay = 0;
            let commissionPay = 0;
            const commissionDetails: CommissionDetail[] = [];

            if (staff.requiresTimeClock) {
                const entries = timeClockEntries
                    .filter(e => e.staffId === staff.id && new Date(e.timestamp) >= startDate && new Date(e.timestamp) <= endDate)
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                for (let i = 0; i < entries.length; i += 2) {
                    if (entries[i]?.type === 'in' && entries[i + 1]?.type === 'out') {
                        const inTime = new Date(entries[i].timestamp).getTime();
                        const outTime = new Date(entries[i + 1].timestamp).getTime();
                        hoursWorked += (outTime - inTime) / (1000 * 60 * 60);
                    }
                }
            }
            
            // Calculate Base Pay
            switch (staff.salaryType) {
                case 'Por Hora': basePay = hoursWorked * (staff.salaryAmount || 0); break;
                case 'Quincenal': basePay = (staff.salaryAmount || 0) * (days / 15); break;
                case 'Mensual': basePay = (staff.salaryAmount || 0) * (days / 30); break;
                case 'Mixto (Base + Comisión)': basePay = (staff.salaryAmount || 0) * (days / 30); break;
                default: basePay = 0;
            }

            // Calculate Commission Pay for Advisors
            if ((staff.salaryType === 'Mixto (Base + Comisión)' || staff.salaryType === 'Comisión Pura') && staff.commissionRate) {
                const advisorInvoices = invoicesForPeriod.filter(inv => {
                    const wo = workOrdersMap.get(inv.workOrderId);
                    return wo?.advisorId === staff.id;
                });

                for (const inv of advisorInvoices) {
                    const profitOnInvoice = inv.items.reduce((profit, item) => {
                        const itemRevenue = (item.unitPrice * item.quantity) - (item.discount || 0);
                        let itemCost = item.commission || 0; // B2B commission is a cost
                        if (item.type === 'inventory' && item.costPrice) {
                            itemCost += item.costPrice * item.quantity;
                        }
                        return profit + (itemRevenue - itemCost);
                    }, 0);
                    const commissionEarned = profitOnInvoice * (staff.commissionRate / 100);
                    commissionPay += commissionEarned;
                    commissionDetails.push({ invoiceId: inv.id, profit: profitOnInvoice, commission: commissionEarned });
                }
            }
            
            const calculatedPay = basePay + commissionPay;
            
            let deduction = 0;
            let loanId: string | undefined = undefined;
            const activeLoan = activeLoansByStaff.get(staff.id);
            if (activeLoan) {
                const balance = activeLoan.amount - loanPayments.filter(p => p.loanId === activeLoan.id).reduce((s, p) => s + p.amount, 0);
                deduction = Math.min(balance, activeLoan.deductionPerPayPeriod);
                loanId = activeLoan.id;
            }

            const netPay = calculatedPay - deduction;

            return { staffId: staff.id, name: staff.name, salaryType: staff.salaryType, salaryAmount: staff.salaryAmount, hoursWorked, basePay, commissionPay, calculatedPay, deduction, netPay, loanId, commissionDetails };
        });
    }, [staffMembers, timeClockEntries, selectedLocationId, days, activeLoansByStaff, loanPayments, workOrders, invoices]);
    
    const totalPayroll = useMemo(() => payrollData.reduce((sum, data) => sum + data.netPay, 0), [payrollData]);

    const handleRegisterForEmployee = async(data: PayrollData) => {
        if (data.netPay <= 0 || selectedLocationId === 'ALL_LOCATIONS') return;

        await handleAddOperatingExpense({
            description: `Pago de nómina para ${data.name} (Período: ${days} días)`,
            category: 'Nómina',
            amount: data.netPay,
            locationId: selectedLocationId,
            accountId: 'ACC-BOG-BANK', // This should be selectable in a real app
            userId: 'S1', // This should be the current user
        });

        if (data.deduction > 0 && data.loanId) {
            await handleAddLoanPayment({
                loanId: data.loanId,
                amount: data.deduction,
                isPayrollDeduction: true,
            });
        }
        
        setPaidStaffIds(prev => new Set(prev).add(data.staffId));
        alert(`Pago para ${data.name} registrado con éxito.`);
    };

    const getCalculationDetail = (data: PayrollData) => {
        switch (data.salaryType) {
            case 'Por Hora': return `Salario Base: ${data.hoursWorked.toFixed(2)} horas trabajadas a ${formatCurrency(data.salaryAmount || 0)}/hora.`;
            case 'Mensual': return `Salario Base: Salario mensual de ${formatCurrency(data.salaryAmount || 0)} proporcional a ${days} días.`;
            case 'Quincenal': return `Salario Base: Salario quincenal de ${formatCurrency(data.salaryAmount || 0)} proporcional a ${days} días.`;
            case 'Mixto (Base + Comisión)': return `Salario Base: ${formatCurrency(data.salaryAmount || 0)}/mes proporcional a ${days} días.`;
            case 'Comisión Pura': return 'Salario Base no aplica.';
            default: return 'Salario no definido.';
        }
    };

    const activeLoanForModal = detailsModalData ? activeLoansByStaff.get(detailsModalData.staffId) : null;
    const loanBalance = activeLoanForModal ? activeLoanForModal.amount - loanPayments.filter(p => p.loanId === activeLoanForModal!.id).reduce((s, p) => s + p.amount, 0) : 0;

    return (
        <div className="space-y-6">
            <div className="bg-light dark:bg-dark-light rounded-xl shadow-md p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="days" className="text-sm font-medium">Calcular nómina para los últimos</label>
                    <select id="days" value={days} onChange={e => setDays(Number(e.target.value))} className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1">
                        <option value={7}>7 días</option>
                        <option value={15}>15 días (Quincena)</option>
                        <option value={30}>30 días (Mes)</option>
                    </select>
                </div>
                 <div className="text-center sm:text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total a Pagar (Neto)</p>
                    <p className="text-2xl font-bold text-brand-red">{formatCurrency(totalPayroll)}</p>
                </div>
            </div>
             <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Empleado</th>
                                <th className="px-6 py-3 text-right">Pago Bruto</th>
                                <th className="px-6 py-3 text-right">Deducciones</th>
                                <th className="px-6 py-3 text-right">Pago Neto</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {payrollData.map(data => (
                                <tr key={data.staffId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        <p>{data.name}</p>
                                        <p className="text-xs text-gray-400">{data.salaryType} ({formatCurrency(data.salaryAmount || 0)})</p>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-300 font-mono">
                                        {formatCurrency(data.calculatedPay)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-red-400 font-mono">
                                        {data.deduction > 0 ? `-${formatCurrency(data.deduction)}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-mono font-semibold">{formatCurrency(data.netPay)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => setDetailsModalData(data)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md" title="Ver Detalles">
                                                <Icon name="eye" className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleRegisterForEmployee(data)} 
                                                disabled={data.netPay <= 0 || paidStaffIds.has(data.staffId) || !hasPermission('manage:payroll')}
                                                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-500"
                                            >
                                                <Icon name="check-circle" className="w-4 h-4" />
                                                {paidStaffIds.has(data.staffId) ? 'Pagado' : 'Registrar Pago'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
             {detailsModalData && (
                <Modal isOpen={true} onClose={() => setDetailsModalData(null)} title={`Detalle de Nómina para ${detailsModalData.name}`} size="lg">
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-black dark:bg-gray-900/20 rounded-lg">
                            <h3 className="font-semibold text-light-text dark:text-dark-text mb-2">Cálculo de Ingresos</h3>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400">Pago Base:</span>
                                <span className="font-mono font-semibold text-lg text-light-text dark:text-dark-text">{formatCurrency(detailsModalData.basePay)}</span>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
                                {getCalculationDetail(detailsModalData)}
                            </p>
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-gray-500 dark:text-gray-400">Comisiones por Utilidad:</span>
                                <span className="font-mono font-semibold text-lg text-green-500 dark:text-green-400">+{formatCurrency(detailsModalData.commissionPay)}</span>
                            </div>
                            {detailsModalData.commissionDetails.length > 0 && (
                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic space-y-1">
                                    {detailsModalData.commissionDetails.map(d => (
                                        <p key={d.invoiceId}>- Factura {d.invoiceId}: {formatCurrency(d.commission)} (de {formatCurrency(d.profit)} de utilidad)</p>
                                    ))}
                                </div>
                            )}
                             <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 font-bold">
                                <span className="text-light-text dark:text-dark-text">Pago Bruto Total:</span>
                                <span className="font-mono text-lg text-light-text dark:text-dark-text">{formatCurrency(detailsModalData.calculatedPay)}</span>
                            </div>
                        </div>

                         <div className="p-4 bg-gray-50 dark:bg-black dark:bg-gray-900/20 rounded-lg">
                            <h3 className="font-semibold text-light-text dark:text-dark-text mb-2">Cálculo de Deducciones</h3>
                             {detailsModalData.deduction > 0 && activeLoanForModal ? (
                                <>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400">Abono a Préstamo:</span>
                                    <span className="font-mono font-semibold text-lg text-red-500 dark:text-red-400">-{formatCurrency(detailsModalData.deduction)}</span>
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
                                    Motivo: {activeLoanForModal.reason}. Saldo restante: {formatCurrency(loanBalance - detailsModalData.deduction)}
                                </p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400 dark:text-gray-500">No hay deducciones para este período.</p>
                            )}
                        </div>

                        <div className="p-4 bg-brand-red/10 border border-brand-red/50 rounded-lg">
                             <div className="flex justify-between items-center">
                                <span className="font-semibold text-brand-red">Pago Neto a Recibir:</span>
                                <span className="font-mono font-bold text-xl text-brand-red">{formatCurrency(detailsModalData.netPay)}</span>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                             <button type="button" onClick={() => setDetailsModalData(null)} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default PayrollReport;