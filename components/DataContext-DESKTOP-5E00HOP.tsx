import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { supabaseService } from '../services/supabase';
import {
    Location, WorkOrder, WorkOrderStatus, Client, Vehicle, KanbanStage, StaffMember, Service,
    InventoryItem, Supplier, PettyCashTransaction, Invoice, InvoiceStatus, PaymentMethod,
    DiagnosticData, WorkOrderHistoryEntry, Quote, QuoteStatus, PurchaseOrder, PurchaseOrderStatus,
    QuoteItem, DataContextType, UIContextType, UserRole, OperatingExpense, FinancialAccount, AppSettings, Permission, ServiceCategory, InventoryCategory,
    PaymentTerms, DayOfWeek, TimeClockEntry, Loan, LoanPayment, ProgressLogEntry, DiagnosticType, UnforeseenIssue, Notification, NotificationType, Appointment, AppointmentStatus,
} from '../types';
import {
    LOCATIONS_DATA, WORK_ORDERS_DATA, CLIENTS_DATA, VEHICLES_DATA, KANBAN_STAGES_ORDER,
    STAFF_DATA, SERVICES_DATA, INVENTORY_DATA, SUPPLIERS_DATA, PETTY_CASH_DATA,
    INVOICES_DATA, QUOTES_DATA, PURCHASE_ORDERS_DATA, OPERATING_EXPENSES_DATA, FINANCIAL_ACCOUNTS_DATA, DEFAULT_SERVICE_CATEGORIES, DEFAULT_INVENTORY_CATEGORIES, TIME_CLOCK_DATA, LOANS_DATA, LOAN_PAYMENTS_DATA, NOTIFICATIONS_DATA, APPOINTMENTS_DATA,
} from '../constants';
import { UIContext } from './UIContext';

