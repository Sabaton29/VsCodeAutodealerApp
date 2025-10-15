

import React, { useMemo } from 'react';
import { Icon } from '../Icon';
import { StaffMember, Permission, WorkOrder, TimeClockEntry, Loan, LoanPayment } from '../../types';
import { STATUS_DISPLAY_CONFIG } from '../../constants';

interface StaffDetailViewProps {
    staffMember: StaffMember;
    workOrders: WorkOrder[];
    timeClockEntries: TimeClockEntry[];
    loans: Loan[];
    loanPayments: LoanPayment[];
    onBack: () => void;
    onEditStaff: (staff: StaffMember) => void;
    onViewWorkOrder: (id: string) => void;
    hasPermission: (permission: Permission) => boolean;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const StaffDetailView: React.FC<StaffDetailViewProps> = ({ staffMember, workOrders, timeClockEntries, loans, loanPayments, onBack, onEditStaff, onViewWorkOrder, hasPermission }) => {

    const loanSummary = useMemo(() => {
        if (loans.length === 0) return { totalLoaned: 0, totalPaid: 0, balance: 0, activeLoans: 0 };
        const totalLoaned = loans.reduce((sum, loan) => sum + loan.amount, 0);
        const totalPaid = loanPayments.reduce((sum, p) => {
            if (loans.some(l => l.id === p.loanId)) {
                return sum + p.amount;
            }
            return sum;
        }, 0);
        return { totalLoaned, totalPaid, balance: totalLoaned - totalPaid, activeLoans: loans.length };
    }, [loans, loanPayments]);

    const DetailInfoCard: React.FC<{ title: string; icon: any; children: React.ReactNode }> = ({ title, icon, children }) => (
        <div className="bg-dark-light rounded-xl p-5">
            <h3 className="font-bold text-white flex items-center gap-2 mb-3"><Icon name={icon} className="w-5 h-5 text-brand-red"/> {title}</h3>
            {children}
        </div>
    );
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700/50 transition-colors">
                        <Icon name="arrow-left" className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-4">
                        <img src={staffMember.avatarUrl} alt={staffMember.name} className="w-16 h-16 rounded-full" />
                        <div>
                            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">{staffMember.name}</h1>
                            <p className="mt-1 text-gray-500 dark:text-gray-400">{staffMember.role} - {staffMember.specialty || 'General'}</p>
                        </div>
                    </div>
                </div>
                {hasPermission('manage:staff') && (
                     <button onClick={() => onEditStaff(staffMember)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors">
                        <Icon name="edit" className="w-4 h-4" /> Editar Perfil
                    </button>
                )}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                    <DetailInfoCard title="Información de Contacto" icon="user">
                        <ul className="text-sm space-y-2 text-gray-300">
                            <li><strong className="text-gray-400">Email:</strong> {staffMember.email}</li>
                            <li><strong className="text-gray-400">Documento:</strong> {`${staffMember.documentType} - ${staffMember.documentNumber}`}</li>
                        </ul>
                    </DetailInfoCard>
                    <DetailInfoCard title="Información de Nómina" icon="wallet">
                         <ul className="text-sm space-y-2 text-gray-300">
                            <li><strong className="text-gray-400">Tipo Salario:</strong> {staffMember.salaryType || 'No definido'}</li>
                            <li><strong className="text-gray-400">Monto:</strong> {formatCurrency(staffMember.salaryAmount || 0)}</li>
                            <li><strong className="text-gray-400">Fichaje Horario:</strong> {staffMember.requiresTimeClock ? 'Requerido' : 'No Requerido'}</li>
                            <li><strong className="text-gray-400">Pró-labore:</strong> {staffMember.isProLabore ? 'Sí' : 'No'}</li>
                        </ul>
                    </DetailInfoCard>
                    <DetailInfoCard title="Resumen de Préstamos" icon="credit-card">
                         <ul className="text-sm space-y-2 text-gray-300">
                            <li><strong className="text-gray-400">Saldo Pendiente:</strong> <span className="font-semibold text-red-400">{formatCurrency(loanSummary.balance)}</span></li>
                            <li><strong className="text-gray-400">Total Prestado:</strong> {formatCurrency(loanSummary.totalLoaned)}</li>
                            <li><strong className="text-gray-400">Total Pagado:</strong> {formatCurrency(loanSummary.totalPaid)}</li>
                        </ul>
                    </DetailInfoCard>
                </div>

                {/* Right Column (History) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-dark-light rounded-xl p-5">
                        <h3 className="font-bold text-white text-lg mb-3">Órdenes de Trabajo Asignadas</h3>
                        <div className="overflow-x-auto max-h-[40vh]">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-black dark:bg-gray-900/30 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2">ID</th><th className="px-4 py-2">Vehículo</th>
                                        <th className="px-4 py-2">Fecha</th><th className="px-4 py-2">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {workOrders.map(wo => (
                                        <tr key={wo.id} onClick={() => onViewWorkOrder(wo.id)} className="hover:bg-gray-800/50 cursor-pointer">
                                            <td className="px-4 py-3 font-mono">{wo.id}</td>
                                            <td className="px-4 py-3">{`${wo.vehicle.make} ${wo.vehicle.model} (${wo.vehicle.plate})`}</td>
                                            <td className="px-4 py-3">{formatDateTime(wo.date)}</td>
                                            <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_DISPLAY_CONFIG[wo.status].bg} ${STATUS_DISPLAY_CONFIG[wo.status].text}`}>{wo.status}</span></td>
                                        </tr>
                                    ))}
                                    {workOrders.length === 0 && <tr><td colSpan={4} className="text-center py-4 text-gray-500">Sin órdenes de trabajo asignadas.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                     <div className="bg-dark-light rounded-xl p-5">
                        <h3 className="font-bold text-white text-lg mb-3">Registro Horario</h3>
                        <div className="overflow-x-auto max-h-[40vh]">
                             <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-black dark:bg-gray-900/30 sticky top-0">
                                    <tr><th className="px-4 py-2">Fecha y Hora</th><th className="px-4 py-2 text-center">Tipo</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {timeClockEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(entry => (
                                        <tr key={entry.id} className="hover:bg-gray-800/50">
                                            <td className="px-4 py-3">{formatDateTime(entry.timestamp)}</td>
                                            <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${entry.type === 'in' ? 'bg-green-800/50 text-green-200' : 'bg-yellow-800/50 text-yellow-200'}`}>{entry.type === 'in' ? 'Entrada' : 'Salida'}</span></td>
                                        </tr>
                                    ))}
                                    {timeClockEntries.length === 0 && <tr><td colSpan={2} className="text-center py-4 text-gray-500">Sin registros horarios.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDetailView;