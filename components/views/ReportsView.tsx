

import React, { useState, useMemo } from 'react';
import { PettyCashTransaction, WorkOrder, Quote, StaffMember, Service, Invoice, InventoryItem, Supplier, OperatingExpense, Client } from '../../types';
import { Icon } from '../Icon';
import ProfitAndLossReport from '../ProfitAndLossReport';
import TechnicianProductivityReport from '../TechnicianProductivityReport';
import AdvisorPerformanceReport from '../AdvisorPerformanceReport';
import ProfitabilityByWorkOrder from '../ProfitabilityByWorkOrder';
import PartConsumptionReport from '../PartConsumptionReport';
import ServicePerformanceReport from '../ServicePerformanceReport';
import AccountsReceivableReport from '../AccountsReceivableReport';
import AccountsPayableReport from '../AccountsPayableReport';
import OperationalEfficiencyReport from '../OperationalEfficiencyReport';
import ClientRetentionReport from '../ClientRetentionReport';

interface ReportsViewProps {
    pettyCashTransactions: PettyCashTransaction[];
    operatingExpenses: OperatingExpense[];
    workOrders: WorkOrder[];
    quotes: Quote[];
    staffMembers: StaffMember[];
    services: Service[];
    invoices: Invoice[];
    inventoryItems: InventoryItem[];
    suppliers: Supplier[];
    clients: Client[];
    selectedLocationId: string;
    onViewInvoiceDetails: (invoiceId: string) => void;
}

type DateFilter = '7d' | '30d' | 'thisMonth' | 'lastMonth';

const ReportsView: React.FC<ReportsViewProps> = ({ 
    pettyCashTransactions, operatingExpenses, workOrders, quotes, staffMembers, services, 
    invoices, inventoryItems, suppliers, clients, selectedLocationId, onViewInvoiceDetails, 
}) => {
    const [filter, setFilter] = useState<DateFilter>('30d');
    const isGlobalView = selectedLocationId === 'ALL_LOCATIONS';

    const dateRange = useMemo(() => {
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date(now);

        switch (filter) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case 'thisMonth':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'lastMonth':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
        }
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        return { startDate, endDate };
    }, [filter]);

    // Pre-filter all data based on location to pass to sub-reports
    const filteredInvoices = useMemo(() => isGlobalView ? invoices : invoices.filter(i => i.locationId === selectedLocationId), [invoices, selectedLocationId, isGlobalView]);
    const filteredOperatingExpenses = useMemo(() => isGlobalView ? operatingExpenses : operatingExpenses.filter(e => e.locationId === selectedLocationId), [operatingExpenses, selectedLocationId, isGlobalView]);
    const filteredWorkOrders = useMemo(() => isGlobalView ? workOrders : workOrders.filter(w => w.locationId === selectedLocationId), [workOrders, selectedLocationId, isGlobalView]);
    const filteredQuotes = useMemo(() => isGlobalView ? quotes : quotes.filter(q => q.locationId === selectedLocationId), [quotes, selectedLocationId, isGlobalView]);
    const filteredStaffMembers = useMemo(() => isGlobalView ? staffMembers : staffMembers.filter(s => s.locationId === selectedLocationId), [staffMembers, selectedLocationId, isGlobalView]);
    const filteredServices = useMemo(() => isGlobalView ? services : services.filter(s => s.locationId === selectedLocationId), [services, selectedLocationId, isGlobalView]);
    const filteredInventoryItems = useMemo(() => isGlobalView ? inventoryItems : inventoryItems.filter(i => i.locationId === selectedLocationId), [inventoryItems, selectedLocationId, isGlobalView]);
    const filteredSuppliers = useMemo(() => isGlobalView ? suppliers : suppliers.filter(s => s.locationId === selectedLocationId), [suppliers, selectedLocationId, isGlobalView]);
    const filteredPettyCash = useMemo(() => isGlobalView ? pettyCashTransactions : pettyCashTransactions.filter(p => p.locationId === selectedLocationId), [pettyCashTransactions, selectedLocationId, isGlobalView]);
    const filteredClients = useMemo(() => isGlobalView ? clients : clients.filter(c => c.locationId === selectedLocationId), [clients, selectedLocationId, isGlobalView]);


    const FILTERS: { key: DateFilter; label: string }[] = [
        { key: '7d', label: 'Últimos 7 días' },
        { key: '30d', label: 'Últimos 30 días' },
        { key: 'thisMonth', label: 'Este Mes' },
        { key: 'lastMonth', label: 'Mes Pasado' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Reportes</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">Analiza el rendimiento financiero y operativo.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                {FILTERS.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            filter === key ? 'bg-brand-red text-white' : 'bg-light dark:bg-dark-light text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
            
            <ProfitAndLossReport
                invoices={filteredInvoices}
                operatingExpenses={filteredOperatingExpenses}
                selectedLocationId={selectedLocationId}
                dateRange={dateRange}
            />
            
            <div>
                 <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">Análisis Financiero Detallado</h2>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AccountsReceivableReport 
                        invoices={filteredInvoices}
                        selectedLocationId={selectedLocationId}
                        onViewInvoiceDetails={onViewInvoiceDetails}
                    />
                    <AccountsPayableReport
                        pettyCashTransactions={filteredPettyCash}
                        suppliers={filteredSuppliers}
                        selectedLocationId={selectedLocationId}
                    />
                 </div>
            </div>

            <ProfitabilityByWorkOrder
                invoices={filteredInvoices}
                selectedLocationId={selectedLocationId}
                dateRange={dateRange}
            />

            <div>
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">Análisis de Items y Servicios</h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <PartConsumptionReport
                        invoices={filteredInvoices}
                        inventoryItems={filteredInventoryItems}
                        selectedLocationId={selectedLocationId}
                        dateRange={dateRange}
                    />
                    <ServicePerformanceReport
                        invoices={filteredInvoices}
                        services={filteredServices}
                        selectedLocationId={selectedLocationId}
                        dateRange={dateRange}
                    />
                </div>
            </div>
            
             <div>
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">Análisis de Rendimiento del Personal</h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                     <TechnicianProductivityReport
                        workOrders={filteredWorkOrders}
                        quotes={filteredQuotes}
                        staffMembers={filteredStaffMembers}
                        services={filteredServices}
                        selectedLocationId={selectedLocationId}
                        dateRange={dateRange}
                    />
                    <AdvisorPerformanceReport
                        invoices={filteredInvoices}
                        workOrders={filteredWorkOrders}
                        staffMembers={filteredStaffMembers}
                        selectedLocationId={selectedLocationId}
                        dateRange={dateRange}
                    />
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">Análisis de Eficiencia Operativa</h2>
                 <OperationalEfficiencyReport
                    workOrders={filteredWorkOrders}
                    invoices={filteredInvoices}
                    selectedLocationId={selectedLocationId}
                    dateRange={dateRange}
                />
            </div>

             <div>
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">Análisis de Clientes y Marketing</h2>
                 <ClientRetentionReport
                    clients={filteredClients}
                    invoices={filteredInvoices}
                    workOrders={filteredWorkOrders}
                    selectedLocationId={selectedLocationId}
                />
            </div>
        </div>
    );
};

export default ReportsView;
