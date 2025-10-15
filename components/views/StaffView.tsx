import React, { useState, useMemo } from 'react';
import type { StaffMember, Permission, TimeClockEntry, Loan, LoanPayment } from '../../types';
import { Icon } from '../Icon';
import StaffActions from '../StaffActions';
import TimeClockView from '../TimeClockView';
import LoansView from '../LoansView';

interface StaffViewProps {
    selectedLocationId: string;
    staffMembers: StaffMember[];
    timeClockEntries: TimeClockEntry[];
    loans: Loan[];
    loanPayments: LoanPayment[];
    setEditingStaffMember: (staff: StaffMember | 'new' | null) => void;
    handleDeleteStaffMember: (staffId: string) => void;
    hasPermission: (permission: Permission) => boolean;
    onAddLoan: () => void;
    onAddLoanPayment: () => void;
    onViewStaffDetails: (staffId: string) => void;
}

const StaffView: React.FC<StaffViewProps> = (props) => {
    const { 
        selectedLocationId, staffMembers, timeClockEntries, loans, loanPayments, 
        setEditingStaffMember, handleDeleteStaffMember, hasPermission, 
        onAddLoan, onAddLoanPayment, onViewStaffDetails, 
    } = props;
    const [activeTab, setActiveTab] = useState('Listado');
    
    const tabs = useMemo(() => {
        const availableTabs = ['Listado'];
        if (hasPermission('view:time_clock')) {
            availableTabs.push('Registro Horario');
        }
        if (hasPermission('view:loans')) {
            availableTabs.push('Préstamos');
        }
        return availableTabs;
    }, [hasPermission]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Gestión de Personal</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">Administra a los empleados, sus roles y registros horarios.</p>
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
                {activeTab === 'Listado' && (
                    <StaffList 
                        staffMembers={staffMembers}
                        setEditingStaffMember={setEditingStaffMember}
                        handleDeleteStaffMember={handleDeleteStaffMember}
                        hasPermission={hasPermission}
                        selectedLocationId={selectedLocationId}
                        onViewStaffDetails={onViewStaffDetails}
                    />
                )}
                {activeTab === 'Registro Horario' && (
                    <TimeClockView
                        timeClockEntries={timeClockEntries}
                        staffMembers={staffMembers}
                    />
                )}
                {activeTab === 'Préstamos' && (
                    <LoansView
                        loans={loans}
                        loanPayments={loanPayments}
                        staffMembers={staffMembers}
                        onAddLoan={onAddLoan}
                        onAddLoanPayment={onAddLoanPayment}
                        hasPermission={hasPermission}
                    />
                )}
            </div>
        </div>
    );
};

interface StaffListProps extends Pick<StaffViewProps, 'staffMembers' | 'setEditingStaffMember' | 'handleDeleteStaffMember' | 'hasPermission' | 'selectedLocationId' | 'onViewStaffDetails'> {}

const StaffList: React.FC<StaffListProps> = ({ staffMembers, setEditingStaffMember, handleDeleteStaffMember, hasPermission, selectedLocationId, onViewStaffDetails }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredStaff = useMemo(() => {
        if (!searchTerm) return staffMembers;
        return staffMembers.filter(staff =>
            staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.documentNumber.includes(searchTerm),
        );
    }, [searchTerm, staffMembers]);
    
    const isGlobalView = selectedLocationId === 'ALL_LOCATIONS';

    return (
         <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-200 dark:border-gray-800">
                <div className="relative w-full sm:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon name="search" className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar personal..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                </div>
                {hasPermission('manage:staff') && (
                    <button
                        onClick={() => setEditingStaffMember('new')}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-dark-light disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isGlobalView}
                        title={isGlobalView ? 'Seleccione una sede para añadir personal' : 'Añadir Personal'}
                    >
                        <Icon name="user-plus" className="w-5 h-5" />
                        Añadir Personal
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">Rol</th>
                            <th scope="col" className="px-6 py-3">Documento</th>
                            <th scope="col" className="px-6 py-3">Especialidad</th>
                            <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStaff.map((staff: StaffMember) => (
                            <tr 
                                key={staff.id} 
                                className="bg-light dark:bg-dark-light border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                                onClick={() => onViewStaffDetails(staff.id)}
                            >
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <div className="flex items-center gap-3">
                                        <img src={staff.avatarUrl} alt={staff.name} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <p>{staff.name}</p>
                                            <p className="text-xs text-gray-500">{staff.email}</p>
                                        </div>
                                    </div>
                                </th>
                                <td className="px-6 py-4">{staff.role}</td>
                                <td className="px-6 py-4 font-mono">{staff.documentType}<br/>{staff.documentNumber}</td>
                                <td className="px-6 py-4">{staff.specialty || 'N/A'}</td>
                                <td className="px-6 py-4 text-right">
                                    <StaffActions 
                                        staffMember={staff}
                                        onEdit={() => setEditingStaffMember(staff)}
                                        onDelete={() => handleDeleteStaffMember(staff.id)}
                                        onViewDetails={() => onViewStaffDetails(staff.id)}
                                        hasPermission={hasPermission}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export default StaffView;