import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { supabaseService } from './services/supabase';
import {
    Location, WorkOrder, WorkOrderStatus, Client, Vehicle, KanbanStage, StaffMember, Service,
    InventoryItem, Supplier, PettyCashTransaction, Invoice, InvoiceStatus, PaymentMethod,
    DiagnosticData, WorkOrderHistoryEntry, Quote, QuoteStatus, PurchaseOrder, PurchaseOrderStatus,
    QuoteItem, DataContextType, UIContextType, UserRole, OperatingExpense, FinancialAccount, AppSettings, Permission, ServiceCategory, InventoryCategory,
    PaymentTerms, DayOfWeek, TimeClockEntry, Loan, LoanPayment, ProgressLogEntry, DiagnosticType, UnforeseenIssue, Notification, NotificationType, Appointment, AppointmentStatus,
} from './types';
import {
    LOCATIONS_DATA, WORK_ORDERS_DATA, CLIENTS_DATA, VEHICLES_DATA, KANBAN_STAGES_ORDER,
    STAFF_DATA, SERVICES_DATA, INVENTORY_DATA, SUPPLIERS_DATA, PETTY_CASH_DATA,
    INVOICES_DATA, QUOTES_DATA, PURCHASE_ORDERS_DATA, OPERATING_EXPENSES_DATA, FINANCIAL_ACCOUNTS_DATA, DEFAULT_SERVICE_CATEGORIES, DEFAULT_INVENTORY_CATEGORIES, TIME_CLOCK_DATA, LOANS_DATA, LOAN_PAYMENTS_DATA, NOTIFICATIONS_DATA, APPOINTMENTS_DATA,
} from './constants';
import { UIContext } from './components/UIContext';

const DEFAULT_APP_SETTINGS: AppSettings = {
    companyInfo: {
        name: 'Autodealer Taller SAS',
        nit: '900.123.456-7',
        logoUrl: '/favicon.svg',
    },
    billingSettings: {
        vatRate: 19,
        currencySymbol: '$',
        defaultTerms: 'El pago debe realizarse dentro de los 30 días posteriores a la fecha de la factura. Todos los trabajos están garantizados por 3 meses o 5,000 km, lo que ocurra primero.',
        bankInfo: 'Cuenta de Ahorros Bancolombia #123-456789-00 a nombre de Autodealer Taller SAS.',
    },
    operationsSettings: {
        serviceCategories: DEFAULT_SERVICE_CATEGORIES,
        inventoryCategories: DEFAULT_INVENTORY_CATEGORIES,
    },
};

export const DataContext = createContext<DataContextType | null>(null);