const DEFAULT_APP_SETTINGS: AppSettings = {
    companyInfo: {
        name: 'Autodealer Taller SAS',
        nit: '900.123.456-7',
        logoUrl: '/images/company/logo.png',
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
    diagnosticSettings: {
        basic: [],
        intermediate: [],
        advanced: [],
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
    const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
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

                console.warn('🔄 Loading data from Supabase...');

                // Load all data in parallel
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
                const settings = Array.isArray(appSettingsData) ? (appSettingsData.length > 0 ? appSettingsData[0] : null) : appSettingsData || null;
                if (settings) {
                    
                    
                    // Ensure default categories are initialized if not present
                    if (!settings.operationsSettings?.serviceCategories || settings.operationsSettings.serviceCategories.length === 0) {
                        settings.operationsSettings = {
                            ...settings.operationsSettings,
                            serviceCategories: DEFAULT_SERVICE_CATEGORIES,
                        };
                    }
                    
                    if (!settings.operationsSettings?.inventoryCategories || settings.operationsSettings.inventoryCategories.length === 0) {
                        settings.operationsSettings = {
                            ...settings.operationsSettings,
                            inventoryCategories: DEFAULT_INVENTORY_CATEGORIES,
                        };
                    }
                    
                    setAppSettings(settings);
                } else {
                    console.warn('⚠️ No app settings found in DB, using default');
                    // Ensure default categories are set in default settings
                    const defaultSettings = {
                        ...DEFAULT_APP_SETTINGS,
                        operationsSettings: {
                            serviceCategories: DEFAULT_SERVICE_CATEGORIES,
                            inventoryCategories: DEFAULT_INVENTORY_CATEGORIES,
                        },
                    };
                    setAppSettings(defaultSettings);
                }


            } catch (err) {
                console.error('❌ Error loading data from Supabase:', err);
                setError(err instanceof Error ? err.message : 'Failed to load data');
                
                // Fallback to default data if Supabase fails
                console.warn('🔄 Falling back to default data...');
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
                // Add required fields if they don't exist
                const itemWithId = {
                    ...newItem,
                    id: (newItem as any).id || crypto.randomUUID(),
                    createdAt: (newItem as any).createdAt || new Date(),
                    updatedAt: (newItem as any).updatedAt || new Date(),
                };

                // Fix locationId if it's 'ALL_LOCATIONS' or empty
                if ((itemWithId as any).locationId === 'ALL_LOCATIONS' || !(itemWithId as any).locationId) {
                    (itemWithId as any).locationId = '550e8400-e29b-41d4-a716-446655440001'; // Default to Bogotá
                }
                
                console.warn(`🔍 createUpdater - Creating ${tableName}:`, itemWithId);
                const result = await supabaseService.insert(tableName, itemWithId);
                console.warn(`🔍 createUpdater - Result for ${tableName}:`, result);
                if (result.length > 0) {
                    setter(prev => {
                        const newState = [...prev, ...result];
                        console.warn(`🔍 createUpdater - Updated state for ${tableName}, new count:`, newState.length);
                        return newState;
                    });
                    console.warn(`🔍 createUpdater - Updated state for ${tableName}`);
                } else {
                    console.error(`🔍 createUpdater - No result returned for ${tableName}`);
                }
            } catch (error) {
                console.error(`🔍 createUpdater - Error creating ${tableName}:`, error);
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
                console.warn(`🔍 createSaveHandler - Updating ${tableName}:`, updatedItem);
                const result = await supabaseService.update(tableName, updatedItem.id, updatedItem);
                console.warn(`🔍 createSaveHandler - Result for ${tableName}:`, result);
                if (result) {
                    setter(prev => prev.map(item => 
                        (item as any).id === updatedItem.id ? result : item,
                    ));
                    console.warn(`🔍 createSaveHandler - Updated state for ${tableName}`);
                } else {
                    console.error(`🔍 createSaveHandler - No result returned for ${tableName}`);
                }
            } catch (error) {
                console.error(`🔍 createSaveHandler - Error updating ${tableName}:`, error);
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
    const createNotification = async(notification: Omit<Notification, 'id'>): Promise<void> => {
        try {
            // Skip notification if userId is empty (UUID fields can't be empty strings)
            if (!notification.userId || notification.userId.trim() === '') {
                console.warn('Skipping notification: userId is empty');
                return;
            }

            const newNotification: Notification = {
                ...notification,
                id: crypto.randomUUID(),
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
    const updateLocation = createSaveHandler(setLocations, 'locations');

    const handleCreateWorkOrder = async(workOrderData: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
        try {
            console.warn('🔍 Creating work order with data:', {
                clientId: workOrderData.clientId,
                vehicleId: workOrderData.vehicleId,
                locationId: workOrderData.locationId,
                serviceRequested: workOrderData.serviceRequested,
                locationIdType: typeof workOrderData.locationId,
            });
            
            // Generate sequential ID (0019, 0020, etc.)
            const existingWorkOrders = workOrders.filter(wo => /^\d{4}$/.test(wo.id));
            const maxId = existingWorkOrders.length > 0 
                ? Math.max(...existingWorkOrders.map(wo => parseInt(wo.id)))
                : 18; // Start from 0019 if no existing sequential IDs
            const workOrderId = String(maxId + 1).padStart(4, '0');
            const now = new Date();
            
            // Create initial history entry for "Recepción"
            const initialHistory: WorkOrderHistoryEntry = {
                stage: 'Recepción',
                date: now,
                user: 'Sistema',
                notes: `Orden de trabajo creada para: ${workOrderData.serviceRequested}`,
            };

            const newWorkOrder: WorkOrder = {
                ...workOrderData,
                id: workOrderId,
                status: WorkOrderStatus.EN_PROCESO, // Add default status
                createdAt: now,
                updatedAt: now,
                history: [initialHistory], // Initialize with reception entry
                locationId: workOrderData.locationId || '550e8400-e29b-41d4-a716-446655440001', // Fallback to Bogotá if not specified
            };
            
            console.warn('🔍 Final work order before insertion:', {
                id: newWorkOrder.id,
                locationId: newWorkOrder.locationId,
                locationIdType: typeof newWorkOrder.locationId,
                originalLocationId: workOrderData.locationId,
            });
            
            await supabaseService.insertWorkOrder(newWorkOrder);
            setWorkOrders(prev => [...prev, newWorkOrder]);
            
            // Create notification
            await createNotification({
                type: 'WORK_ORDER_CREATED',
                message: `Se ha creado una nueva orden de trabajo: ${workOrderData.serviceRequested}`,
                userId: workOrderData.advisorId || '',
                isRead: false,
                timestamp: new Date().toISOString(),
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

    const handleUpdateWorkOrderDiagnosticType = async(workOrderId: string, diagnosticType: DiagnosticType): Promise<void> => {
        try {
            const result = await supabaseService.updateWorkOrder(workOrderId, {
                diagnosticType,
                updatedAt: new Date(),
            });
            
            if (result) {
                setWorkOrders(prev => prev.map(wo => 
                    wo.id === workOrderId ? result : wo,
                ));
            }
        } catch (error) {
            console.error('Error updating diagnostic type:', error);
            throw error;
        }
    };

    const handleUpdateWorkOrderHistory = async(workOrderId: string, newHistoryEntry: WorkOrderHistoryEntry): Promise<void> => {
        try {
            const currentWorkOrder = workOrders.find(wo => wo.id === workOrderId);
            if (!currentWorkOrder) return;

            const updatedHistory = [...(currentWorkOrder.history || []), newHistoryEntry];
            
            const result = await supabaseService.updateWorkOrder(workOrderId, {
                history: updatedHistory,
                updatedAt: new Date(),
            });
            
            if (result) {
                setWorkOrders(prev => prev.map(wo => 
                    wo.id === workOrderId ? result : wo,
                ));
            }
        } catch (error) {
            console.error('Error updating work order history:', error);
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
    const handleSaveService = async(updatedService: Service): Promise<void> => {
        try {
            console.warn(`🔍 handleSaveService - Updating service:`, updatedService);
            const result = await supabaseService.updateService(updatedService.id, updatedService);
            console.warn(`🔍 handleSaveService - Result:`, result);
            if (result) {
                setServices(prev => prev.map(service => 
                    service.id === updatedService.id ? result : service,
                ));
                console.warn(`🔍 handleSaveService - Updated state for services`);
            } else {
                console.error(`🔍 handleSaveService - No result returned`);
            }
        } catch (error) {
            console.error(`🔍 handleSaveService - Error updating service:`, error);
            throw error;
        }
    };
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

    const handleCreateQuote = async(quoteData: Omit<Quote, 'id'>): Promise<Quote | null> => {
        try {
            const result = await supabaseService.insert('quotes', quoteData);
            if (result && quoteData.workOrderId) {
                // If quote status is ENVIADO, update work order stage to "Esperando Aprobación"
                // If quote status is BORRADOR, keep current stage (Pendiente Cotización)
                if (result.status === QuoteStatus.ENVIADO) {
                    const updateData = {
                        stage: KanbanStage.ESPERA_APROBACION,
                        updatedAt: new Date(),
                    };
                    
                    console.warn('🔍 DataContext - handleCreateQuote - Updating work order stage to Esperando Aprobación');
                    await supabaseService.updateWorkOrder(quoteData.workOrderId, updateData);
                    
                    // Update local work orders state
                    setWorkOrders(prev => prev.map(wo => 
                        wo.id === quoteData.workOrderId ? { ...wo, stage: KanbanStage.ESPERA_APROBACION } : wo,
                    ));
                    
                    // Add history entry
                    const historyEntry: WorkOrderHistoryEntry = {
                        stage: 'Esperando Aprobación',
                        date: new Date().toISOString(),
                        user: 'Sistema',
                        notes: `Cotización ${result.id} enviada - Total: $${quoteData.total?.toLocaleString() || '0'}`,
                    };
                    await handleUpdateWorkOrderHistory(quoteData.workOrderId, historyEntry);
                }
            }
            return result;
        } catch (error) {
            console.error('Error creating quote:', error);
            throw error;
        }
    };
    const handleDeleteQuote = createDeleteHandler(setQuotes, 'quotes');

    const handleAdvanceStage = async(workOrderId: string, currentStage: KanbanStage): Promise<void> => {
        try {
            const currentIndex = KANBAN_STAGES_ORDER.indexOf(currentStage);
            if (currentIndex < KANBAN_STAGES_ORDER.length - 1) {
                const nextStage = KANBAN_STAGES_ORDER[currentIndex + 1];
                
                console.warn(`🔍 DataContext - handleAdvanceStage - Advancing from ${currentStage} to ${nextStage}`);
                
                const updateData = {
                    stage: nextStage,
                    updatedAt: new Date(),
                };
                
                await supabaseService.updateWorkOrder(workOrderId, updateData);
                
                // Update local work orders state
                setWorkOrders(prev => prev.map(wo => 
                    wo.id === workOrderId ? { ...wo, stage: nextStage } : wo,
                ));
                
                // Add history entry
                const historyEntry: WorkOrderHistoryEntry = {
                    stage: nextStage,
                    date: new Date().toISOString(),
                    user: 'Sistema', // TODO: Get current user from context
                    notes: `Etapa avanzada manualmente de ${currentStage} a ${nextStage}`,
                };
                await handleUpdateWorkOrderHistory(workOrderId, historyEntry);
                
            }
        } catch (error) {
            console.error('Error advancing work order stage:', error);
            throw error;
        }
    };

    const handleRetreatStage = async(workOrderId: string, currentStage: KanbanStage): Promise<void> => {
        try {
            const currentIndex = KANBAN_STAGES_ORDER.indexOf(currentStage);
            if (currentIndex > 0) {
                const previousStage = KANBAN_STAGES_ORDER[currentIndex - 1];
                
                console.warn(`🔍 DataContext - handleRetreatStage - Retreating from ${currentStage} to ${previousStage}`);
                
                const updateData = {
                    stage: previousStage,
                    updatedAt: new Date(),
                };
                
                await supabaseService.updateWorkOrder(workOrderId, updateData);
                
                // Update local work orders state
                setWorkOrders(prev => prev.map(wo => 
                    wo.id === workOrderId ? { ...wo, stage: previousStage } : wo,
                ));
                
                // Add history entry
                const historyEntry: WorkOrderHistoryEntry = {
                    stage: previousStage,
                    date: new Date().toISOString(),
                    user: 'Sistema', // TODO: Get current user from context
                    notes: `Etapa retrocedida manualmente de ${currentStage} a ${previousStage}`,
                };
                await handleUpdateWorkOrderHistory(workOrderId, historyEntry);
                
            }
        } catch (error) {
            console.error('Error retreating work order stage:', error);
            throw error;
        }
    };

    const handleGetQuoteWithItems = async(quoteId: string): Promise<Quote | null> => {
        try {
            const result = await supabaseService.getQuoteWithItems(quoteId);
            return result;
        } catch (error) {
            console.error('Error getting quote with items:', error);
            return null;
        }
    };

    const handleUpdateAllWorkOrderStages = async(): Promise<{ updated: number; skipped: number; errors: string[] }> => {
        try {
            console.warn('🚀 Iniciando actualización masiva de etapas de órdenes de trabajo...');
            
            // Obtener todas las órdenes de trabajo y cotizaciones frescas de Supabase
            const [allWorkOrders, allQuotes] = await Promise.all([
                supabaseService.getWorkOrders(),
                supabaseService.getQuotes(),
            ]);
            console.warn(`📊 Encontradas ${allWorkOrders.length} órdenes de trabajo y ${allQuotes.length} cotizaciones`);
            
            let updated = 0;
            let skipped = 0;
            const errors: string[] = [];
            
            for (const workOrder of allWorkOrders) {
                try {
                    // Debug: mostrar información de la orden
                    const linkedQuotes = allQuotes.filter(q => workOrder.linkedQuoteIds?.includes(q.id));
                    console.warn(`🔍 OT ${workOrder.id}: stage=${workOrder.stage}, linkedQuotes=${workOrder.linkedQuoteIds?.length || 0}, quotesStatus=${linkedQuotes.map(q => q.status).join(',')}`);
                    
                    const correctStage = determineCorrectStage(workOrder, allQuotes);
                    
                    if (correctStage !== workOrder.stage) {
                        console.warn(`✅ Actualizando OT ${workOrder.id}: ${workOrder.stage} → ${correctStage}`);
                        
                        // Actualizar en Supabase
                        const updateData = {
                            stage: correctStage,
                            updatedAt: new Date().toISOString(),
                        };
                        
                        await supabaseService.updateWorkOrder(workOrder.id, updateData);
                        
                        // Actualizar estado local
                        setWorkOrders(prev => prev.map(wo => 
                            wo.id === workOrder.id ? { ...wo, stage: correctStage as KanbanStage } : wo,
                        ));
                        
                        // Añadir entrada al historial
                        const historyEntry: WorkOrderHistoryEntry = {
                            stage: correctStage,
                            date: new Date().toISOString(),
                            user: 'Sistema',
                            notes: `Etapa corregida automáticamente de ${workOrder.stage} a ${correctStage}`,
                        };
                        await handleUpdateWorkOrderHistory(workOrder.id, historyEntry);
                        
                        updated++;
                    } else {
                        console.warn(`⏭️ Saltando OT ${workOrder.id}: ya está en etapa correcta`);
                        skipped++;
                    }
                } catch (error) {
                    const errorMsg = `Error actualizando OT ${workOrder.id}: ${error}`;
                    console.error(errorMsg);
                    errors.push(errorMsg);
                }
            }
            
            console.warn(`🎉 Actualización completada: ${updated} actualizadas, ${skipped} sin cambios, ${errors.length} errores`);
            
            return { updated, skipped, errors };
            
        } catch (error) {
            console.error('❌ Error en actualización masiva:', error);
            throw error;
        }
    };

    // Función auxiliar para determinar la etapa correcta
    const determineCorrectStage = (workOrder: WorkOrder, allQuotes: Quote[]): KanbanStage => {
        // Si está cancelada, mantener cancelada
        if (workOrder.stage === KanbanStage.CANCELADO || workOrder.status === WorkOrderStatus.CANCELADO) {
            return KanbanStage.CANCELADO;
        }
        
        // Si no tiene diagnóstico, debería estar en RECEPCION
        if (!workOrder.diagnosticData || Object.keys(workOrder.diagnosticData).length === 0) {
            return KanbanStage.RECEPCION;
        }
        
        // Si tiene diagnóstico pero no cotizaciones, debería estar en PENDIENTE_COTIZACION
        if (!workOrder.linkedQuoteIds || workOrder.linkedQuoteIds.length === 0) {
            return KanbanStage.PENDIENTE_COTIZACION;
        }
        
        // Si tiene cotizaciones, verificar su estado
        const linkedQuotes = allQuotes.filter(q => workOrder.linkedQuoteIds?.includes(q.id));
        
        // Si alguna cotización está aprobada, debería estar en EN_REPARACION o posterior
        const hasApprovedQuote = linkedQuotes.some(q => q.status === QuoteStatus.APROBADO);
        const hasRejectedQuote = linkedQuotes.some(q => q.status === QuoteStatus.RECHAZADO);
        const hasSentQuote = linkedQuotes.some(q => q.status === QuoteStatus.ENVIADO);
        
        if (hasApprovedQuote) {
            // Si tiene cotización aprobada, determinar si está en reparación o posterior
            const currentStageIndex = KANBAN_STAGES_ORDER.indexOf(workOrder.stage);
            const enReparacionIndex = KANBAN_STAGES_ORDER.indexOf(KanbanStage.EN_REPARACION);
            
            if (currentStageIndex < enReparacionIndex) {
                return KanbanStage.EN_REPARACION;
            } else {
                return workOrder.stage; // Ya está en etapa correcta o posterior
            }
        } else if (hasRejectedQuote) {
            return KanbanStage.ATENCION_REQUERIDA;
        } else if (hasSentQuote) {
            return KanbanStage.ESPERA_APROBACION;
        } else {
            // Solo cotizaciones en borrador
            return KanbanStage.PENDIENTE_COTIZACION;
        }
    };

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
                    message: `Se te ha asignado una nueva orden de trabajo`,
                    userId: technicianId,
                    isRead: false,
                    timestamp: new Date().toISOString(),
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
                    message: `La orden de trabajo ha sido cancelada: ${reason}`,
                    userId: result.advisorId || '',
                    isRead: false,
                    timestamp: new Date().toISOString(),
                });
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            throw error;
        }
    };

    const handleSaveDiagnostic = async(workOrderId: string, diagnosticData: DiagnosticData, staffIds: { advisorId?: string; mechanicId?: string; }, recommendedItems: QuoteItem[], diagnosticType: DiagnosticType): Promise<void> => {
        try {
            const currentWorkOrder = workOrders.find(wo => wo.id === workOrderId);
            if (!currentWorkOrder) return;

            // Check if diagnostic already exists
            if (currentWorkOrder.diagnosticData) {
                console.warn('Diagnostic already exists for this work order. Updating existing diagnostic.');
            }

            // Add "Diagnóstico" entry to history (only if not already exists)
            const hasDiagnosticHistory = currentWorkOrder.history?.some(entry => entry.stage === 'Diagnóstico');
            let updatedHistory = currentWorkOrder.history || [];
            
            if (!hasDiagnosticHistory) {
                const diagnosticHistoryEntry: WorkOrderHistoryEntry = {
                    stage: 'Diagnóstico',
                    date: new Date().toISOString(),
                    user: 'Sistema',
                    notes: 'Diagnóstico técnico completado',
                };
                updatedHistory = [...updatedHistory, diagnosticHistoryEntry];
            }

            // Only update specific fields to avoid overwriting other data
            const updateData = {
                diagnosticData,
                recommendedItems,
                diagnosticType,
                advisorId: staffIds.advisorId,
                staffMemberId: staffIds.mechanicId,
                history: updatedHistory,
                stage: KanbanStage.DIAGNOSTICO, // Change stage to Diagnostic
                updatedAt: new Date(),
            };
            
            console.warn('🔍 DataContext - handleSaveDiagnostic - updateData:', updateData);
            console.warn('🔍 DataContext - handleSaveDiagnostic - diagnosticData:', diagnosticData);
            
            
            const result = await supabaseService.updateWorkOrder(workOrderId, updateData);
            if (result) {
                setWorkOrders(prev => prev.map(wo => 
                    wo.id === workOrderId ? { ...wo, ...result } : wo,
                ));
                
                // Create notification
                await createNotification({
                    type: 'DIAGNOSTIC_COMPLETED',
                    message: `El diagnóstico ha sido completado para la orden de trabajo`,
                    userId: result.advisorId || '',
                    isRead: false,
                    timestamp: new Date().toISOString(),
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
            if (result && result.workOrderId) {
                setQuotes(prev => prev.map(q => 
                    q.id === quoteId ? result : q,
                ));
                
                // Update linkedQuoteIds for the work order
                const workOrder = workOrders.find(wo => wo.id === result.workOrderId);
                if (workOrder) {
                    const newLinkedQuoteIds = [...new Set([...(workOrder.linkedQuoteIds || []), result.id])];
                    const updateLinkedQuotesData = {
                        linkedQuoteIds: newLinkedQuoteIds,
                        updatedAt: new Date(),
                    };
                    
                    console.warn('🔍 DataContext - handleSaveQuote - Updating linkedQuoteIds:', newLinkedQuoteIds);
                    await supabaseService.updateWorkOrder(result.workOrderId, updateLinkedQuotesData);
                    
                    // Update local work orders state with linkedQuoteIds
                    setWorkOrders(prev => prev.map(wo => 
                        wo.id === result.workOrderId ? { ...wo, linkedQuoteIds: newLinkedQuoteIds } : wo,
                    ));
                }

                // Handle different quote status changes
                if (result.status === QuoteStatus.ENVIADO) {
                    // Quote sent - move to "Esperando Aprobación"
                    const updateData = {
                        stage: KanbanStage.ESPERA_APROBACION,
                        updatedAt: new Date(),
                    };
                    
                    console.warn('🔍 DataContext - handleSaveQuote - Updating work order stage to Esperando Aprobación');
                    await supabaseService.updateWorkOrder(result.workOrderId, updateData);
                    
                    // Update local work orders state
                    setWorkOrders(prev => prev.map(wo => 
                        wo.id === result.workOrderId ? { ...wo, stage: KanbanStage.ESPERA_APROBACION } : wo,
                    ));
                    
                    // Add history entry
                    const historyEntry: WorkOrderHistoryEntry = {
                        stage: 'Esperando Aprobación',
                        date: new Date().toISOString(),
                        user: 'Sistema',
                        notes: `Cotización ${result.id} enviada - Total: $${result.total?.toLocaleString() || '0'}`,
                    };
                    await handleUpdateWorkOrderHistory(result.workOrderId, historyEntry);
                } else if (result.status === QuoteStatus.APROBADO) {
                    // Quote approved - move to "En Reparación"
                    const updateData = {
                        stage: KanbanStage.EN_REPARACION,
                        updatedAt: new Date(),
                    };
                    
                    console.warn('🔍 DataContext - handleSaveQuote - Updating work order stage to En Reparación');
                    await supabaseService.updateWorkOrder(result.workOrderId, updateData);
                    
                    // Update local work orders state
                    setWorkOrders(prev => prev.map(wo => 
                        wo.id === result.workOrderId ? { ...wo, stage: KanbanStage.EN_REPARACION } : wo,
                    ));
                    
                    // Add history entry
                    const historyEntry: WorkOrderHistoryEntry = {
                        stage: 'En Reparación',
                        date: new Date().toISOString(),
                        user: 'Sistema',
                        notes: `Cotización ${result.id} aprobada - Total: $${result.total?.toLocaleString() || '0'}`,
                    };
                    await handleUpdateWorkOrderHistory(result.workOrderId, historyEntry);
                } else if (result.status === QuoteStatus.RECHAZADO) {
                    // Quote rejected - move to "Atención Requerida"
                    const updateData = {
                        stage: KanbanStage.ATENCION_REQUERIDA,
                        updatedAt: new Date(),
                    };
                    
                    console.warn('🔍 DataContext - handleSaveQuote - Updating work order stage to Atención Requerida');
                    await supabaseService.updateWorkOrder(result.workOrderId, updateData);
                    
                    // Update local work orders state
                    setWorkOrders(prev => prev.map(wo => 
                        wo.id === result.workOrderId ? { ...wo, stage: KanbanStage.ATENCION_REQUERIDA } : wo,
                    ));
                    
                    // Add history entry
                    const historyEntry: WorkOrderHistoryEntry = {
                        stage: 'Atención Requerida',
                        date: new Date().toISOString(),
                        user: 'Sistema',
                        notes: `Cotización ${result.id} rechazada - Total: $${result.total?.toLocaleString() || '0'}`,
                    };
                    await handleUpdateWorkOrderHistory(result.workOrderId, historyEntry);
                } else {
                    // Regular quote update
                    const historyEntry: WorkOrderHistoryEntry = {
                        stage: 'Pendiente Cotización',
                        date: new Date().toISOString(),
                        user: 'Sistema',
                        notes: `Cotización actualizada - Total: $${result.total?.toLocaleString() || '0'}`,
                    };
                    await handleUpdateWorkOrderHistory(result.workOrderId, historyEntry);
                }
                
                // Create notification
                await createNotification({
                    type: 'QUOTE_UPDATED',
                    message: `La cotización ha sido actualizada`,
                    userId: result.clientId || '',
                    isRead: false,
                    timestamp: new Date().toISOString(),
                });
            }
        } catch (error) {
            console.error('Error saving quote:', error);
            throw error;
        }
    };

    const handleApproveQuote = async(quoteId: string): Promise<void> => {
        try {
            const result = await supabaseService.updateQuote(quoteId, {
                status: 'APPROVED',
                updatedAt: new Date(),
            });
            
            if (result && result.workOrderId) {
                setQuotes(prev => prev.map(q => 
                    q.id === quoteId ? result : q,
                ));
                
                // Update work order stage to "En Reparación"
                const updateData = {
                    stage: KanbanStage.EN_REPARACION,
                    updatedAt: new Date(),
                };
                
                console.warn('🔍 DataContext - handleApproveQuote - Updating work order stage to En Reparación');
                await supabaseService.updateWorkOrder(result.workOrderId, updateData);
                
                // Update local work orders state
                setWorkOrders(prev => prev.map(wo => 
                    wo.id === result.workOrderId ? { ...wo, stage: KanbanStage.EN_REPARACION } : wo,
                ));
                
                // Add approval entry to work order history
                const approvalHistoryEntry: WorkOrderHistoryEntry = {
                    stage: 'En Reparación',
                    date: new Date().toISOString(),
                    user: 'Sistema',
                    notes: `Cotización aprobada - Total: $${result.total?.toLocaleString() || '0'} - Iniciando reparación`,
                };
                
                await handleUpdateWorkOrderHistory(result.workOrderId, approvalHistoryEntry);
                
                // Create notification
                await createNotification({
                    type: 'QUOTE_APPROVED',
                    message: `La cotización ha sido aprobada`,
                    userId: result.clientId || '',
                    isRead: false,
                    timestamp: new Date().toISOString(),
                });
            }
        } catch (error) {
            console.error('Error approving quote:', error);
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
                    message: `La cotización ha sido rechazada: ${reason}`,
                    userId: result.clientId || '',
                    isRead: false,
                    timestamp: new Date().toISOString(),
                });
            }
        } catch (error) {
            console.error('Error rejecting quote:', error);
            throw error;
        }
    };

    const handleSaveAppSettings = async(settingsData: any): Promise<void> => {
        try {
            
            // If it's just company info (from GeneralSettings), structure it correctly
            if (settingsData.name || settingsData.nit || settingsData.logoUrl) {
                // Map to database field names (using individual columns, not JSONB)
                const dbData = {
                    company_name: settingsData.name || '',
                    company_nit: settingsData.nit || '',
                    company_logo_url: settingsData.logoUrl || '',
                    vat_rate: appSettings.billingSettings?.vatRate || 19,
                    currency_symbol: appSettings.billingSettings?.currencySymbol || '$',
                    default_terms: appSettings.billingSettings?.defaultTerms || 'El pago debe realizarse dentro de los 30 días posteriores a la fecha de la factura.',
                    bank_info: appSettings.billingSettings?.bankInfo || 'Cuenta de Ahorros Bancolombia #123-456789-00 a nombre de Autodealer Taller SAS.',
                };
                
                // Update local state first for immediate UI feedback
                const updatedSettings = {
                    ...appSettings,
                    companyInfo: {
                        name: settingsData.name || '',
                        nit: settingsData.nit || '',
                        logoUrl: settingsData.logoUrl || '',
                    },
                };
                setAppSettings(updatedSettings);
                
                let result;
                
                // If we have an existing ID, update the existing record
                if (appSettings.id) {
                    result = await supabaseService.updateAppSettings({ ...appSettings, ...dbData });
                } else {
                    // If no ID exists, create/update via updateAppSettings which does upsert
                    result = await supabaseService.updateAppSettings({ ...DEFAULT_APP_SETTINGS, ...dbData });
                }
                
                if (result) {
                    // Reload the settings to get the updated data
                    const updatedSettings = await supabaseService.getAppSettings();
                    if (updatedSettings) setAppSettings(updatedSettings);
                }
            } else {
                // If it's a complete settings object (from other tabs)
                // Map to individual columns instead of JSONB
                const dbData = {
                    company_name: settingsData.companyInfo?.name || appSettings.companyInfo?.name || '',
                    company_nit: settingsData.companyInfo?.nit || appSettings.companyInfo?.nit || '',
                    company_logo_url: settingsData.companyInfo?.logoUrl || appSettings.companyInfo?.logoUrl || '',
                    vat_rate: settingsData.billingSettings?.vatRate || appSettings.billingSettings?.vatRate || 19,
                    currency_symbol: settingsData.billingSettings?.currencySymbol || appSettings.billingSettings?.currencySymbol || '$',
                    default_terms: settingsData.billingSettings?.defaultTerms || appSettings.billingSettings?.defaultTerms || 'El pago debe realizarse dentro de los 30 días posteriores a la fecha de la factura.',
                    bank_info: settingsData.billingSettings?.bankInfo || appSettings.billingSettings?.bankInfo || 'Cuenta de Ahorros Bancolombia #123-456789-00 a nombre de Autodealer Taller SAS.',
                    service_categories: settingsData.operationsSettings?.serviceCategories || appSettings.operationsSettings?.serviceCategories || [],
                    inventory_categories: settingsData.operationsSettings?.inventoryCategories || appSettings.operationsSettings?.inventoryCategories || [],
                    diagnostic_settings: settingsData.diagnosticSettings || appSettings.diagnosticSettings || { basic: [], intermediate: [], advanced: [] },
                };
                
                
                // Update local state first
                setAppSettings(settingsData);
                
                let result;
                
                // If we have an existing ID, update the existing record
                if (appSettings.id) {
                    result = await supabaseService.updateAppSettings({ ...appSettings, ...dbData });
                } else {
                    result = await supabaseService.updateAppSettings({ ...DEFAULT_APP_SETTINGS, ...dbData });
                }

                if (result) {
                    const updatedSettings = await supabaseService.getAppSettings();
                    if (updatedSettings) setAppSettings(updatedSettings);
                }
            }
        } catch (error) {
            console.error('Error saving app settings:', error);
            // Revert local state on error
            setAppSettings(appSettings);
            throw error;
        }
    };

    // Service Categories Management
    const handleSaveServiceCategory = async(category: ServiceCategory | Omit<ServiceCategory, 'id'>): Promise<void> => {
        try {
            const currentCategories = appSettings.operationsSettings?.serviceCategories || [];
            const updatedCategories = [...currentCategories];
            let updatedCategory: ServiceCategory;
            
            if ('id' in category) {
                // Update existing category
                const index = updatedCategories.findIndex(c => c.id === category.id);
                if (index !== -1) {
                    updatedCategories[index] = category;
                    updatedCategory = category;
                } else {
                    throw new Error('Category not found');
                }
            } else {
                // Create new category
                updatedCategory = {
                    ...category,
                    id: `sc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                };
                updatedCategories.push(updatedCategory);
            }
            
            // Update local state
            const updatedSettings = {
                ...appSettings,
                operationsSettings: {
                    ...appSettings.operationsSettings,
                    serviceCategories: updatedCategories,
                },
            };
            setAppSettings(updatedSettings);
            
            // Save to Supabase
            if (appSettings.id) {
                await supabaseService.updateAppSettings({ ...appSettings, operationsSettings: updatedSettings.operationsSettings });
            }
            
        } catch (error) {
            console.error('Error saving service category:', error);
            throw error;
        }
    };

    const handleDeleteServiceCategory = async(categoryId: string): Promise<void> => {
        try {
            const currentCategories = appSettings.operationsSettings?.serviceCategories || [];
            const updatedCategories = currentCategories.filter(c => c.id !== categoryId);
            
            const updatedSettings = {
                ...appSettings,
                operationsSettings: {
                    ...appSettings.operationsSettings,
                    serviceCategories: updatedCategories,
                },
            };
            setAppSettings(updatedSettings);
            
            // Save to Supabase
            if (appSettings.id) {
                await supabaseService.updateAppSettings({ ...appSettings, operationsSettings: updatedSettings.operationsSettings });
            }
            
        } catch (error) {
            console.error('Error deleting service category:', error);
            throw error;
        }
    };

    // Inventory Categories Management
    const handleSaveInventoryCategory = async(category: InventoryCategory | Omit<InventoryCategory, 'id'>): Promise<void> => {
        try {
            const currentCategories = appSettings.operationsSettings?.inventoryCategories || [];
            const updatedCategories = [...currentCategories];
            let updatedCategory: InventoryCategory;
            
            if ('id' in category) {
                // Update existing category
                const index = updatedCategories.findIndex(c => c.id === category.id);
                if (index !== -1) {
                    updatedCategories[index] = category;
                    updatedCategory = category;
                } else {
                    throw new Error('Category not found');
                }
            } else {
                // Create new category
                updatedCategory = {
                    ...category,
                    id: `ic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                };
                updatedCategories.push(updatedCategory);
            }
            
            // Update local state
            const updatedSettings = {
                ...appSettings,
                operationsSettings: {
                    ...appSettings.operationsSettings,
                    inventoryCategories: updatedCategories,
                },
            };
            setAppSettings(updatedSettings);
            
            // Save to Supabase
            if (appSettings.id) {
                await supabaseService.updateAppSettings({ ...appSettings, operationsSettings: updatedSettings.operationsSettings });
            }
            
        } catch (error) {
            console.error('Error saving inventory category:', error);
            throw error;
        }
    };

    const handleDeleteInventoryCategory = async(categoryId: string): Promise<void> => {
        try {
            const currentCategories = appSettings.operationsSettings?.inventoryCategories || [];
            const updatedCategories = currentCategories.filter(c => c.id !== categoryId);
            
            const updatedSettings = {
                ...appSettings,
                operationsSettings: {
                    ...appSettings.operationsSettings,
                    inventoryCategories: updatedCategories,
                },
            };
            setAppSettings(updatedSettings);
            
            // Save to Supabase
            if (appSettings.id) {
                await supabaseService.updateAppSettings({ ...appSettings, operationsSettings: updatedSettings.operationsSettings });
            }
            
        } catch (error) {
            console.error('Error deleting inventory category:', error);
            throw error;
        }
    };

    // Staff Management Functions
    const handleUpdateStaffRole = async(staffId: string, newRole: UserRole): Promise<void> => {
        try {
            const result = await supabaseService.updateStaffMember(staffId, { role: newRole });
            if (result) {
                setStaffMembers(prev => prev.map(staff => 
                    staff.id === staffId ? result : staff,
                ));
            }
        } catch (error) {
            console.error('Error updating staff role:', error);
            throw error;
        }
    };

    const handleUpdateStaffPermissions = async(staffId: string, permissions: Permission[]): Promise<void> => {
        try {
            const result = await supabaseService.updateStaffMember(staffId, { permissions });
            if (result) {
                setStaffMembers(prev => prev.map(staff => 
                    staff.id === staffId ? result : staff,
                ));
            }
        } catch (error) {
            console.error('Error updating staff permissions:', error);
            throw error;
        }
    };

    const handleAssignAccountsToUser = async(staffId: string, accountIds: string[]): Promise<void> => {
        try {
            const result = await supabaseService.updateStaffMember(staffId, { assignedAccounts: accountIds });
            if (result) {
                setStaffMembers(prev => prev.map(staff => 
                    staff.id === staffId ? result : staff,
                ));
            }
        } catch (error) {
            console.error('Error assigning accounts to user:', error);
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
                    message: `Se ha reportado un problema imprevisto: ${issue.description}`,
                    userId: workOrder.advisorId || '',
                    isRead: false,
                    timestamp: new Date().toISOString(),
                });
            }
        } catch (error) {
            console.error('Error reporting unforeseen issue:', error);
            throw error;
        }
    };

    const handleRegisterItemCosts = async(workOrderId: string, costs: { itemId: string; costPrice: number; supplierId: string }[]): Promise<void> => {
        try {
            console.warn('🔍 DataContext - handleRegisterItemCosts called');
            console.warn('🔍 DataContext - workOrderId:', workOrderId);
            console.warn('🔍 DataContext - costs:', costs);
            
            let workOrder = workOrders.find(wo => wo.id === workOrderId);
            console.warn('🔍 DataContext - workOrder found:', workOrder);
            
            console.warn('🔍 DataContext - workOrder.linkedQuoteIds:', workOrder?.linkedQuoteIds);
            console.warn('🔍 DataContext - linkedQuoteIds length:', (workOrder?.linkedQuoteIds || []).length);
            
            if (!workOrder) {
                console.warn('❌ DataContext - Work order not found');
                console.warn('No se encontró la orden de trabajo.');
                return;
            }

            // If no linked quotes, try to fix them automatically
            if ((workOrder.linkedQuoteIds || []).length === 0) {
                console.warn('🔧 DataContext - No linked quotes found, attempting to fix...');
                const fixedLinkedQuoteIds = await fixLinkedQuoteIds(workOrderId);
                
                if (fixedLinkedQuoteIds.length === 0) {
                    console.warn('❌ DataContext - Still no linked quotes after fix attempt');
                    console.warn('No se encontraron cotizaciones vinculadas para esta orden de trabajo. Por favor verifica que la cotización esté correctamente asociada.');
                    return;
                }
                
                // Use the fixed quote IDs directly
                workOrder = { ...workOrder, linkedQuoteIds: fixedLinkedQuoteIds };
                console.warn('✅ DataContext - Using fixed linked quote IDs:', fixedLinkedQuoteIds);
            }
            
            const relevantQuoteIds = new Set<string>(workOrder.linkedQuoteIds);
            console.warn('🔍 DataContext - relevantQuoteIds:', relevantQuoteIds);

            for (const quoteId of relevantQuoteIds) {
                const quote = quotes.find(q => q.id === quoteId);
                if (quote) {
                    console.warn('🔍 DataContext - Updating quote:', quoteId);
                    const newItems = quote.items.map(item => {
                        const costInfo = costs.find(c => c.itemId === item.id);
                        if (costInfo) {
                            console.warn(`🔍 DataContext - Updating item ${item.id} with cost ${costInfo.costPrice}`);
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
            
            console.warn('Costos guardados exitosamente.');
        } catch (error) {
            console.error('Error registering item costs:', error);
            console.warn(`Error al guardar los costos: ${error.message}`);
            throw error;
        }
    };

    const fixLinkedQuoteIds = async(workOrderId: string): Promise<string[]> => {
        try {
            console.warn('🔧 DataContext - fixLinkedQuoteIds called for workOrderId:', workOrderId);
            
            const workOrder = workOrders.find(wo => wo.id === workOrderId);
            if (!workOrder) {
                console.warn('❌ DataContext - Work order not found');
                return [];
            }

            // Find all quotes for this work order
            const quotesForWorkOrder = quotes.filter(q => q.workOrderId === workOrderId);
            console.warn('🔧 DataContext - Found quotes for work order:', quotesForWorkOrder.map(q => q.id));

            if (quotesForWorkOrder.length > 0) {
                const newLinkedQuoteIds = quotesForWorkOrder.map(q => q.id);
                const updateData = {
                    linkedQuoteIds: newLinkedQuoteIds,
                    updatedAt: new Date(),
                };

                console.warn('🔧 DataContext - Updating linkedQuoteIds:', newLinkedQuoteIds);
                const updatedWorkOrder = await supabaseService.updateWorkOrder(workOrderId, updateData);
                
                // Update local state with the returned data
                if (updatedWorkOrder) {
                    setWorkOrders(prev => prev.map(wo => 
                        wo.id === workOrderId ? updatedWorkOrder : wo,
                    ));
                }
                
                return newLinkedQuoteIds;
            }
            
            return [];
        } catch (error) {
            console.error('Error fixing linked quote IDs:', error);
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

    const loadAllData = async() => {
        try {
            setIsLoading(true);
            setError(null);
            
            console.warn('🔄 Loading all data from Supabase...');
            
            // Load all data from Supabase
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
                operatingExpensesData,
                invoicesData,
                quotesData,
                purchaseOrdersData,
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
                supabaseService.getOperatingExpenses(),
                supabaseService.getInvoices(),
                supabaseService.getQuotes(),
                supabaseService.getPurchaseOrders(),
                supabaseService.getFinancialAccounts(),
                supabaseService.getAppSettings(),
                supabaseService.getTimeClockEntries(),
                supabaseService.getLoans(),
                supabaseService.getLoanPayments(),
                supabaseService.getNotifications(),
                supabaseService.getAppointments(),
            ]);

            // Set locations
            setLocations(locationsData);
            
            // Set work orders with proper status mapping
            setWorkOrders(workOrdersData.map(wo => ({
                ...wo,
                status: wo.status as WorkOrderStatus,
            })));
            
            // Set clients
            setClients(clientsData);
            
            // Set vehicles
            setVehicles(vehiclesData);
            
            // Set staff members with proper role mapping
            setStaffMembers(staffMembersData.map(sm => ({
                ...sm,
                role: sm.role as UserRole,
            })));
            
            // Set services
            setServices(servicesData);
            
            // Set inventory items
            setInventoryItems(inventoryItemsData);
            
            // Set suppliers
            setSuppliers(suppliersData);
            
            // Set petty cash transactions
            setPettyCashTransactions(pettyCashData);
            
            // Set operating expenses
            setOperatingExpenses(operatingExpensesData);
            
            // Set invoices with proper status mapping
            const mappedInvoices = invoicesData.map(inv => ({
                ...inv,
                status: inv.status as InvoiceStatus,
            }));
            setInvoices(mappedInvoices);
            
            // Set quotes with proper status mapping
            setQuotes(quotesData.map(q => ({
                ...q,
                status: q.status as QuoteStatus,
            })));
            
            // Set purchase orders with proper status mapping
            setPurchaseOrders(purchaseOrdersData.map(po => ({
                ...po,
                status: po.status as PurchaseOrderStatus,
            })));
            
            // Set financial accounts
            setFinancialAccounts(financialAccountsData);
            
            // Set app settings (use first one or default)
            const settings = Array.isArray(appSettingsData) ? (appSettingsData.length > 0 ? appSettingsData[0] : null) : appSettingsData || null;
            if (settings) {
                console.warn('🔧 App settings data from DB:', settings);
                
                // Ensure default categories are initialized if not present
                if (!settings.operationsSettings?.serviceCategories || settings.operationsSettings.serviceCategories.length === 0) {
                    settings.operationsSettings = {
                        ...settings.operationsSettings,
                        serviceCategories: DEFAULT_SERVICE_CATEGORIES,
                    };
                }
                
                if (!settings.operationsSettings?.inventoryCategories || settings.operationsSettings.inventoryCategories.length === 0) {
                    settings.operationsSettings = {
                        ...settings.operationsSettings,
                        inventoryCategories: DEFAULT_INVENTORY_CATEGORIES,
                    };
                }
                
                setAppSettings(settings);
            } else {
                console.warn('⚠️ No app settings found in DB, using default');
                // Ensure default categories are set in default settings
                const defaultSettings = {
                    ...DEFAULT_APP_SETTINGS,
                    operationsSettings: {
                        serviceCategories: DEFAULT_SERVICE_CATEGORIES,
                        inventoryCategories: DEFAULT_INVENTORY_CATEGORIES,
                    },
                };
                setAppSettings(defaultSettings);
            }
            
            // Set time clock entries
            setTimeClockEntries(timeClockData);
            
            // Set loans
            setLoans(loansData);
            
            // Set loan payments
            setLoanPayments(loanPaymentsData);
            
            // Set notifications
            setNotifications(notificationsData);
            
            // Set appointments
            setAppointments(appointmentsData);


        } catch (err) {
            console.error('❌ Error loading data from Supabase:', err);
            setError(err instanceof Error ? err.message : 'Failed to load data');
            
            // Fallback to default data if Supabase fails
            console.warn('🔄 Falling back to default data...');
            
            setLocations(LOCATIONS_DATA);
            setWorkOrders(WORK_ORDERS_DATA);
            setClients(CLIENTS_DATA);
            setVehicles(VEHICLES_DATA);
            setStaffMembers(STAFF_DATA);
            setServices(SERVICES_DATA);
            setInventoryItems(INVENTORY_DATA);
            setSuppliers(SUPPLIERS_DATA);
            setPettyCashTransactions(PETTY_CASH_DATA);
            setOperatingExpenses(OPERATING_EXPENSES_DATA);
            setInvoices(INVOICES_DATA);
            setQuotes(QUOTES_DATA);
            setPurchaseOrders(PURCHASE_ORDERS_DATA);
            setFinancialAccounts(FINANCIAL_ACCOUNTS_DATA);
            setAppSettings(DEFAULT_APP_SETTINGS);
            setTimeClockEntries(TIME_CLOCK_DATA);
            setLoans(LOANS_DATA);
            setLoanPayments(LOAN_PAYMENTS_DATA);
            setNotifications(NOTIFICATIONS_DATA);
            setAppointments(APPOINTMENTS_DATA);
        } finally {
            setIsLoading(false);
        }
    };

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
        handleUpdateWorkOrderDiagnosticType,
        handleUpdateWorkOrderHistory,
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

        handleSaveAppSettings,
        handleSaveServiceCategory,
        handleDeleteServiceCategory,
        handleSaveInventoryCategory,
        handleDeleteInventoryCategory,
        handleUpdateStaffRole,
        handleUpdateStaffPermissions,
        handleAssignAccountsToUser,
        loadAllData,

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
        handleSaveQuote,
        handleApproveQuote,
        handleDeleteQuote,
        handleGetQuoteWithItems,

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

        // Complex operations
        handleAssignTechnician,
        handleCancelOrder,
        handleSaveDiagnostic,
        handleAdvanceStage,
        handleRetreatStage,
        handleRejectQuote,
        handleReportUnforeseenIssue,
        handleUpdateAllWorkOrderStages,
        handleRegisterItemCosts,
        fixLinkedQuoteIds,

        // Utility functions
        calculateDueDate,
        createNotification,
        
        // Update functions
        updateLocation,
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