const calculateDueDate = (issueDate: Date, terms?: PaymentTerms): Date => {
    const date = new Date(issueDate);
    if (!terms || terms.type === 'ON_DELIVERY') {
        date.setDate(date.getDate() + 1); // Default to next day payment
        return date;
    }
    if (terms.type === 'NET_DAYS') {
        date.setDate(date.getDate() + terms.days);
        return date;
    }
    if (terms.type === 'DAY_OF_WEEK') {
        const targetDay = terms.dayOfWeek;
        const currentDay = date.getDay();
        const daysUntilTarget = (targetDay - currentDay + 7) % 7;
        date.setDate(date.getDate() + daysUntilTarget);
        return date;
    }
    return date;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // State for all data
    const [locations, setLocations] = useState<Location[]>([]);
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [pettyCashTransactions, setPettyCashTransactions] = useState<PettyCashTransaction[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [operatingExpenses, setOperatingExpenses] = useState<OperatingExpense[]>([]);
    const [financialAccounts, setFinancialAccounts] = useState<FinancialAccount[]>([]);
    const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
    const [timeClockEntries, setTimeClockEntries] = useState<TimeClockEntry[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loanPayments, setLoanPayments] = useState<LoanPayment[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load all data from Supabase on component mount
    useEffect(() => {
        const loadAllData = async() => {
            try {
                setIsLoading(true);
                setError(null);

                // Load all data in parallel for optimal performance
                const [
                    locationsData,
                    workOrdersData,
                    clientsData,
                    vehiclesData,
                    staffMembersData,
                    servicesData,
                    inventoryItemsData,
                    suppliersData,
                    pettyCashData,
                    invoicesData,
                    quotesData,
                    purchaseOrdersData,
                    operatingExpensesData,
                    financialAccountsData,
                    appSettingsData,
                    timeClockData,
                    loansData,
                    loanPaymentsData,
                    notificationsData,
                    appointmentsData,
                ] = await Promise.all([
                    supabaseService.getLocations(),
                    supabaseService.getWorkOrders(),
                    supabaseService.getClients(),
                    supabaseService.getVehicles(),
                    supabaseService.getStaffMembers(),
                    supabaseService.getServices(),
                    supabaseService.getInventoryItems(),
                    supabaseService.getSuppliers(),
                    supabaseService.getPettyCashTransactions(),
                    supabaseService.getInvoices(),
                    supabaseService.getQuotes(),
                    supabaseService.getPurchaseOrders(),
                    supabaseService.getOperatingExpenses(),
                    supabaseService.getFinancialAccounts(),
                    supabaseService.getAppSettings(),
                    supabaseService.getTimeClockEntries(),
                    supabaseService.getLoans(),
                    supabaseService.getLoanPayments(),
                    supabaseService.getNotifications(),
                    supabaseService.getAppointments(),
                ]);

                // Set all data
                setLocations(locationsData);
                setWorkOrders(workOrdersData);
                setClients(clientsData);
                setVehicles(vehiclesData);
                setStaffMembers(staffMembersData);
                setServices(servicesData);
                setInventoryItems(inventoryItemsData);
                setSuppliers(suppliersData);
                setPettyCashTransactions(pettyCashData);
                setInvoices(invoicesData);
                setQuotes(quotesData);
                setPurchaseOrders(purchaseOrdersData);
                setOperatingExpenses(operatingExpensesData);
                setFinancialAccounts(financialAccountsData);
                setTimeClockEntries(timeClockData);
                setLoans(loansData);
                setLoanPayments(loanPaymentsData);
                setNotifications(notificationsData);
                setAppointments(appointmentsData);

                // Set app settings (use first one or default)
                if (appSettingsData.length > 0) {
                    setAppSettings(appSettingsData[0]);
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
                
                // Fallback to default data if Supabase fails
                setLocations(LOCATIONS_DATA);
                setWorkOrders(WORK_ORDERS_DATA);
                setClients(CLIENTS_DATA);
                setVehicles(VEHICLES_DATA);
                setStaffMembers(STAFF_DATA);
                setServices(SERVICES_DATA);
                setInventoryItems(INVENTORY_DATA);
                setSuppliers(SUPPLIERS_DATA);
                setPettyCashTransactions(PETTY_CASH_DATA);
                setInvoices(INVOICES_DATA);
                setQuotes(QUOTES_DATA);
                setPurchaseOrders(PURCHASE_ORDERS_DATA);
                setOperatingExpenses(OPERATING_EXPENSES_DATA);
                setFinancialAccounts(FINANCIAL_ACCOUNTS_DATA);
                setTimeClockEntries(TIME_CLOCK_DATA);
                setLoans(LOANS_DATA);
                setLoanPayments(LOAN_PAYMENTS_DATA);
                setNotifications(NOTIFICATIONS_DATA);
                setAppointments(APPOINTMENTS_DATA);
            } finally {
                setIsLoading(false);
            }
        };

        loadAllData();
    }, []);

    // Generic CRUD operations using Supabase
    const createUpdater = <T, >(
        setter: React.Dispatch<React.SetStateAction<T[]>>,
        tableName: string,
    ) => {
        return async(newItem: T): Promise<void> => {
            try {
                const result = await supabaseService.insert(tableName, newItem);
                if (result.length > 0) {
                    setter(prev => [...prev, ...result]);
                }
            } catch (error) {
                console.error(`Error creating ${tableName}:`, error);
                throw error;
            }
        };
    };

    const createSaveHandler = <T, >(
        setter: React.Dispatch<React.SetStateAction<T[]>>,
        tableName: string,
    ) => {
        return async(updatedItem: T & { id: string }): Promise<void> => {
            try {
                const result = await supabaseService.update(tableName, updatedItem.id, updatedItem);
                if (result) {
                    setter(prev => prev.map(item => 
                        (item as any).id === updatedItem.id ? result : item,
                    ));
                }
            } catch (error) {
                console.error(`Error updating ${tableName}:`, error);
                throw error;
            }
        };
    };

    const createDeleteHandler = <T, >(
        setter: React.Dispatch<React.SetStateAction<T[]>>,
        tableName: string,
    ) => {
        return async(id: string): Promise<void> => {
            try {
                const success = await supabaseService.delete(tableName, id);
                if (success) {
                    setter(prev => prev.filter((item: any) => item.id !== id));
                }
            } catch (error) {
                console.error(`Error deleting ${tableName}:`, error);
                throw error;
            }
        };
    };

    // Notification helper
    const createNotification = async(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<void> => {
        try {
            const newNotification: Notification = {
                ...notification,
                id: crypto.randomUUID(),
                createdAt: new Date(),
            };
            await supabaseService.insertNotification(newNotification);
            setNotifications(prev => [...prev, newNotification]);
        } catch (error) {
            console.error('Error creating notification:', error);
        }
    };

    // Specific handlers for each entity
    const handleCreateLocation = createUpdater(setLocations, 'locations');
    const handleSaveLocation = createSaveHandler(setLocations, 'locations');
    const handleDeleteLocation = createDeleteHandler(setLocations, 'locations');

    const handleCreateWorkOrder = async(workOrderData: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
        try {
            const newWorkOrder: WorkOrder = {
                ...workOrderData,
                id: crypto.randomUUID(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await supabaseService.insertWorkOrder(newWorkOrder);
            setWorkOrders(prev => [...prev, newWorkOrder]);
            
            // Create notification
            await createNotification({
                type: 'WORK_ORDER_CREATED',
                title: 'Nueva Orden de Trabajo',
                message: `Se ha creado una nueva orden de trabajo: ${workOrderData.serviceRequested}`,
                userId: workOrderData.advisorId || '',
                isRead: false,
            });
        } catch (error) {
            console.error('Error creating work order:', error);
            throw error;
        }
    };

    const handleSaveWorkOrder = async(workOrderData: { id: string; serviceRequested: string; advisorId?: string; staffMemberId?: string; comments?: string; }): Promise<void> => {
        try {
            const result = await supabaseService.updateWorkOrder(workOrderData.id, {
                ...workOrderData,
                updatedAt: new Date(),
            });
            if (result) {
                setWorkOrders(prev => prev.map(wo => 
                    wo.id === workOrderData.id ? result : wo,
                ));
            }
        } catch (error) {
            console.error('Error updating work order:', error);
            throw error;
        }
    };

    const handleDeleteWorkOrder = createDeleteHandler(setWorkOrders, 'work_orders');

    const handleCreateClient = createUpdater(setClients, 'clients');
    const handleSaveClient = createSaveHandler(setClients, 'clients');
    const handleDeleteClient = createDeleteHandler(setClients, 'clients');

    const handleCreateVehicle = createUpdater(setVehicles, 'vehicles');
    const handleSaveVehicle = createSaveHandler(setVehicles, 'vehicles');
    const handleDeleteVehicle = createDeleteHandler(setVehicles, 'vehicles');

    const handleCreateStaffMember = createUpdater(setStaffMembers, 'staff_members');
    const handleSaveStaffMember = createSaveHandler(setStaffMembers, 'staff_members');
    const handleDeleteStaffMember = createDeleteHandler(setStaffMembers, 'staff_members');

    const handleCreateService = createUpdater(setServices, 'services');
    const handleSaveService = createSaveHandler(setServices, 'services');
    const handleDeleteService = createDeleteHandler(setServices, 'services');

    const handleCreateInventoryItem = createUpdater(setInventoryItems, 'inventory_items');
    const handleSaveInventoryItem = createSaveHandler(setInventoryItems, 'inventory_items');
    const handleDeleteInventoryItem = createDeleteHandler(setInventoryItems, 'inventory_items');

    const handleCreateSupplier = createUpdater(setSuppliers, 'suppliers');
    const handleSaveSupplier = createSaveHandler(setSuppliers, 'suppliers');
    const handleDeleteSupplier = createDeleteHandler(setSuppliers, 'suppliers');

    const handleCreatePettyCashTransaction = createUpdater(setPettyCashTransactions, 'petty_cash_transactions');
    const handleSavePettyCashTransaction = createSaveHandler(setPettyCashTransactions, 'petty_cash_transactions');
    const handleDeletePettyCashTransaction = createDeleteHandler(setPettyCashTransactions, 'petty_cash_transactions');

    const handleCreateInvoice = createUpdater(setInvoices, 'invoices');
    const handleSaveInvoice = createSaveHandler(setInvoices, 'invoices');
    const handleDeleteInvoice = createDeleteHandler(setInvoices, 'invoices');

    const handleCreateQuote = createUpdater(setQuotes, 'quotes');
    const handleDeleteQuote = createDeleteHandler(setQuotes, 'quotes');

    const handleCreatePurchaseOrder = createUpdater(setPurchaseOrders, 'purchase_orders');
    const handleSavePurchaseOrder = createSaveHandler(setPurchaseOrders, 'purchase_orders');
    const handleDeletePurchaseOrder = createDeleteHandler(setPurchaseOrders, 'purchase_orders');

    const handleCreateOperatingExpense = createUpdater(setOperatingExpenses, 'operating_expenses');
    const handleSaveOperatingExpense = createSaveHandler(setOperatingExpenses, 'operating_expenses');
    const handleDeleteOperatingExpense = createDeleteHandler(setOperatingExpenses, 'operating_expenses');

    const handleCreateFinancialAccount = createUpdater(setFinancialAccounts, 'financial_accounts');
    const handleSaveFinancialAccount = createSaveHandler(setFinancialAccounts, 'financial_accounts');
    const handleDeleteFinancialAccount = createDeleteHandler(setFinancialAccounts, 'financial_accounts');

    const handleCreateTimeClockEntry = createUpdater(setTimeClockEntries, 'time_clock_entries');
    const handleSaveTimeClockEntry = createSaveHandler(setTimeClockEntries, 'time_clock_entries');
    const handleDeleteTimeClockEntry = createDeleteHandler(setTimeClockEntries, 'time_clock_entries');

    const handleCreateLoan = createUpdater(setLoans, 'loans');
    const handleSaveLoan = createSaveHandler(setLoans, 'loans');
    const handleDeleteLoan = createDeleteHandler(setLoans, 'loans');

    const handleCreateLoanPayment = createUpdater(setLoanPayments, 'loan_payments');
    const handleSaveLoanPayment = createSaveHandler(setLoanPayments, 'loan_payments');
    const handleDeleteLoanPayment = createDeleteHandler(setLoanPayments, 'loan_payments');

    const handleCreateAppointment = createUpdater(setAppointments, 'appointments');
    const handleSaveAppointment = createSaveHandler(setAppointments, 'appointments');
    const handleDeleteAppointment = createDeleteHandler(setAppointments, 'appointments');
    
    const handleConfirmAppointment = async(appointmentId: string): Promise<void> => {
        console.log('🔍 handleConfirmAppointment called with ID:', appointmentId);
        
        try {
            const appointment = appointments.find(a => a.id === appointmentId);
            if (!appointment) {
                console.error('Appointment not found:', appointmentId);
                return;
            }
            
            console.log('🔍 Found appointment:', appointment);
            
            // Actualizar el estado local primero para feedback inmediato
            const updatedAppointment = { ...appointment, status: AppointmentStatus.CONFIRMADA };
            setAppointments(prev => prev.map(a => a.id === appointmentId ? updatedAppointment : a));
            console.log('🔍 Appointment status updated in local state');
            
            // Luego actualizar en Supabase
            try {
                const result = await supabaseService.update('appointments', appointmentId, { 
                    status: AppointmentStatus.CONFIRMADA 
                });
                console.log('🔍 Supabase update result:', result);
            } catch (supabaseError) {
                console.error('Supabase update failed, reverting local state:', supabaseError);
                // Revertir el estado local si falla la actualización en Supabase
                setAppointments(prev => prev.map(a => a.id === appointmentId ? appointment : a));
                throw supabaseError;
            }
        } catch (error) {
            console.error('Error confirming appointment:', error);
            throw error;
        }
    };
    
    const handleCancelAppointment = async(appointmentId: string): Promise<void> => {
        console.log('🔍 handleCancelAppointment called with ID:', appointmentId);
        
        try {
            const appointment = appointments.find(a => a.id === appointmentId);
            if (!appointment) {
                console.error('Appointment not found for cancellation:', appointmentId);
                return;
            }
            
            console.log('🔍 Found appointment for cancellation:', appointment);
            
            // Actualizar el estado local primero para feedback inmediato
            const updatedAppointment = { ...appointment, status: AppointmentStatus.CANCELADA };
            setAppointments(prev => prev.map(a => a.id === appointmentId ? updatedAppointment : a));
            console.log('🔍 Appointment cancelled in local state');
            
            // Luego actualizar en Supabase
            try {
                const result = await supabaseService.update('appointments', appointmentId, { 
                    status: AppointmentStatus.CANCELADA 
                });
                console.log('🔍 Supabase cancel result:', result);
            } catch (supabaseError) {
                console.error('Supabase cancel failed, reverting local state:', supabaseError);
                // Revertir el estado local si falla la actualización en Supabase
                setAppointments(prev => prev.map(a => a.id === appointmentId ? appointment : a));
                throw supabaseError;
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            throw error;
        }
    };

    // Complex operations
    const handleAssignTechnician = async(workOrderId: string, technicianId: string): Promise<void> => {
        try {
            const result = await supabaseService.updateWorkOrder(workOrderId, {
                assignedTechnicianId: technicianId,
                updatedAt: new Date(),
            });
            if (result) {
                setWorkOrders(prev => prev.map(wo => 
                    wo.id === workOrderId ? result : wo,
                ));
                
                // Create notification
                await createNotification({
                    type: 'WORK_ORDER_ASSIGNED',
                    title: 'Orden Asignada',
                    message: `Se te ha asignado una nueva orden de trabajo`,
                    userId: technicianId,
                    isRead: false,
                });
            }
        } catch (error) {
            console.error('Error assigning technician:', error);
            throw error;
        }
    };

    const handleCancelOrder = async(workOrderId: string, reason: string): Promise<void> => {
        try {
            const result = await supabaseService.updateWorkOrder(workOrderId, {
                status: 'CANCELLED' as WorkOrderStatus,
                cancellationReason: reason,
                updatedAt: new Date(),
            });
            if (result) {
                setWorkOrders(prev => prev.map(wo => 
                    wo.id === workOrderId ? result : wo,
                ));
                
                // Create notification
                await createNotification({
                    type: 'WORK_ORDER_CANCELLED',
                    title: 'Orden Cancelada',
                    message: `La orden de trabajo ha sido cancelada: ${reason}`,
                    userId: result.advisorId || '',
                    isRead: false,
                });
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            throw error;
        }
    };

    const handleAdvanceStage = async(workOrderId: string, currentStage: KanbanStage): Promise<void> => {
        try {
            const currentIndex = KANBAN_STAGES_ORDER.indexOf(currentStage);
            if (currentIndex < KANBAN_STAGES_ORDER.length - 1) {
                const nextStage = KANBAN_STAGES_ORDER[currentIndex + 1];
                const workOrder = workOrders.find(wo => wo.id === workOrderId);
                
                const result = await supabaseService.updateWorkOrder(workOrderId, {
                    stage: nextStage,
                    history: [
                        ...(workOrder?.history || []),
                        { stage: nextStage, date: new Date().toISOString(), user: 'Sistema' },
                    ],
                    updatedAt: new Date(),
                });
                
                if (result) {
                    setWorkOrders(prev => prev.map(wo => 
                        wo.id === workOrderId ? result : wo,
                    ));
                }
            }
        } catch (error) {
            console.error('Error advancing stage:', error);
            throw error;
        }
    };

    const handleRetreatStage = async(workOrderId: string, currentStage: KanbanStage): Promise<void> => {
        try {
            const currentIndex = KANBAN_STAGES_ORDER.indexOf(currentStage);
            if (currentIndex > 0) {
                const previousStage = KANBAN_STAGES_ORDER[currentIndex - 1];
                const workOrder = workOrders.find(wo => wo.id === workOrderId);
                
                const result = await supabaseService.updateWorkOrder(workOrderId, {
                    stage: previousStage,
                    history: [
                        ...(workOrder?.history || []),
                        { stage: previousStage, date: new Date().toISOString(), user: 'Sistema', notes: 'Retroceso manual de etapa' },
                    ],
                    updatedAt: new Date(),
                });
                
                if (result) {
                    setWorkOrders(prev => prev.map(wo => 
                        wo.id === workOrderId ? result : wo,
                    ));
                }
            }
        } catch (error) {
            console.error('Error retreating stage:', error);
            throw error;
        }
    };


    const handleSaveInvoiceCommissions = async(invoiceId: string, commissions: { itemId: string; commission: number }[]): Promise<void> => {
        try {
            const invoice = invoices.find(inv => inv.id === invoiceId);
            if (!invoice) return;

            const commissionMap = new Map(commissions.map(c => [c.itemId, c.commission]));
            const updatedItems = invoice.items.map(item => ({
                ...item,
                commission: commissionMap.get(item.id) ?? item.commission,
            }));

            const updatedInvoice = { ...invoice, items: updatedItems };
            await supabaseService.update('invoices', invoiceId, updatedInvoice);
            setInvoices(prev => prev.map(inv => 
                inv.id === invoiceId ? updatedInvoice : inv,
            ));
        } catch (error) {
            console.error('Error saving invoice commissions:', error);
            throw error;
        }
    };

    const handleRegisterPayment = async(invoiceId: string, paymentData: { amount: number; paymentMethod: PaymentMethod; date: string }): Promise<void> => {
        try {
            const invoice = invoices.find(inv => inv.id === invoiceId);
            if (!invoice) return;

            const updatedInvoice = { ...invoice, status: InvoiceStatus.PAGADA };
            await supabaseService.update('invoices', invoiceId, updatedInvoice);
            setInvoices(prev => prev.map(inv => 
                inv.id === invoiceId ? updatedInvoice : inv,
            ));

            // Crear transacción de ingreso
            const newTransaction: PettyCashTransaction = {
                id: `TR-${Date.now()}`,
                type: 'income',
                description: `Pago Factura ${invoiceId}`,
                amount: paymentData.amount,
                date: paymentData.date,
                paymentMethod: paymentData.paymentMethod,
                locationId: invoice.locationId,
                userId: 'S1',
            };
            
            await supabaseService.insert('petty_cash_transactions', newTransaction);
            setPettyCashTransactions(prev => [...prev, newTransaction]);
        } catch (error) {
            console.error('Error registering payment:', error);
            throw error;
        }
    };

    const handleCancelInvoice = async(invoiceId: string): Promise<void> => {
        try {
            const invoice = invoices.find(inv => inv.id === invoiceId);
            if (!invoice) return;

            const updatedInvoice = { ...invoice, status: InvoiceStatus.CANCELADA };
            await supabaseService.update('invoices', invoiceId, updatedInvoice);
            setInvoices(prev => prev.map(inv => 
                inv.id === invoiceId ? updatedInvoice : inv,
            ));
        } catch (error) {
            console.error('Error cancelling invoice:', error);
            throw error;
        }
    };

    const handleFactorInvoice = async(invoiceId: string, factoringData: Omit<Invoice['factoringInfo'], 'retentionReleased'>): Promise<void> => {
        try {
            const invoice = invoices.find(inv => inv.id === invoiceId);
            if (!invoice) return;
            
            const updatedInvoice = { 
                ...invoice, 
                status: InvoiceStatus.PAGADA_FACTORING, 
                factoringInfo: factoringData as Invoice['factoringInfo'],
            };
            
            await supabaseService.update('invoices', invoiceId, updatedInvoice);
            setInvoices(prev => prev.map(inv => 
                inv.id === invoiceId ? updatedInvoice : inv,
            ));

            // Crear gasto operativo por la comisión
            const expenseData: OperatingExpense = {
                id: `OE-${Date.now()}`,
                description: `Comisión Factoring Factura #${invoiceId} con ${factoringData.company}`,
                category: 'Administrativos',
                amount: factoringData.commission,
                date: factoringData.date,
                locationId: invoice.locationId,
                accountId: factoringData.accountId,
                userId: 'S1',
            };
            
            await supabaseService.insert('operating_expenses', expenseData);
            setOperatingExpenses(prev => [...prev, expenseData]);
            
            // Crear transacción de ingreso por el dinero recibido
            const receivedAmount = invoice.total - factoringData.commission - factoringData.retentionAmount;
            if (receivedAmount > 0) {
                const transactionData: PettyCashTransaction = {
                    id: `TR-${Date.now()}`,
                    type: 'income',
                    description: `Ingreso por Factoring Factura #${invoiceId}`,
                    amount: receivedAmount,
                    date: factoringData.date,
                    paymentMethod: 'Transferencia',
                    locationId: invoice.locationId,
                    accountId: factoringData.accountId,
                    userId: 'S1',
                };
                
                await supabaseService.insert('petty_cash_transactions', transactionData);
                setPettyCashTransactions(prev => [...prev, transactionData]);
            }
        } catch (error) {
            console.error('Error factoring invoice:', error);
            throw error;
        }
    };

    const handleReleaseRetention = async(invoiceId: string, releaseData: { date: string; accountId: string; }): Promise<void> => {
        try {
            const invoice = invoices.find(inv => inv.id === invoiceId);
            if (!invoice || !invoice.factoringInfo) return;

            const updatedInvoice = {
                ...invoice,
                status: InvoiceStatus.PAGADA,
                factoringInfo: {
                    ...invoice.factoringInfo,
                    retentionReleased: releaseData,
                },
            };
            
            await supabaseService.update('invoices', invoiceId, updatedInvoice);
            setInvoices(prev => prev.map(inv => 
                inv.id === invoiceId ? updatedInvoice : inv,
            ));
            
            // Crear transacción de ingreso por la retención liberada
            const transactionData: PettyCashTransaction = {
                id: `TR-${Date.now()}`,
                type: 'income',
                description: `Liberación de retención Factura #${invoiceId}`,
                amount: invoice.factoringInfo.retentionAmount,
                date: releaseData.date,
                paymentMethod: 'Transferencia',
                locationId: invoice.locationId,
                accountId: releaseData.accountId,
                userId: 'S1',
            };
            
            await supabaseService.insert('petty_cash_transactions', transactionData);
            setPettyCashTransactions(prev => [...prev, transactionData]);
        } catch (error) {
            console.error('Error releasing retention:', error);
            throw error;
        }
    };

    const handleToggleInvoiceVat = async(invoiceId: string): Promise<void> => {
        try {
            const invoice = invoices.find(inv => inv.id === invoiceId);
            if (!invoice || !appSettings) return;

            const newVatIncluded = !(invoice.vatIncluded ?? true);

            const subtotal = invoice.items.reduce((acc, item) => {
                const itemTotal = (item.unitPrice * item.quantity) - (item.discount || 0);
                return acc + itemTotal;
            }, 0);
            
            let newTaxAmount = 0;
            let newTotal = 0;
            
            if (newVatIncluded) {
                newTaxAmount = subtotal * (appSettings.billingSettings.vatRate / 100);
                newTotal = subtotal + newTaxAmount;
            } else {
                newTaxAmount = 0;
                newTotal = subtotal;
            }

            const updatedInvoice = {
                ...invoice,
                vatIncluded: newVatIncluded,
                taxAmount: newTaxAmount,
                total: newTotal,
            };
            
            await supabaseService.update('invoices', invoiceId, updatedInvoice);
            setInvoices(prev => prev.map(inv =>
                inv.id === invoiceId ? updatedInvoice : inv,
            ));
        } catch (error) {
            console.error('Error toggling invoice VAT:', error);
            throw error;
        }
    };

    const handleRegisterItemCosts = async(workOrderId: string, costs: { itemId: string; costPrice: number; supplierId: string }[]): Promise<void> => {
        try {
            const workOrder = workOrders.find(wo => wo.id === workOrderId);
            if (!workOrder || (workOrder.linkedQuoteIds || []).length === 0) return;
            
            const relevantQuoteIds = new Set<string>(workOrder.linkedQuoteIds);

            for (const quoteId of relevantQuoteIds) {
                const quote = quotes.find(q => q.id === quoteId);
                if (quote) {
                    const newItems = quote.items.map(item => {
                        const costInfo = costs.find(c => c.itemId === item.id);
                        if (costInfo) {
                            return { ...item, costPrice: costInfo.costPrice, supplierId: costInfo.supplierId };
                        }
                        return item;
                    });
                    
                    const updatedQuote = { ...quote, items: newItems };
                    await supabaseService.updateQuote(quoteId, updatedQuote);
                    setQuotes(prev => prev.map(q => 
                        q.id === quoteId ? updatedQuote : q,
                    ));
                }
            }
        } catch (error) {
            console.error('Error registering item costs:', error);
            throw error;
        }
    };

    const handleRegisterDelivery = async(workOrderId: string, deliveryData: { deliveryEvidenceFiles: File[]; nextMaintenanceDate: string; nextMaintenanceMileage: string; nextMaintenanceNotes: string; customerConfirmed: boolean; }): Promise<void> => {
        try {
            const workOrder = workOrders.find(wo => wo.id === workOrderId);
            if (!workOrder) return;

            const result = await supabaseService.updateWorkOrder(workOrderId, {
                stage: KanbanStage.ENTREGADO,
                deliveryDate: new Date().toISOString(),
                nextMaintenanceDate: deliveryData.nextMaintenanceDate,
                nextMaintenanceMileage: deliveryData.nextMaintenanceMileage,
                nextMaintenanceNotes: deliveryData.nextMaintenanceNotes,
                history: [
                    ...(workOrder.history || []),
                    { 
                        stage: KanbanStage.ENTREGADO, 
                        date: new Date().toISOString(), 
                        user: 'Sistema',
                        notes: 'Vehículo entregado al cliente',
                    },
                ],
                updatedAt: new Date(),
            });
            
            if (result) {
                setWorkOrders(prev => prev.map(wo => 
                    wo.id === workOrderId ? result : wo,
                ));
            }
        } catch (error) {
            console.error('Error registering delivery:', error);
            throw error;
        }
    };

    const handleSaveDiagnostic = async(workOrderId: string, diagnosticData: DiagnosticData): Promise<void> => {
        try {
            const result = await supabaseService.updateWorkOrder(workOrderId, {
                diagnosticData,
                updatedAt: new Date(),
            });
            if (result) {
                setWorkOrders(prev => prev.map(wo => 
                    wo.id === workOrderId ? result : wo,
                ));
                
                // Create notification
                await createNotification({
                    type: 'DIAGNOSTIC_COMPLETED',
                    title: 'Diagnóstico Completado',
                    message: `El diagnóstico ha sido completado para la orden de trabajo`,
                    userId: result.advisorId || '',
                    isRead: false,
                });
            }
        } catch (error) {
            console.error('Error saving diagnostic:', error);
            throw error;
        }
    };

    const handleSaveQuote = async(quoteId: string, quoteData: Partial<Quote>): Promise<void> => {
        try {
            const result = await supabaseService.updateQuote(quoteId, {
                ...quoteData,
                updatedAt: new Date(),
            });
            if (result) {
                setQuotes(prev => prev.map(q => 
                    q.id === quoteId ? result : q,
                ));
                
                // Create notification
                await createNotification({
                    type: 'QUOTE_UPDATED',
                    title: 'Cotización Actualizada',
                    message: `La cotización ha sido actualizada`,
                    userId: result.clientId || '',
                    isRead: false,
                });
            }
        } catch (error) {
            console.error('Error saving quote:', error);
            throw error;
        }
    };

    const handleRejectQuote = async(quoteId: string, reason: string): Promise<void> => {
        try {
            const result = await supabaseService.updateQuote(quoteId, {
                status: 'REJECTED' as QuoteStatus,
                rejectionReason: reason,
                updatedAt: new Date(),
            });
            if (result) {
                setQuotes(prev => prev.map(q => 
                    q.id === quoteId ? result : q,
                ));
                
                // Create notification
                await createNotification({
                    type: 'QUOTE_REJECTED',
                    title: 'Cotización Rechazada',
                    message: `La cotización ha sido rechazada: ${reason}`,
                    userId: result.clientId || '',
                    isRead: false,
                });
            }
        } catch (error) {
            console.error('Error rejecting quote:', error);
            throw error;
        }
    };

    const handleReportUnforeseenIssue = async(workOrderId: string, issue: UnforeseenIssue): Promise<void> => {
        try {
            const workOrder = workOrders.find(wo => wo.id === workOrderId);
            if (!workOrder) throw new Error('Work order not found');

            const updatedIssues = [...(workOrder.unforeseenIssues || []), issue];
            const result = await supabaseService.updateWorkOrder(workOrderId, {
                unforeseenIssues: updatedIssues,
                updatedAt: new Date(),
            });
            if (result) {
                setWorkOrders(prev => prev.map(wo => 
                    wo.id === workOrderId ? result : wo,
                ));
                
                // Create notification
                await createNotification({
                    type: 'UNFORESEEN_ISSUE',
                    title: 'Problema Imprevisto Reportado',
                    message: `Se ha reportado un problema imprevisto: ${issue.description}`,
                    userId: workOrder.advisorId || '',
                    isRead: false,
                });
            }
        } catch (error) {
            console.error('Error reporting unforeseen issue:', error);
            throw error;
        }
    };

    // Computed values
    const activeWorkOrders = useMemo(() => 
        workOrders.filter(wo => wo.status !== 'COMPLETED' && wo.status !== 'CANCELLED'),
        [workOrders],
    );

    const completedWorkOrders = useMemo(() => 
        workOrders.filter(wo => wo.status === 'COMPLETED'),
        [workOrders],
    );

    const pendingQuotes = useMemo(() => 
        quotes.filter(q => q.status === 'PENDING'),
        [quotes],
    );

    const approvedQuotes = useMemo(() => 
        quotes.filter(q => q.status === 'APPROVED'),
        [quotes],
    );

    const rejectedQuotes = useMemo(() => 
        quotes.filter(q => q.status === 'REJECTED'),
        [quotes],
    );

    const unpaidInvoices = useMemo(() => 
        invoices.filter(inv => inv.status !== 'PAID'),
        [invoices],
    );

    const paidInvoices = useMemo(() => 
        invoices.filter(inv => inv.status === 'PAID'),
        [invoices],
    );

    const lowStockItems = useMemo(() => 
        inventoryItems.filter(item => item.currentStock <= item.minStockLevel),
        [inventoryItems],
    );

    const outOfStockItems = useMemo(() => 
        inventoryItems.filter(item => item.currentStock === 0),
        [inventoryItems],
    );

    const contextValue: DataContextType = {
        // Data
        locations,
        workOrders,
        clients,
        vehicles,
        staffMembers,
        services,
        inventoryItems,
        suppliers,
        pettyCashTransactions,
        invoices,
        quotes,
        purchaseOrders,
        operatingExpenses,
        financialAccounts,
        appSettings,
        timeClockEntries,
        loans,
        loanPayments,
        notifications,
        appointments,

        // Computed values
        activeWorkOrders,
        completedWorkOrders,
        pendingQuotes,
        approvedQuotes,
        rejectedQuotes,
        unpaidInvoices,
        paidInvoices,
        lowStockItems,
        outOfStockItems,

        // Loading and error states
        isLoading,
        error,

        // CRUD operations
        handleCreateLocation,
        handleSaveLocation,
        handleDeleteLocation,

        handleCreateWorkOrder,
        handleSaveWorkOrder,
        handleDeleteWorkOrder,

        handleCreateClient,
        handleSaveClient,
        handleDeleteClient,

        handleCreateVehicle,
        handleSaveVehicle,
        handleDeleteVehicle,

        handleCreateStaffMember,
        handleSaveStaffMember,
        handleDeleteStaffMember,

        handleCreateService,
        handleSaveService,
        handleDeleteService,

        handleCreateInventoryItem,
        handleSaveInventoryItem,
        handleDeleteInventoryItem,

        handleCreateSupplier,
        handleSaveSupplier,
        handleDeleteSupplier,

        handleCreatePettyCashTransaction,
        handleSavePettyCashTransaction,
        handleDeletePettyCashTransaction,

        handleCreateInvoice,
        handleSaveInvoice,
        handleDeleteInvoice,

        handleCreateQuote,
        handleDeleteQuote,

        handleCreatePurchaseOrder,
        handleSavePurchaseOrder,
        handleDeletePurchaseOrder,

        handleCreateOperatingExpense,
        handleSaveOperatingExpense,
        handleDeleteOperatingExpense,

        handleCreateFinancialAccount,
        handleSaveFinancialAccount,
        handleDeleteFinancialAccount,

        handleCreateTimeClockEntry,
        handleSaveTimeClockEntry,
        handleDeleteTimeClockEntry,

        handleCreateLoan,
        handleSaveLoan,
        handleDeleteLoan,

        handleCreateLoanPayment,
        handleSaveLoanPayment,
        handleDeleteLoanPayment,

        handleCreateAppointment,
        handleSaveAppointment,
        handleDeleteAppointment,
        handleConfirmAppointment,
        handleCancelAppointment,

        // Complex operations
        handleAssignTechnician,
        handleCancelOrder,
        handleAdvanceStage,
        handleRetreatStage,
        handleSaveDiagnostic,
        handleSaveQuote,
        handleRejectQuote,
        handleReportUnforeseenIssue,
        handleSaveInvoiceCommissions,
        handleRegisterPayment,
        handleCancelInvoice,
        handleFactorInvoice,
        handleReleaseRetention,
        handleToggleInvoiceVat,
        handleRegisterItemCosts,
        handleRegisterDelivery,

        // Utility functions
        calculateDueDate,
        createNotification,
    };

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};