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
    INVOICES_DATA, QUOTES_DATA, PURCHASE_ORDERS_DATA, OPERATING_EXPENSES_DATA, FINANCIAL_ACCOUNTS_DATA, DEFAULT_SERVICE_CATEGORIES, DEFAULT_INVENTORY_CATEGORIES, TIME_CLOCK_DATA, LOANS_DATA, LOAN_PAYMENTS_DATA, NOTIFICATIONS_DATA,
} from '../constants';
// Datos de citas - DEFINIDOS INLINE
const APPOINTMENTS_DATA: Appointment[] = [
    { id: 'APP-1', clientId: 'C1', clientName: 'Juan Pérez', vehicleId: 'V1', vehicleSummary: 'Chevrolet Spark GT (ABC-123)', serviceRequested: 'Revisión de frenos', appointmentDateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), status: AppointmentStatus.PROGRAMADA, locationId: '550e8400-e29b-41d4-a716-446655440001', advisorId: 'S2' },
    { id: 'APP-2', clientId: 'C2', clientName: 'Ana Gómez', vehicleId: 'V2', vehicleSummary: 'Renault Duster (DEF-456)', serviceRequested: 'Cambio de aceite', appointmentDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), status: AppointmentStatus.CONFIRMADA, locationId: '550e8400-e29b-41d4-a716-446655440002' },
];
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

// DataContext - CLOUDFLARE PAGES FORCE REBUILD
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
        const dayMap: Record<DayOfWeek, number> = {
            'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 
            'Jueves': 4, 'Viernes': 5, 'Sábado': 6
        };
        const targetDay = dayMap[terms.day];
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
                if (Array.isArray(appSettingsData) && appSettingsData.length > 0) {
                    const settings = appSettingsData[0];
                    
                    
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
                console.log('🔄 Falling back to default data...');
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
                
                console.log(`🔍 createUpdater - Creating ${tableName}:`, itemWithId);
                const result = await supabaseService.insert(tableName, itemWithId);
                console.log(`🔍 createUpdater - Result for ${tableName}:`, result);
                if (result) {
                    setter(prev => {
                        const newState = [...prev, result];
                        console.log(`🔍 createUpdater - Updated state for ${tableName}, new count:`, newState.length);
                        return newState;
                    });
                    console.log(`🔍 createUpdater - Updated state for ${tableName}`);
                } else {
                    console.error(`🔍 createUpdater - No result returned for ${tableName}`);
                }
            } catch (error) {
                console.error(`🔍 createUpdater - Error creating ${tableName}:`, error);
                
                // Manejar errores específicos de manera más amigable
                if (error instanceof Error) {
                    if (error.message.includes('duplicate key value violates unique constraint')) {
                        if (tableName === 'vehicles') {
                            alert('❌ Error: Ya existe un vehículo con esta placa. Por favor, usa una placa diferente.');
                        } else if (tableName === 'clients') {
                            alert('❌ Error: Ya existe un cliente con este documento. Por favor, verifica los datos.');
                        } else {
                            alert(`❌ Error: Ya existe un registro con estos datos. Por favor, verifica la información.`);
                        }
                    } else {
                        alert(`❌ Error al crear ${tableName}: ${error.message}`);
                    }
                }
                
                // No re-throw para evitar errores de promesa no manejados
                return;
            }
        };
    };

    const createSaveHandler = <T, >(
        setter: React.Dispatch<React.SetStateAction<T[]>>,
        tableName: string,
    ) => {
        return async(updatedItem: T & { id: string }): Promise<void> => {
            try {
                console.log(`🔍 createSaveHandler - Updating ${tableName}:`, updatedItem);
                const result = await supabaseService.update(tableName, updatedItem.id, updatedItem);
                console.log(`🔍 createSaveHandler - Result for ${tableName}:`, result);
                if (result) {
                    setter(prev => prev.map(item => 
                        (item as any).id === updatedItem.id ? result : item,
                    ));
                    console.log(`🔍 createSaveHandler - Updated state for ${tableName}`);
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
                console.log('Skipping notification: userId is empty');
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

    const handleCreateWorkOrder = async(workOrderData: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkOrder> => {
        try {
            console.log('🔍 Creating work order with data:', {
                clientId: workOrderData.client?.id,
                vehicleId: workOrderData.vehicle?.id,
                locationId: workOrderData.locationId,
                serviceRequested: workOrderData.serviceRequested,
                locationIdType: typeof workOrderData.locationId,
                client: workOrderData.client,
                vehicle: workOrderData.vehicle,
            });
            
            // Validar que los datos del cliente y vehículo estén presentes
            if (!workOrderData.client?.id) {
                throw new Error('Datos del cliente no válidos');
            }
            if (!workOrderData.vehicle?.id) {
                throw new Error('Datos del vehículo no válidos');
            }
            
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
                date: now.toISOString(),
                user: 'Sistema',
                notes: `Orden de trabajo creada para: ${workOrderData.serviceRequested}`,
            };

            const newWorkOrder: WorkOrder = {
                ...workOrderData,
                id: workOrderId,
                status: WorkOrderStatus.EN_PROCESO, // Add default status
                history: [initialHistory], // Initialize with reception entry
                locationId: workOrderData.locationId || '550e8400-e29b-41d4-a716-446655440001', // Fallback to Bogotá if not specified
            };
            
            console.log('🔍 Final work order before insertion:', {
                id: newWorkOrder.id,
                locationId: newWorkOrder.locationId,
                locationIdType: typeof newWorkOrder.locationId,
                originalLocationId: workOrderData.locationId,
            });
            
            await supabaseService.insertWorkOrder(newWorkOrder);
            
            // Obtener el objeto recién insertado de Supabase para asegurar que tenemos todos los datos correctos
            const insertedWorkOrder = await supabaseService.getWorkOrderById(newWorkOrder.id);
            
            if (insertedWorkOrder) {
                setWorkOrders(prev => [...prev, insertedWorkOrder]);
            } else {
                // Fallback: usar el objeto local si no se pudo obtener de Supabase
            setWorkOrders(prev => [...prev, newWorkOrder]);
            }
            
            // Create notification
            await createNotification({
                type: 'WORK_ORDER_CREATED',
                message: `Se ha creado una nueva orden de trabajo: ${workOrderData.serviceRequested}`,
                userId: workOrderData.advisorId || '',
                isRead: false,
                timestamp: new Date().toISOString(),
            });

            return insertedWorkOrder || newWorkOrder;
        } catch (error) {
            console.error('Error creating work order:', error);
            throw error;
        }
    };

    const handleSaveWorkOrder = async(workOrderData: { id: string; serviceRequested: string; advisorId?: string; staffMemberId?: string; comments?: string; }): Promise<void> => {
        try {
            const result = await supabaseService.updateWorkOrder(workOrderData.id, {
                ...workOrderData,
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
            
            console.log(`🔍 DataContext - handleUpdateWorkOrderHistory - Actualizando solo historial para orden ${workOrderId}`);
            console.log(`🔍 DataContext - handleUpdateWorkOrderHistory - NO tocando el stage: ${currentWorkOrder.stage}`);
            
            const result = await supabaseService.updateWorkOrder(workOrderId, {
                history: updatedHistory,
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

    const handlePostProgressUpdate = async(workOrderId: string, update: string, imageFiles?: File[]): Promise<void> => {
        try {
            console.log('🔍 handlePostProgressUpdate - workOrderId:', workOrderId, 'update:', update);
            
            // Crear entrada de historial
            const historyEntry: WorkOrderHistoryEntry = {
                stage: 'En Reparación',
                date: new Date().toISOString(),
                user: 'Sistema',
                notes: update,
            };

            // Si hay imágenes, subirlas
            let imageUrls: string[] = [];
            if (imageFiles && imageFiles.length > 0) {
                console.log('🔍 handlePostProgressUpdate - Subiendo imágenes:', imageFiles.length);
                const uploadPromises = imageFiles.map(async(file, index) => {
                    const fileName = `progress_${workOrderId}_${Date.now()}_${index}.${file.name.split('.').pop()}`;
                    const path = `progress/${workOrderId}/${fileName}`;
                    return await supabaseService.uploadFileToStorage(file, 'progress-updates', path);
                });
                
                const uploadedUrls = await Promise.all(uploadPromises);
                imageUrls = uploadedUrls.filter(url => url !== null) as string[];
                console.log('🔍 handlePostProgressUpdate - URLs subidas:', imageUrls);
            }

            // Actualizar la orden de trabajo
            const result = await supabaseService.updateWorkOrder(workOrderId, {
                history: [...(workOrders.find(wo => wo.id === workOrderId)?.history || []), historyEntry],
            });

            if (result) {
                setWorkOrders(prev => prev.map(wo => 
                    wo.id === workOrderId ? result : wo,
                ));
                console.log('🔍 handlePostProgressUpdate - Actualización exitosa');
            }
        } catch (error) {
            console.error('Error posting progress update:', error);
        }
    };

    const handleToggleTaskCompleted = async(workOrderId: string, itemId: string, isCompleted: boolean, itemImageFiles?: File[]): Promise<void> => {
        try {
            console.log('🔍 handleToggleTaskCompleted - workOrderId:', workOrderId, 'itemId:', itemId, 'isCompleted:', isCompleted, 'itemImageFiles:', itemImageFiles?.length);
            
            // Buscar la orden de trabajo
            const workOrder = workOrders.find(wo => wo.id === workOrderId);
            if (!workOrder) {
                console.warn('Work order not found for ID:', workOrderId);
                return;
            }

            // Buscar la cotización asociada
            const quote = quotes.find(q => q.workOrderId === workOrderId);
            if (!quote) {
                console.warn('Quote not found for work order ID:', workOrderId);
                return;
            }

            let uploadedItemImageUrls: string[] = [];
            if (itemImageFiles && itemImageFiles.length > 0) {
                console.log('🔍 handleToggleTaskCompleted - Subiendo imágenes para el ítem:', itemId, 'Cantidad:', itemImageFiles.length);
                const uploadPromises = itemImageFiles.map(async (file, index) => {
                    const fileName = `task_item_${workOrderId}_${itemId}_${Date.now()}_${index}.${file.name.split('.').pop()}`;
                    const path = `progress-updates/${workOrderId}/${fileName}`;
                    return await supabaseService.uploadFileToStorage(file, 'progress-updates', path);
                });
                uploadedItemImageUrls = (await Promise.all(uploadPromises)).filter(url => url !== null) as string[];
                console.log('🔍 handleToggleTaskCompleted - URLs subidas para el ítem:', uploadedItemImageUrls);
                console.log('🔍 handleToggleTaskCompleted - URLs detalladas:', uploadedItemImageUrls.map((url, index) => ({
                    index,
                    url,
                    length: url.length,
                    startsWithHttps: url.startsWith('https://'),
                    endsWithPng: url.endsWith('.png')
                })));
            }

            // Actualizar el item en la cotización
            const updatedItems = quote.items.map(item =>
                item.id === itemId ? {
                    ...item,
                    isCompleted,
                    imageUrls: [...(item.imageUrls || []), ...uploadedItemImageUrls] // Añadir nuevas URLs
                } : item
            );
            
            console.log('🔍 handleToggleTaskCompleted - Item actualizado:', updatedItems.find(item => item.id === itemId));
            console.log('🔍 handleToggleTaskCompleted - imageUrls del item:', updatedItems.find(item => item.id === itemId)?.imageUrls);

            // Actualizar la cotización
            const result = await supabaseService.updateQuote(quote.id, {
                items: updatedItems,
            });

            if (result) {
                setQuotes(prev => prev.map(q =>
                    q.id === quote.id ? result : q,
                ));
                console.log('🔍 handleToggleTaskCompleted - Tarea y fotos actualizadas exitosamente');
                console.log('🔍 handleToggleTaskCompleted - Resultado de la base de datos:', result);
                console.log('🔍 handleToggleTaskCompleted - imageUrls en el resultado:', result.items.find(item => item.id === itemId)?.imageUrls);
            }
        } catch (error) {
            console.error('Error toggling task completed:', error);
        }
    };

    const handleDeleteWorkOrder = createDeleteHandler(setWorkOrders, 'work_orders');

    const handleRegisterDelivery = async(workOrderId: string, deliveryData: {
        deliveryEvidenceFiles: File[];
        nextMaintenanceDate: string;
        nextMaintenanceMileage: string;
        nextMaintenanceNotes: string;
        customerConfirmed: boolean;
    }): Promise<void> => {
        try {
            console.log('🔍 handleRegisterDelivery - workOrderId:', workOrderId, 'deliveryData:', deliveryData);
            
            // Subir imágenes de evidencia si las hay
            let uploadedImageUrls: string[] = [];
            if (deliveryData.deliveryEvidenceFiles && deliveryData.deliveryEvidenceFiles.length > 0) {
                console.log('🔍 handleRegisterDelivery - Subiendo imágenes de evidencia:', deliveryData.deliveryEvidenceFiles.length);
                const uploadPromises = deliveryData.deliveryEvidenceFiles.map(async (file, index) => {
                    const fileName = `delivery_${workOrderId}_${Date.now()}_${index}.${file.name.split('.').pop()}`;
                    const path = `delivery-evidence/${workOrderId}/${fileName}`;
                    return await supabaseService.uploadFileToStorage(file, 'progress-updates', path);
                });
                uploadedImageUrls = (await Promise.all(uploadPromises)).filter(url => url !== null) as string[];
                console.log('🔍 handleRegisterDelivery - URLs subidas:', uploadedImageUrls);
            }

            // Crear entrada de historial
            const historyEntry: WorkOrderHistoryEntry = {
                stage: 'Entregado',
                date: new Date().toISOString(),
                user: 'Sistema',
                notes: `Vehículo entregado al cliente. Próximo mantenimiento: ${deliveryData.nextMaintenanceDate} (${deliveryData.nextMaintenanceMileage} km). Notas: ${deliveryData.nextMaintenanceNotes}`,
                imageUrls: uploadedImageUrls,
            };

            // Actualizar la orden de trabajo
            const updateData = {
                stage: KanbanStage.ENTREGADO,
                status: WorkOrderStatus.FACTURADO,
                history: [...(workOrders.find(wo => wo.id === workOrderId)?.history || []), historyEntry],
                nextMaintenanceDate: deliveryData.nextMaintenanceDate,
                nextMaintenanceMileage: deliveryData.nextMaintenanceMileage,
                nextMaintenanceNotes: deliveryData.nextMaintenanceNotes,
            };

            const result = await supabaseService.updateWorkOrder(workOrderId, updateData);
            
            if (result) {
                setWorkOrders(prev => prev.map(wo => 
                    wo.id === workOrderId ? result : wo,
                ));
                console.log('✅ handleRegisterDelivery - Entrega registrada exitosamente');
                
                // Forzar refresh de datos para sincronizar frontend
                setTimeout(async () => {
                    await refreshWorkOrders();
                    console.log('✅ handleRegisterDelivery - Datos refrescados después de entrega');
                }, 500);
            }
        } catch (error) {
            console.error('Error registering delivery:', error);
            throw error;
        }
    };

    const handleCreateClient = createUpdater(setClients, 'clients');
    const handleSaveClient = async(clientData: Client | Omit<Client, 'id' | 'vehicleCount' | 'registrationDate'>): Promise<void> => {
        try {
            if ('id' in clientData) {
                // Updating existing client
                console.log(`🔍 handleSaveClient - Updating client:`, clientData);
                const result = await supabaseService.update('clients', clientData.id, clientData);
                if (result) {
                    setClients(prev => prev.map(c => c.id === clientData.id ? result : c));
                }
            } else {
                // Creating new client
                const newClient: Client = {
                    id: crypto.randomUUID(),
                    vehicleCount: 0,
                    registrationDate: new Date().toISOString().split('T')[0],
                    ...clientData
                };
                console.log(`🔍 handleSaveClient - Creating client:`, newClient);
                const result = await supabaseService.insert('clients', newClient);
                if (result) {
                    setClients(prev => [...prev, result]);
                }
            }
        } catch (error) {
            console.error('Error saving client:', error);
            throw error;
        }
    };
    const handleDeleteClient = createDeleteHandler(setClients, 'clients');

    // Función para migrar clientes existentes que no tienen registrationDate
    const migrateClientsRegistrationDate = async (): Promise<void> => {
        try {
            console.log('🔍 MIGRACIÓN - Iniciando migración de registrationDate para clientes...');
            
            const clientsWithoutRegistrationDate = clients.filter(c => !c.registrationDate);
            console.log(`🔍 MIGRACIÓN - Clientes sin registrationDate: ${clientsWithoutRegistrationDate.length}`);
            
            if (clientsWithoutRegistrationDate.length === 0) {
                console.log('✅ MIGRACIÓN - Todos los clientes ya tienen registrationDate');
                return;
            }

            // Usar una fecha por defecto (1 de enero de 2024) para clientes existentes
            const defaultRegistrationDate = '2024-01-01';
            
            for (const client of clientsWithoutRegistrationDate) {
                const updatedClient = {
                    ...client,
                    registrationDate: defaultRegistrationDate
                };
                
                console.log(`🔍 MIGRACIÓN - Actualizando cliente ${client.name} con registrationDate: ${defaultRegistrationDate}`);
                
                const result = await supabaseService.update('clients', client.id, updatedClient);
                if (result) {
                    setClients(prev => prev.map(c => c.id === client.id ? result : c));
                    console.log(`✅ MIGRACIÓN - Cliente ${client.name} actualizado exitosamente`);
                }
            }
            
            console.log('✅ MIGRACIÓN - Migración completada exitosamente');
        } catch (error) {
            console.error('❌ MIGRACIÓN - Error durante la migración:', error);
            throw error;
        }
    };

    const handleCreateVehicle = createUpdater(setVehicles, 'vehicles');
    const handleSaveVehicle = createSaveHandler(setVehicles, 'vehicles');
    const handleDeleteVehicle = createDeleteHandler(setVehicles, 'vehicles');

    const handleCreateStaffMember = createUpdater(setStaffMembers, 'staff_members');
    const handleSaveStaffMember = createSaveHandler(setStaffMembers, 'staff_members');
    const handleDeleteStaffMember = createDeleteHandler(setStaffMembers, 'staff_members');

    const handleCreateService = createUpdater(setServices, 'services');
    const handleSaveService = async(serviceData: Service | Omit<Service, 'id'>): Promise<Service> => {
        try {
            console.log(`🔍 handleSaveService - Updating service:`, serviceData);
            const serviceId = 'id' in serviceData ? serviceData.id : crypto.randomUUID();
            const result = await supabaseService.updateService(serviceId, serviceData);
            console.log(`🔍 handleSaveService - Result:`, result);
            if (result) {
                setServices(prev => prev.map(service => 
                    service.id === serviceId ? result : service,
                ));
                console.log(`🔍 handleSaveService - Updated state for services`);
                return result;
            } else {
                console.error(`🔍 handleSaveService - No result returned`);
                throw new Error('No result returned from service update');
            }
        } catch (error) {
            console.error(`🔍 handleSaveService - Error updating service:`, error);
            throw error;
        }
    };
    const handleDeleteService = createDeleteHandler(setServices, 'services');

    const handleCreateInventoryItem = createUpdater(setInventoryItems, 'inventory_items');
    const handleSaveInventoryItem = async(itemData: InventoryItem | Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
        try {
            const itemId = 'id' in itemData ? itemData.id : crypto.randomUUID();
            const result = await supabaseService.updateInventoryItem(itemId, itemData);
            if (result) {
                setInventoryItems(prev => prev.map(item => 
                    item.id === itemId ? result : item,
                ));
                return result;
            } else {
                throw new Error('No result returned from inventory item update');
            }
        } catch (error) {
            console.error('Error updating inventory item:', error);
            throw error;
        }
    };
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
                // Supabase insert devuelve un objeto, no un array
                const createdQuote = result;
                if (!createdQuote || !createdQuote.id) {
                    console.error('Error: createdQuote no tiene id:', createdQuote);
                    return null;
                }
                
                console.log('🔍 DataContext - handleCreateQuote - createdQuote after validation:', createdQuote);
                
                // Update linkedQuoteIds for the work order
                const workOrder = workOrders.find(wo => wo.id === quoteData.workOrderId);
                const newLinkedQuoteIds = workOrder ? [...new Set([...(workOrder.linkedQuoteIds || []), createdQuote.id])] : [createdQuote.id];
                
                // Update local work orders state with linkedQuoteIds
                setWorkOrders(prev => prev.map(wo => 
                    wo.id === quoteData.workOrderId ? { ...wo, linkedQuoteIds: newLinkedQuoteIds } : wo,
                ));
                
                // If quote status is ENVIADO, update work order stage to "Esperando Aprobación"
                // If quote status is BORRADOR, keep current stage (Pendiente Cotización)
                console.log('🔍 DataContext - handleCreateQuote - createdQuote:', createdQuote);
                console.log('🔍 DataContext - handleCreateQuote - createdQuote.status:', createdQuote.status);
                console.log('🔍 DataContext - handleCreateQuote - QuoteStatus.ENVIADO:', QuoteStatus.ENVIADO);
                console.log('🔍 DataContext - handleCreateQuote - comparison result:', createdQuote.status === QuoteStatus.ENVIADO);
                console.log('🔍 DataContext - handleCreateQuote - typeof createdQuote.status:', typeof createdQuote.status);
                console.log('🔍 DataContext - handleCreateQuote - typeof QuoteStatus.ENVIADO:', typeof QuoteStatus.ENVIADO);
                console.log('🔍 DataContext - handleCreateQuote - JSON.stringify(createdQuote.status):', JSON.stringify(createdQuote.status));
                console.log('🔍 DataContext - handleCreateQuote - JSON.stringify(QuoteStatus.ENVIADO):', JSON.stringify(QuoteStatus.ENVIADO));
                
                if (createdQuote.status === QuoteStatus.ENVIADO) {
                const updateData = {
                        stage: KanbanStage.ESPERA_APROBACION,
                        linkedQuoteIds: newLinkedQuoteIds,
                };
                
                    console.log('🔍 DataContext - handleCreateQuote - Updating work order stage to Esperando Aprobación');
                await supabaseService.updateWorkOrder(quoteData.workOrderId, updateData);
                
                // Update local work orders state
                setWorkOrders(prev => prev.map(wo => 
                        wo.id === quoteData.workOrderId ? { ...wo, stage: KanbanStage.ESPERA_APROBACION, linkedQuoteIds: newLinkedQuoteIds } : wo,
                ));
                
                // Add history entry
                const historyEntry: WorkOrderHistoryEntry = {
                        stage: 'Esperando Aprobación',
                    date: new Date().toISOString(),
                    user: 'Sistema',
                        notes: `Cotización ${createdQuote.id} enviada - Total: $${quoteData.total?.toLocaleString() || '0'}`,
                };
                await handleUpdateWorkOrderHistory(quoteData.workOrderId, historyEntry);
                } else {
                    // For BORRADOR status, just update linkedQuoteIds without changing stage
                    const updateData = {
                        linkedQuoteIds: newLinkedQuoteIds,
                    };
                    
                    console.log('🔍 DataContext - handleCreateQuote - Updating linkedQuoteIds for draft quote');
                    await supabaseService.updateWorkOrder(quoteData.workOrderId, updateData);
                }
                
                // Actualizar estado local de quotes
                setQuotes(prev => [...prev, createdQuote]);
                
                // Esperar un momento para que Supabase procese la actualización completamente
                console.log('🔄 handleCreateQuote: Esperando a que Supabase procese la actualización...');
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Refrescar solo órdenes de trabajo para optimizar rendimiento
                console.log('🔄 handleCreateQuote: Refrescando órdenes de trabajo después de crear cotización...');
                await refreshWorkOrders();
            }
            return result || null;
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
                
                
                const updateData = {
                    stage: nextStage,
                };
                
                
                const result = await supabaseService.updateWorkOrder(workOrderId, updateData);
                if (result) {
                    // Update local work orders state
                    setWorkOrders(prev => prev.map(wo => 
                        wo.id === workOrderId ? { ...wo, stage: nextStage } : wo,
                    ));
                } else {
                    console.error('Error al actualizar etapa de la orden de trabajo');
                }
                
                // Add history entry
                let historyEntry: WorkOrderHistoryEntry;
                
                // Si se está avanzando desde Control de Calidad, crear una entrada especial
                console.log('🔍 DataContext - handleAdvanceStage - Checking stage transition:', { currentStage, nextStage });
                if (currentStage === 'Control de Calidad' && nextStage === 'Listo para Entrega') {
                    console.log('🔍 DataContext - handleAdvanceStage - Creating special quality control entry');
                    historyEntry = {
                        stage: nextStage,
                        date: new Date().toISOString(),
                        user: 'Sistema',
                        notes: `Control de Calidad APROBADO por Sistema. Etapa avanzada manualmente sin completar checklist detallado.`,
                        // Crear datos de checklist por defecto (todos OK) para mantener consistencia
                        qualityChecksData: [
                            // Exterior
                            { id: 'exterior-1', description: 'No hay manchas de grasa en tapicería o latonería', category: 'exterior', status: 'ok' },
                            { id: 'exterior-2', description: 'Se retiraron plásticos protectores de asientos/volante', category: 'exterior', status: 'ok' },
                            { id: 'exterior-3', description: 'Los elementos personales del cliente están en su lugar', category: 'exterior', status: 'ok' },
                            // Funcionalidad
                            { id: 'func-1', description: 'El vehículo enciende correctamente', category: 'funcionalidad', status: 'ok' },
                            { id: 'func-2', description: 'No hay luces de advertencia en el tablero', category: 'funcionalidad', status: 'ok' },
                            { id: 'func-3', description: 'El motor funciona sin ruidos anormales', category: 'funcionalidad', status: 'ok' },
                            { id: 'func-4', description: 'Se realizó prueba de ruta y el manejo es correcto', category: 'funcionalidad', status: 'ok' },
                            { id: 'func-5', description: 'El sistema de A/C y calefacción funciona', category: 'funcionalidad', status: 'ok' },
                            { id: 'func-6', description: 'Los frenos responden adecuadamente', category: 'funcionalidad', status: 'ok' },
                            // Verificación
                            { id: 'verif-1', description: 'Se completaron todos los trabajos aprobados en la cotización', category: 'verificacion', status: 'ok' },
                            { id: 'verif-2', description: 'Los repuestos reemplazados están guardados para el cliente (si aplica)', category: 'verificacion', status: 'ok' },
                            { id: 'verif-3', description: 'Se verificaron los niveles de fluidos (aceite, refrigerante, frenos)', category: 'verificacion', status: 'ok' },
                            { id: 'verif-4', description: 'Se ajustó la presión de los neumáticos', category: 'verificacion', status: 'ok' },
                            // Documentación
                            { id: 'doc-1', description: 'La factura corresponde con los trabajos realizados', category: 'documentacion', status: 'ok' },
                            { id: 'doc-2', description: 'La orden de trabajo está completamente documentada', category: 'documentacion', status: 'ok' },
                            { id: 'doc-3', description: 'Se ha preparado la recomendación de próximo mantenimiento', category: 'documentacion', status: 'ok' }
                        ],
                        checklistSummary: 'exterior-1:ok|exterior-2:ok|exterior-3:ok|func-1:ok|func-2:ok|func-3:ok|func-4:ok|func-5:ok|func-6:ok|verif-1:ok|verif-2:ok|verif-3:ok|verif-4:ok|doc-1:ok|doc-2:ok|doc-3:ok'
                    };
    } else if (nextStage === 'Control de Calidad') {
        // Si se avanza a Control de Calidad, NO crear datos de checklist por defecto
        // Solo marcar que está listo para control de calidad
        console.log('🔍 DataContext - handleAdvanceStage - Advancing to Quality Control stage');
        historyEntry = {
            stage: nextStage,
            date: new Date().toISOString(),
            user: 'Sistema',
            notes: `Etapa avanzada manualmente de ${currentStage} a ${nextStage}. Listo para control de calidad.`,
        };
                } else {
                    historyEntry = {
                        stage: nextStage,
                        date: new Date().toISOString(),
                        user: 'Sistema', // TODO: Get current user from context
                        notes: `Etapa avanzada manualmente de ${currentStage} a ${nextStage}`,
                    };
                }
                
                await handleUpdateWorkOrderHistory(workOrderId, historyEntry);
                console.log('🔍 DataContext - handleAdvanceStage - History entry saved:', historyEntry);
                
                // Esperar un momento para que Supabase procese la actualización completamente
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Refrescar solo órdenes de trabajo para optimizar rendimiento
                await refreshWorkOrders();
                
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
                
                console.log(`🔍 DataContext - handleRetreatStage - Retreating from ${currentStage} to ${previousStage}`);
                
                const updateData = {
                    stage: previousStage,
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
                
                // Esperar un momento para que Supabase procese la actualización completamente
                console.log('🔄 handleRetreatStage: Esperando a que Supabase procese la actualización...');
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Refrescar solo órdenes de trabajo para optimizar rendimiento
                console.log('🔄 handleRetreatStage: Refrescando órdenes de trabajo después de retroceder etapa...');
                await refreshWorkOrders();
                
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
            console.log('🚀 Iniciando actualización masiva de etapas de órdenes de trabajo...');
            
            // Obtener todas las órdenes de trabajo y cotizaciones frescas de Supabase
            const [allWorkOrders, allQuotes] = await Promise.all([
                supabaseService.getWorkOrders(),
                supabaseService.getQuotes(),
            ]);
            console.log(`📊 Encontradas ${allWorkOrders.length} órdenes de trabajo y ${allQuotes.length} cotizaciones`);
            
            let updated = 0;
            let skipped = 0;
            const errors: string[] = [];
            
            for (const workOrder of allWorkOrders) {
                try {
                    // Debug: mostrar información de la orden
                    const linkedQuotes = allQuotes.filter(q => workOrder.linkedQuoteIds?.includes(q.id));
                    console.log(`🔍 OT ${workOrder.id}: stage=${workOrder.stage}, linkedQuotes=${workOrder.linkedQuoteIds?.length || 0}, quotesStatus=${linkedQuotes.map(q => q.status).join(',')}`);
                    
                    const correctStage = determineCorrectStage(workOrder, allQuotes);
                    
                    if (correctStage !== workOrder.stage) {
                        console.log(`✅ Actualizando OT ${workOrder.id}: ${workOrder.stage} → ${correctStage}`);
                        
                        // Actualizar en Supabase
                        const updateData = {
                            stage: correctStage,
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
                        console.log(`⏭️ Saltando OT ${workOrder.id}: ya está en etapa correcta`);
                        skipped++;
                    }
                } catch (error) {
                    const errorMsg = `Error actualizando OT ${workOrder.id}: ${error}`;
                    console.error(errorMsg);
                    errors.push(errorMsg);
                }
            }
            
            console.log(`🎉 Actualización completada: ${updated} actualizadas, ${skipped} sin cambios, ${errors.length} errores`);
            
            return { updated, skipped, errors };
            
        } catch (error) {
            console.error('❌ Error en actualización masiva:', error);
            throw error;
        }
    };

    // Función para restaurar órdenes que se marcaron incorrectamente como completadas
    const handleRestoreIncorrectlyCompletedOrders = async(): Promise<{ restored: number; errors: string[] }> => {
        try {
            console.log('🔧 Iniciando restauración de órdenes marcadas incorrectamente como completadas...');
            
            // Obtener todas las órdenes de trabajo y cotizaciones frescas de Supabase
            const [allWorkOrders, allQuotes] = await Promise.all([
                supabaseService.getWorkOrders(),
                supabaseService.getQuotes(),
            ]);
            
            let restored = 0;
            const errors: string[] = [];
            
            // Buscar órdenes que están marcadas como ENTREGADO pero no deberían estarlo
            const incorrectlyCompletedOrders = allWorkOrders.filter(workOrder => {
                if (workOrder.stage !== KanbanStage.ENTREGADO) return false;
                
                // Verificar si realmente debería estar completada
                const correctStage = determineCorrectStage(workOrder, allQuotes);
                return correctStage !== KanbanStage.ENTREGADO;
            });
            
            console.log(`🔍 Encontradas ${incorrectlyCompletedOrders.length} órdenes marcadas incorrectamente como completadas`);
            
            for (const workOrder of incorrectlyCompletedOrders) {
                try {
                    const correctStage = determineCorrectStage(workOrder, allQuotes);
                    console.log(`🔧 Restaurando OT ${workOrder.id}: ${workOrder.stage} → ${correctStage}`);
                    
                    // Actualizar en Supabase
                    const updateData = {
                        stage: correctStage,
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
                        notes: `Orden restaurada de ENTREGADO a ${correctStage} - Error de actualización masiva corregido`,
                    };
                    await handleUpdateWorkOrderHistory(workOrder.id, historyEntry);
                    
                    restored++;
                } catch (error) {
                    const errorMsg = `Error restaurando OT ${workOrder.id}: ${error}`;
                    console.error(errorMsg);
                    errors.push(errorMsg);
                }
            }
            
            console.log(`🎉 Restauración completada: ${restored} órdenes restauradas, ${errors.length} errores`);
            
            return { restored, errors };
            
        } catch (error) {
            console.error('❌ Error en restauración:', error);
            throw error;
        }
    };

    // Fix orders with quotes but wrong stage function
    const handleFixOrdersWithQuoteStageMismatch = async(): Promise<{ fixed: number; errors: string[] }> => {
        const errors: string[] = [];
        let fixed = 0;

        try {
            console.log('🔍 Checking for orders with quote stage mismatches...');

            for (const workOrder of workOrders) {
                try {
                    // Skip if already completed
                    if (workOrder.stage === KanbanStage.ENTREGADO) continue;

                    // Get all quotes for this work order
                    const orderQuotes = quotes.filter(q => 
                        q.workOrderId === workOrder.id || 
                        (workOrder.linkedQuoteIds && workOrder.linkedQuoteIds.includes(q.id)),
                    );

                    if (orderQuotes.length === 0) continue; // No quotes for this order

                    // Check if there are sent quotes (ENVIADO)
                    const sentQuotes = orderQuotes.filter(q => q.status === QuoteStatus.ENVIADO);
                    const approvedQuotes = orderQuotes.filter(q => q.status === QuoteStatus.APROBADO);
                    const rejectedQuotes = orderQuotes.filter(q => q.status === QuoteStatus.RECHAZADO);

                    let correctStage = workOrder.stage;
                    let needsUpdate = false;
                    let updateReason = '';

                    // Determine correct stage based on quote status
                    if (approvedQuotes.length > 0) {
                        // Has approved quotes - should be in EN_REPARACION or later
                        if (workOrder.stage === KanbanStage.PENDIENTE_COTIZACION || 
                            workOrder.stage === KanbanStage.ESPERA_APROBACION) {
                            correctStage = KanbanStage.EN_REPARACION;
                            needsUpdate = true;
                            updateReason = `Cotización aprobada - debe estar en En Reparación`;
                        }
                    } else if (rejectedQuotes.length > 0) {
                        // Has rejected quotes - should be in ATENCION_REQUERIDA
                        if (workOrder.stage !== KanbanStage.ATENCION_REQUERIDA) {
                            correctStage = KanbanStage.ATENCION_REQUERIDA;
                            needsUpdate = true;
                            updateReason = `Cotización rechazada - debe estar en Atención Requerida`;
                        }
                    } else if (sentQuotes.length > 0) {
                        // Has sent quotes - should be in ESPERA_APROBACION
                        if (workOrder.stage === KanbanStage.PENDIENTE_COTIZACION || 
                            workOrder.stage === KanbanStage.DIAGNOSTICO) {
                            correctStage = KanbanStage.ESPERA_APROBACION;
                            needsUpdate = true;
                            updateReason = `Cotización enviada - debe estar en Espera Aprobación`;
                        }
                    }

                    if (needsUpdate) {
                        console.log(`🔧 Fixing order ${workOrder.id}: ${workOrder.stage} → ${correctStage} (${updateReason})`);
                        
                        // Update linkedQuoteIds if missing
                        const missingQuoteIds = orderQuotes
                            .filter(q => !workOrder.linkedQuoteIds?.includes(q.id))
                            .map(q => q.id);
                        
                        const newLinkedQuoteIds = [...new Set([
                            ...(workOrder.linkedQuoteIds || []),
                            ...missingQuoteIds,
                        ])];

                        const updateData = {
                            stage: correctStage,
                            linkedQuoteIds: newLinkedQuoteIds,
                        };

                        await supabaseService.updateWorkOrder(workOrder.id, updateData);
                        
                        // Update local state
                        setWorkOrders(prev => prev.map(wo => 
                            wo.id === workOrder.id ? { 
                                ...wo, 
                                stage: correctStage, 
                                linkedQuoteIds: newLinkedQuoteIds, 
                            } : wo,
                        ));

                        // Add history entry
                        const historyEntry: WorkOrderHistoryEntry = {
                            stage: correctStage,
                            date: new Date().toISOString(),
                            user: 'Sistema',
                            notes: updateReason,
                        };
                        await handleUpdateWorkOrderHistory(workOrder.id, historyEntry);
                        
                        fixed++;
                    }
                } catch (error) {
                    const errorMsg = `Error fixing order ${workOrder.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    console.error(errorMsg);
                    errors.push(errorMsg);
                }
            }

            console.log(`✅ Successfully fixed ${fixed} orders with quote stage mismatches`);
            
            // Refresh data
            await loadAllData();
            
        } catch (error) {
            const errorMsg = `Error during fix process: ${error instanceof Error ? error.message : 'Unknown error'}`;
            console.error(errorMsg);
            errors.push(errorMsg);
        }

        return { fixed, errors };
    };

    // Función específica para corregir la orden #0068
    const handleFixSpecificOrder = async(workOrderId: string): Promise<{ success: boolean; message: string }> => {
        try {
            console.log(`🔧 Fixing specific order ${workOrderId}...`);
            
            // Obtener datos frescos de Supabase
            const [allWorkOrders, allQuotes] = await Promise.all([
                supabaseService.getWorkOrders(),
                supabaseService.getQuotes(),
            ]);
            
            const workOrder = allWorkOrders.find(wo => wo.id === workOrderId);
            if (!workOrder) {
                return { success: false, message: `Orden ${workOrderId} no encontrada` };
            }
            
            // Buscar cotizaciones para esta orden
            const orderQuotes = allQuotes.filter(q => 
                q.workOrderId === workOrderId || 
                (workOrder.linkedQuoteIds && workOrder.linkedQuoteIds.includes(q.id)),
            );
            
            console.log(`🔍 Orden ${workOrderId}: stage=${workOrder.stage}, quotes=${orderQuotes.length}, status=${orderQuotes.map(q => q.status).join(',')}`);
            
            if (orderQuotes.length === 0) {
                return { success: false, message: `No se encontraron cotizaciones para la orden ${workOrderId}` };
            }
            
            // Verificar si hay cotizaciones enviadas
            const sentQuotes = orderQuotes.filter(q => q.status === QuoteStatus.ENVIADO);
            const approvedQuotes = orderQuotes.filter(q => q.status === QuoteStatus.APROBADO);
            const rejectedQuotes = orderQuotes.filter(q => q.status === QuoteStatus.RECHAZADO);
            
            let correctStage = workOrder.stage;
            let updateReason = '';
            
            if (approvedQuotes.length > 0) {
                correctStage = KanbanStage.EN_REPARACION;
                updateReason = `Cotización aprobada - debe estar en En Reparación`;
            } else if (rejectedQuotes.length > 0) {
                correctStage = KanbanStage.ATENCION_REQUERIDA;
                updateReason = `Cotización rechazada - debe estar en Atención Requerida`;
            } else if (sentQuotes.length > 0) {
                correctStage = KanbanStage.ESPERA_APROBACION;
                updateReason = `Cotización enviada - debe estar en Espera Aprobación`;
            } else {
                correctStage = KanbanStage.PENDIENTE_COTIZACION;
                updateReason = `Solo cotizaciones en borrador - debe estar en Pendiente Cotización`;
            }
            
            if (correctStage !== workOrder.stage) {
                console.log(`🔧 Actualizando orden ${workOrderId}: ${workOrder.stage} → ${correctStage}`);
                
                // Actualizar linkedQuoteIds si faltan
                const missingQuoteIds = orderQuotes
                    .filter(q => !workOrder.linkedQuoteIds?.includes(q.id))
                    .map(q => q.id);
                
                const newLinkedQuoteIds = [...new Set([
                    ...(workOrder.linkedQuoteIds || []),
                    ...missingQuoteIds,
                ])];
                
                const updateData = {
                    stage: correctStage,
                    linkedQuoteIds: newLinkedQuoteIds,
                };
                
                await supabaseService.updateWorkOrder(workOrderId, updateData);
                
                // Actualizar estado local
                setWorkOrders(prev => prev.map(wo => 
                    wo.id === workOrderId ? { 
                        ...wo, 
                        stage: correctStage, 
                        linkedQuoteIds: newLinkedQuoteIds, 
                    } : wo,
                ));
                
                // Añadir entrada al historial
                const historyEntry: WorkOrderHistoryEntry = {
                    stage: correctStage,
                    date: new Date().toISOString(),
                    user: 'Sistema',
                    notes: updateReason,
                };
                await handleUpdateWorkOrderHistory(workOrderId, historyEntry);
                
                return { 
                    success: true, 
                    message: `Orden ${workOrderId} actualizada de ${workOrder.stage} a ${correctStage}`, 
                };
            } else {
                return { 
                    success: true, 
                    message: `Orden ${workOrderId} ya está en la etapa correcta: ${workOrder.stage}`, 
                };
            }
            
        } catch (error) {
            console.error(`Error fixing order ${workOrderId}:`, error);
            return { 
                success: false, 
                message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
            };
        }
    };

    // Función auxiliar para determinar la etapa correcta
    const determineCorrectStage = (workOrder: WorkOrder, allQuotes: Quote[]): KanbanStage => {
        // Si está cancelada, mantener cancelada
        if (workOrder.stage === KanbanStage.CANCELADO || workOrder.status === WorkOrderStatus.CANCELADO) {
            return KanbanStage.CANCELADO;
        }
        
        // ⚠️ PROTECCIÓN CRÍTICA: NO tocar órdenes que ya están completadas
        if (workOrder.stage === KanbanStage.ENTREGADO) {
            console.log(`🛡️ Protegiendo OT ${workOrder.id}: ya está ENTREGADO, no tocar`);
            return workOrder.stage;
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
        
        // Si alguna cotización está aprobada, rechazada o enviada
        const hasApprovedQuote = linkedQuotes.some(q => q.status === QuoteStatus.APROBADO);
        const hasRejectedQuote = linkedQuotes.some(q => q.status === QuoteStatus.RECHAZADO);
        const hasSentQuote = linkedQuotes.some(q => q.status === QuoteStatus.ENVIADO);
        
        if (hasApprovedQuote) {
            // Si tiene cotización aprobada, debe estar al menos en EN_REPARACION
            const currentStageIndex = KANBAN_STAGES_ORDER.indexOf(workOrder.stage);
            const enReparacionIndex = KANBAN_STAGES_ORDER.indexOf(KanbanStage.EN_REPARACION);
            
            // Solo avanzar si está en una etapa anterior a EN_REPARACION
            if (currentStageIndex < enReparacionIndex) {
                console.log(`✅ OT ${workOrder.id}: Avanzando de ${workOrder.stage} a EN_REPARACION (cotización aprobada)`);
                return KanbanStage.EN_REPARACION;
            } else {
                console.log(`🛡️ OT ${workOrder.id}: Manteniendo ${workOrder.stage} (ya en etapa correcta o posterior)`);
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
    const handleSaveAppointment = async(appointmentData: Appointment | Omit<Appointment, 'id'>): Promise<void> => {
        try {
            if ('id' in appointmentData) {
                // Updating existing appointment
                console.log(`🔍 handleSaveAppointment - Updating appointment:`, appointmentData);
                const result = await supabaseService.update('appointments', appointmentData.id, appointmentData);
                if (result) {
                    setAppointments(prev => prev.map(a => a.id === appointmentData.id ? result : a));
                }
            } else {
                // Creating new appointment
                const newAppointment: Appointment = {
                    id: crypto.randomUUID(),
                    ...appointmentData
                };
                console.log(`🔍 handleSaveAppointment - Creating appointment:`, newAppointment);
                const result = await supabaseService.insert('appointments', newAppointment);
                if (result) {
                    setAppointments(prev => [...prev, result]);
                }
            }
        } catch (error) {
            console.error('Error saving appointment:', error);
            throw error;
        }
    };
    const handleDeleteAppointment = createDeleteHandler(setAppointments, 'appointments');

    const handleConfirmAppointment = async(appointmentId: string): Promise<void> => {
        try {
            console.log(`🔍 handleConfirmAppointment - Confirming appointment:`, appointmentId);
            const result = await supabaseService.update('appointments', appointmentId, {
                status: AppointmentStatus.CONFIRMADA
            });
            if (result) {
                setAppointments(prev => prev.map(a => a.id === appointmentId ? result : a));
                console.log(`🔍 handleConfirmAppointment - Appointment confirmed successfully`);
            }
        } catch (error) {
            console.error('Error confirming appointment:', error);
            throw error;
        }
    };

    const handleCancelAppointment = async(appointmentId: string): Promise<void> => {
        try {
            console.log(`🔍 handleCancelAppointment - Cancelling appointment:`, appointmentId);
            const result = await supabaseService.update('appointments', appointmentId, {
                status: AppointmentStatus.CANCELADA
            });
            if (result) {
                setAppointments(prev => prev.map(a => a.id === appointmentId ? result : a));
                console.log(`🔍 handleCancelAppointment - Appointment cancelled successfully`);
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            throw error;
        }
    };

    const handleRescheduleAppointment = async(appointmentId: string, newDateTime: string): Promise<void> => {
        try {
            console.log(`🔍 handleRescheduleAppointment - Rescheduling appointment:`, appointmentId, 'to:', newDateTime);
            const result = await supabaseService.update('appointments', appointmentId, {
                appointmentDateTime: newDateTime
            });
            if (result) {
                setAppointments(prev => prev.map(a => a.id === appointmentId ? result : a));
                console.log(`🔍 handleRescheduleAppointment - Appointment rescheduled successfully`);
            }
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            throw error;
        }
    };

    // Complex operations
    const handleAssignTechnician = async(workOrderId: string, technicianId: string): Promise<void> => {
        try {
            const result = await supabaseService.updateWorkOrder(workOrderId, {
                // assignedTechnicianId no existe en la interfaz WorkOrder
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
                status: WorkOrderStatus.CANCELADO,
                // cancellationReason no existe en la interfaz WorkOrder
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
                
                // Esperar un momento para que Supabase procese la actualización completamente
                console.log('🔄 handleCancelOrder: Esperando a que Supabase procese la actualización...');
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Refrescar solo órdenes de trabajo para optimizar rendimiento
                console.log('🔄 handleCancelOrder: Refrescando órdenes de trabajo después de cancelar orden...');
                await refreshWorkOrders();
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

            // Add "Pendiente Cotización" entry to history (only if not already exists)
            const hasPendingQuoteHistory = currentWorkOrder.history?.some(entry => entry.stage === 'Pendiente Cotización');
            let updatedHistory = currentWorkOrder.history || [];
            
            if (!hasPendingQuoteHistory) {
                const pendingQuoteHistoryEntry: WorkOrderHistoryEntry = {
                    stage: 'Pendiente Cotización',
                    date: new Date().toISOString(),
                    user: 'Sistema',
                    notes: 'Diagnóstico completado - Listo para cotizar',
                };
                updatedHistory = [...updatedHistory, pendingQuoteHistoryEntry];
            }

            // Only update specific fields to avoid overwriting other data
            const updateData = {
                diagnosticData,
                recommendedItems,
                diagnosticType,
                advisorId: staffIds.advisorId,
                staffMemberId: staffIds.mechanicId,
                history: updatedHistory,
                stage: KanbanStage.PENDIENTE_COTIZACION, // Avanza automáticamente a Pendiente Cotización
            };
            
            console.log('🔍 DataContext - handleSaveDiagnostic - updateData:', updateData);
            console.log('🔍 DataContext - handleSaveDiagnostic - diagnosticData:', diagnosticData);
            
            
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
                
                // Esperar un momento para que Supabase procese la actualización completamente
                console.log('🔄 handleSaveDiagnostic: Esperando a que Supabase procese la actualización...');
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Refrescar solo órdenes de trabajo para optimizar rendimiento
                console.log('🔄 handleSaveDiagnostic: Refrescando órdenes de trabajo después de completar diagnóstico...');
                await refreshWorkOrders();
            }
        } catch (error) {
            console.error('Error saving diagnostic:', error);
            throw error;
        }
    };

    const handleSaveQuote = async(quoteData: Quote | Omit<Quote, 'id'>, actor?: string): Promise<void> => {
        try {
            const quoteId = 'id' in quoteData ? quoteData.id : crypto.randomUUID();
            const result = await supabaseService.updateQuote(quoteId, {
                ...quoteData,
            });
            if (result && result.workOrderId) {
                setQuotes(prev => prev.map(q => 
                    q.id === quoteId ? result : q,
                ));
                
                // Update linkedQuoteIds for the work order
                const workOrder = workOrders.find(wo => wo.id === result.workOrderId);
                if (workOrder) {
                    const newLinkedQuoteIds = [...new Set([...(workOrder.linkedQuoteIds || []), result.id])];
                    
                    console.log('🔍 DataContext - handleSaveQuote - Updating linkedQuoteIds:', newLinkedQuoteIds);
                    
                    // Update local work orders state with linkedQuoteIds
                    setWorkOrders(prev => prev.map(wo => 
                        wo.id === result.workOrderId ? { ...wo, linkedQuoteIds: newLinkedQuoteIds } : wo,
                    ));
                }

                // Handle different quote status changes
                console.log('🔍 DataContext - handleSaveQuote - result.status:', result.status);
                console.log('🔍 DataContext - handleSaveQuote - QuoteStatus.ENVIADO:', QuoteStatus.ENVIADO);
                console.log('🔍 DataContext - handleSaveQuote - comparison result:', result.status === QuoteStatus.ENVIADO);
                console.log('🔍 DataContext - handleSaveQuote - typeof result.status:', typeof result.status);
                console.log('🔍 DataContext - handleSaveQuote - typeof QuoteStatus.ENVIADO:', typeof QuoteStatus.ENVIADO);
                
                if (result.status === QuoteStatus.ENVIADO) {
                    // Quote sent - move to "Esperando Aprobación"
                    const workOrder = workOrders.find(wo => wo.id === result.workOrderId);
                    const newLinkedQuoteIds = workOrder ? [...new Set([...(workOrder.linkedQuoteIds || []), result.id])] : [];
                    
                    const updateData = {
                        stage: KanbanStage.ESPERA_APROBACION,
                        linkedQuoteIds: newLinkedQuoteIds,
                    };
                    
                    console.log('🔍 DataContext - handleSaveQuote - Updating work order stage to Esperando Aprobación');
                    await supabaseService.updateWorkOrder(result.workOrderId, updateData);
                    
                    // Update local work orders state
                    setWorkOrders(prev => prev.map(wo => 
                        wo.id === result.workOrderId ? { ...wo, stage: KanbanStage.ESPERA_APROBACION, linkedQuoteIds: newLinkedQuoteIds } : wo,
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
                    const workOrder = workOrders.find(wo => wo.id === result.workOrderId);
                    const newLinkedQuoteIds = workOrder ? [...new Set([...(workOrder.linkedQuoteIds || []), result.id])] : [];
                    
                    const updateData = {
                        stage: KanbanStage.EN_REPARACION,
                        linkedQuoteIds: newLinkedQuoteIds,
                    };
                    
                    console.log('🔍 DataContext - handleSaveQuote - Updating work order stage to En Reparación');
                    await supabaseService.updateWorkOrder(result.workOrderId, updateData);
                    
                    // Update local work orders state
                    setWorkOrders(prev => prev.map(wo => 
                        wo.id === result.workOrderId ? { ...wo, stage: KanbanStage.EN_REPARACION, linkedQuoteIds: newLinkedQuoteIds } : wo,
                    ));
                    
                    // Add history entry
                    const historyEntry: WorkOrderHistoryEntry = {
                        stage: 'En Reparación',
                        date: new Date().toISOString(),
                        user: 'Sistema',
                        notes: `Cotización ${result.id} aprobada - Total: $${result.total?.toLocaleString() || '0'} - Iniciando reparación`,
                    };
                    await handleUpdateWorkOrderHistory(result.workOrderId, historyEntry);
                    
                    // Create notification for approved quote
                    await createNotification({
                        type: 'QUOTE_APPROVED',
                        message: `La cotización ${result.id} ha sido aprobada`,
                        userId: result.clientId || '',
                        isRead: false,
                        timestamp: new Date().toISOString(),
                    });
                } else if (result.status === QuoteStatus.RECHAZADO) {
                    // Quote rejected - move to "Atención Requerida"
                    const workOrder = workOrders.find(wo => wo.id === result.workOrderId);
                    const newLinkedQuoteIds = workOrder ? [...new Set([...(workOrder.linkedQuoteIds || []), result.id])] : [];
                    
                    const updateData = {
                        stage: KanbanStage.ATENCION_REQUERIDA,
                        linkedQuoteIds: newLinkedQuoteIds,
                    };
                    
                    console.log('🔍 DataContext - handleSaveQuote - Updating work order stage to Atención Requerida');
                    await supabaseService.updateWorkOrder(result.workOrderId, updateData);
                    
                    // Update local work orders state
                    setWorkOrders(prev => prev.map(wo => 
                        wo.id === result.workOrderId ? { ...wo, stage: KanbanStage.ATENCION_REQUERIDA, linkedQuoteIds: newLinkedQuoteIds } : wo,
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
                
                // Esperar un momento para que Supabase procese la actualización completamente
                console.log('🔄 handleSaveQuote: Esperando a que Supabase procese la actualización...');
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Refrescar solo órdenes de trabajo para optimizar rendimiento
                console.log('🔄 handleSaveQuote: Refrescando órdenes de trabajo después de guardar cotización...');
                await refreshWorkOrders();
            }
        } catch (error) {
            console.error('Error saving quote:', error);
            throw error;
        }
    };

    const handleApproveQuote = async(quoteId: string): Promise<void> => {
        try {
            const result = await supabaseService.updateQuote(quoteId, {
                status: QuoteStatus.APROBADO,
            });
            
            if (result && result.workOrderId) {
                setQuotes(prev => prev.map(q => 
                    q.id === quoteId ? result : q,
                ));
                
                // Update work order stage to "En Reparación"
                const updateData = {
                    stage: KanbanStage.EN_REPARACION,
                };
                
                console.log('🔍 DataContext - handleApproveQuote - Updating work order stage to En Reparación');
                console.log('🔍 DataContext - handleApproveQuote - updateData:', updateData);
                console.log('🔍 DataContext - handleApproveQuote - result.workOrderId:', result.workOrderId);
                
                const workOrderUpdateResult = await supabaseService.updateWorkOrder(result.workOrderId, updateData);
                console.log('🔍 DataContext - handleApproveQuote - workOrderUpdateResult:', workOrderUpdateResult);
                
                if (!workOrderUpdateResult) {
                    console.error('❌ DataContext - handleApproveQuote - updateWorkOrder returned null!');
                    throw new Error('Failed to update work order stage');
                }
                
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
                
                // Create notification (only if we have a valid staff member ID)
                try {
                    // Solo crear notificación si tenemos un staff member válido
                    // Por ahora, saltamos la notificación para evitar errores de foreign key
                    console.log('🔍 handleApproveQuote - Skipping notification creation to avoid foreign key errors');
                } catch (notificationError) {
                    console.log('🔍 handleApproveQuote - Notification creation failed, continuing without notification:', notificationError);
                    // Continue without failing the entire process
                }
                
                // Esperar un momento para que Supabase procese la actualización completamente
                console.log('🔄 handleApproveQuote: Esperando a que Supabase procese la actualización...');
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Refrescar solo órdenes de trabajo para optimizar rendimiento
                console.log('🔄 handleApproveQuote: Refrescando órdenes de trabajo después de aprobar cotización...');
                await refreshWorkOrders();
            }
        } catch (error) {
            console.error('Error approving quote:', error);
            throw error;
        }
    };

    const handleRejectQuote = async(quoteId: string, reason: string): Promise<void> => {
        try {
            const result = await supabaseService.updateQuote(quoteId, {
                status: QuoteStatus.RECHAZADO,
                // rejectionReason no existe en la interfaz Quote
            });
            if (result && result.workOrderId) {
                setQuotes(prev => prev.map(q => 
                    q.id === quoteId ? result : q,
                ));
                
                // Update work order stage to "Atención Requerida"
                const updateData = {
                    stage: KanbanStage.ATENCION_REQUERIDA,
                };
                
                console.log('🔍 DataContext - handleRejectQuote - Updating work order stage to Atención Requerida');
                await supabaseService.updateWorkOrder(result.workOrderId, updateData);
                
                // Update local work orders state
                setWorkOrders(prev => prev.map(wo => 
                    wo.id === result.workOrderId ? { ...wo, stage: KanbanStage.ATENCION_REQUERIDA } : wo,
                ));
                
                // Add rejection entry to work order history
                const rejectionHistoryEntry: WorkOrderHistoryEntry = {
                    stage: 'Atención Requerida',
                    date: new Date().toISOString(),
                    user: 'Sistema',
                    notes: `Cotización rechazada: ${reason} - Requiere atención`,
                };
                
                await handleUpdateWorkOrderHistory(result.workOrderId, rejectionHistoryEntry);
                
                // Create notification
                await createNotification({
                    type: 'QUOTE_REJECTED',
                    message: `La cotización ha sido rechazada: ${reason}`,
                    userId: result.clientId || '',
                    isRead: false,
                    timestamp: new Date().toISOString(),
                });
                
                // Esperar un momento para que Supabase procese la actualización completamente
                console.log('🔄 handleRejectQuote: Esperando a que Supabase procese la actualización...');
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Refrescar solo órdenes de trabajo para optimizar rendimiento
                console.log('🔄 handleRejectQuote: Refrescando órdenes de trabajo después de rechazar cotización...');
                await refreshWorkOrders();
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
                    companyInfo: {
                        name: settingsData.name || '',
                        nit: settingsData.nit || '',
                        logoUrl: settingsData.logoUrl || '',
                    },
                    billingSettings: {
                        vatRate: appSettings.billingSettings?.vatRate || 19,
                        currencySymbol: appSettings.billingSettings?.currencySymbol || '$',
                        defaultTerms: appSettings.billingSettings?.defaultTerms || 'El pago debe realizarse dentro de los 30 días posteriores a la fecha de la factura.',
                        bankInfo: appSettings.billingSettings?.bankInfo || 'Cuenta de Ahorros Bancolombia #123-456789-00 a nombre de Autodealer Taller SAS.',
                    },
                    operationsSettings: appSettings.operationsSettings,
                    diagnosticSettings: appSettings.diagnosticSettings,
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
                
                // Use updateAppSettings which handles both create and update with upsert
                result = await supabaseService.updateAppSettings(dbData);
                
                if (result) {
                    // Reload the settings to get the updated data
                    const updatedSettingsData = await supabaseService.getAppSettings();
                    if (Array.isArray(updatedSettingsData) && updatedSettingsData.length > 0) {
                        setAppSettings(updatedSettingsData[0]);
                    }
                }
            } else {
                // If it's a complete settings object (from other tabs)
                // Map to AppSettings structure
                const dbData = {
                    companyInfo: {
                        name: settingsData.companyInfo?.name || appSettings.companyInfo?.name || '',
                        nit: settingsData.companyInfo?.nit || appSettings.companyInfo?.nit || '',
                        logoUrl: settingsData.companyInfo?.logoUrl || appSettings.companyInfo?.logoUrl || '',
                    },
                    billingSettings: {
                        vatRate: settingsData.billingSettings?.vatRate || appSettings.billingSettings?.vatRate || 19,
                        currencySymbol: settingsData.billingSettings?.currencySymbol || appSettings.billingSettings?.currencySymbol || '$',
                        defaultTerms: settingsData.billingSettings?.defaultTerms || appSettings.billingSettings?.defaultTerms || 'El pago debe realizarse dentro de los 30 días posteriores a la fecha de la factura.',
                        bankInfo: settingsData.billingSettings?.bankInfo || appSettings.billingSettings?.bankInfo || 'Cuenta de Ahorros Bancolombia #123-456789-00 a nombre de Autodealer Taller SAS.',
                    },
                    operationsSettings: {
                        serviceCategories: settingsData.operationsSettings?.serviceCategories || appSettings.operationsSettings?.serviceCategories || [],
                        inventoryCategories: settingsData.operationsSettings?.inventoryCategories || appSettings.operationsSettings?.inventoryCategories || [],
                    },
                    diagnosticSettings: settingsData.diagnosticSettings || appSettings.diagnosticSettings || { basic: [], intermediate: [], advanced: [] },
                };
                
                
                // Update local state first
                setAppSettings(settingsData);
                
                let result;
                
                // Use updateAppSettings which handles both create and update with upsert
                result = await supabaseService.updateAppSettings(dbData);
                
                if (result) {
                    // Reload the settings to get the updated data
                    const updatedSettingsData = await supabaseService.getAppSettings();
                    if (Array.isArray(updatedSettingsData) && updatedSettingsData.length > 0) {
                        setAppSettings(updatedSettingsData[0]);
                    }
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
                await supabaseService.updateAppSettings({
                    operationsSettings: updatedSettings.operationsSettings,
                });
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
                await supabaseService.updateAppSettings({
                    operationsSettings: updatedSettings.operationsSettings,
                });
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
                await supabaseService.updateAppSettings({
                    operationsSettings: updatedSettings.operationsSettings,
                });
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
                await supabaseService.updateAppSettings({
                    operationsSettings: updatedSettings.operationsSettings,
                });
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
            const result = await supabaseService.updateStaffMember(staffId, { customPermissions: permissions });
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
            // assignedAccounts no existe en la interfaz StaffMember
            console.warn('assignedAccounts no está implementado en la interfaz StaffMember');
            // const result = await supabaseService.updateStaffMember(staffId, { assignedAccounts: accountIds });
            // if (result) {
            //     setStaffMembers(prev => prev.map(staff =>
            //         staff.id === staffId ? result : staff,
            //     ));
            // }
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
            
            // Update work order with unforeseen issue and change stage to ATENCION_REQUERIDA
            const result = await supabaseService.updateWorkOrder(workOrderId, {
                unforeseenIssues: updatedIssues,
                stage: KanbanStage.ATENCION_REQUERIDA, // Cambio automático a Atención Requerida
            });
            
            if (result) {
                setWorkOrders(prev => prev.map(wo => 
                    wo.id === workOrderId ? result : wo,
                ));
                
                // Add history entry for the stage change
                const historyEntry: WorkOrderHistoryEntry = {
                    stage: 'Atención Requerida',
                    date: new Date().toISOString(),
                    user: 'Sistema',
                    notes: `Imprevisto reportado: ${issue.description}`,
                };
                await handleUpdateWorkOrderHistory(workOrderId, historyEntry);
                
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
            console.log('🔍 DataContext - handleRegisterItemCosts called');
            console.log('🔍 DataContext - workOrderId:', workOrderId);
            console.log('🔍 DataContext - costs:', costs);
            
            let workOrder = workOrders.find(wo => wo.id === workOrderId);
            console.log('🔍 DataContext - workOrder found:', workOrder);
            
            console.log('🔍 DataContext - workOrder.linkedQuoteIds:', workOrder?.linkedQuoteIds);
            console.log('🔍 DataContext - linkedQuoteIds length:', (workOrder?.linkedQuoteIds || []).length);
            
            if (!workOrder) {
                console.log('❌ DataContext - Work order not found');
                alert('No se encontró la orden de trabajo.');
                return;
            }

            // If no linked quotes, try to fix them automatically
            if ((workOrder.linkedQuoteIds || []).length === 0) {
                console.log('🔧 DataContext - No linked quotes found, attempting to fix...');
                const fixedLinkedQuoteIds = await fixLinkedQuoteIds(workOrderId);
                
                if (fixedLinkedQuoteIds.length === 0) {
                    console.log('❌ DataContext - Still no linked quotes after fix attempt');
                    alert('No se encontraron cotizaciones vinculadas para esta orden de trabajo. Por favor verifica que la cotización esté correctamente asociada.');
                    return;
                }
                
                // Use the fixed quote IDs directly
                workOrder = { ...workOrder, linkedQuoteIds: fixedLinkedQuoteIds };
                console.log('✅ DataContext - Using fixed linked quote IDs:', fixedLinkedQuoteIds);
            }
            
            const relevantQuoteIds = new Set<string>(workOrder.linkedQuoteIds);
            console.log('🔍 DataContext - relevantQuoteIds:', relevantQuoteIds);

            for (const quoteId of relevantQuoteIds) {
                const quote = quotes.find(q => q.id === quoteId);
                if (quote) {
                    console.log('🔍 DataContext - Updating quote:', quoteId);
                    const newItems = quote.items.map(item => {
                        const costInfo = costs.find(c => c.itemId === item.id);
                        if (costInfo) {
                            console.log(`🔍 DataContext - Updating item ${item.id} with cost ${costInfo.costPrice}`);
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
            
            alert('Costos guardados exitosamente.');
        } catch (error) {
            console.error('Error registering item costs:', error);
            alert(`Error al guardar los costos: ${error.message}`);
            throw error;
        }
    };

    const fixLinkedQuoteIds = async(workOrderId: string): Promise<string[]> => {
        try {
            
            const workOrder = workOrders.find(wo => wo.id === workOrderId);
            if (!workOrder) {
                console.log('❌ DataContext - Work order not found');
                return [];
            }

            // Find all quotes for this work order
            const quotesForWorkOrder = quotes.filter(q => q.workOrderId === workOrderId);

            if (quotesForWorkOrder.length > 0) {
                const newLinkedQuoteIds = quotesForWorkOrder.map(q => q.id);
                const updateData = {
                    linkedQuoteIds: newLinkedQuoteIds,
                    stage: workOrder.stage, // PRESERVAR el stage actual
                };

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
        workOrders.filter(wo => wo.status !== WorkOrderStatus.LISTO_ENTREGA && wo.status !== WorkOrderStatus.CANCELADO),
        [workOrders],
    );

    const completedWorkOrders = useMemo(() => 
        workOrders.filter(wo => wo.status === WorkOrderStatus.LISTO_ENTREGA),
        [workOrders],
    );

    const pendingQuotes = useMemo(() => 
        quotes.filter(q => q.status === QuoteStatus.ENVIADO),
        [quotes],
    );

    const approvedQuotes = useMemo(() => 
        quotes.filter(q => q.status === QuoteStatus.APROBADO),
        [quotes],
    );

    const rejectedQuotes = useMemo(() => 
        quotes.filter(q => q.status === QuoteStatus.RECHAZADO),
        [quotes],
    );

    const unpaidInvoices = useMemo(() => 
        invoices.filter(inv => inv.status !== InvoiceStatus.PAGADA),
        [invoices],
    );

    const paidInvoices = useMemo(() => 
        invoices.filter(inv => inv.status === InvoiceStatus.PAGADA),
        [invoices],
    );

    const lowStockItems = useMemo(() => 
        inventoryItems.filter(item => item.stock <= 5), // Usar stock y umbral fijo
        [inventoryItems],
    );

    const outOfStockItems = useMemo(() => 
        inventoryItems.filter(item => item.stock === 0),
        [inventoryItems],
    );

    const loadAllData = async() => {
        try {
            setIsLoading(true);
            setError(null);
            
            console.log('🔄 Loading all data from Supabase...');
            
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
            if (Array.isArray(appSettingsData) && appSettingsData.length > 0) {
                console.log('🔧 App settings data from DB:', appSettingsData[0]);
                const settings = appSettingsData[0];
                
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
            console.log('🔄 Falling back to default data...');
            
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

    // Función optimizada para recargar solo órdenes de trabajo
    const refreshWorkOrders = async() => {
        try {
            const workOrdersData = await supabaseService.getWorkOrders();
            
            if (workOrdersData) {
                const updatedWorkOrders = workOrdersData.map(wo => ({
                    ...wo,
                    status: wo.status as WorkOrderStatus,
                }));
                
                setWorkOrders(updatedWorkOrders);
            }
            
        } catch (error) {
            console.error('❌ Error refreshing work orders:', error);
            throw error;
        }
    };

    // Función de emergencia para recargar TODO y sincronizar
    const forceFullRefresh = async() => {
        try {
            await loadAllData();
        } catch (error) {
            console.error('❌ Error en recarga completa:', error);
        }
    };

    // Estabilizar el objeto contextValue para evitar re-renderizados infinitos
    const contextValue: DataContextType = useMemo(() => ({
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
        handleRegisterDelivery,
        handlePostProgressUpdate,
        handleToggleTaskCompleted,

        handleCreateClient,
        handleSaveClient,
        handleDeleteClient,
        migrateClientsRegistrationDate,

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
        refreshWorkOrders,
        forceFullRefresh,

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
        handleConfirmAppointment,
        handleCancelAppointment,
        handleRescheduleAppointment,

        // Complex operations
        handleAssignTechnician,
        handleCancelOrder,
        handleSaveDiagnostic,
        handleAdvanceStage,
        handleRetreatStage,
        handleRejectQuote,
        handleReportUnforeseenIssue,
        handleUpdateAllWorkOrderStages,
        handleRestoreIncorrectlyCompletedOrders,
        handleFixOrdersWithQuoteStageMismatch,
        handleFixSpecificOrder,
        handleRegisterItemCosts,
        fixLinkedQuoteIds,

        // Utility functions
        calculateDueDate,
        createNotification,
        
        // Missing functions (temporary implementations)
        handleMarkNotificationAsRead: async (notificationId: string) => {
            console.warn('handleMarkNotificationAsRead not implemented');
        },
        handleMarkAllNotificationsAsRead: async () => {
            console.warn('handleMarkAllNotificationsAsRead not implemented');
        },
        handleCreateWorkOrderFromAppointment: async (appointmentId: string) => {
            try {
                console.log(`🔍 handleCreateWorkOrderFromAppointment - Preparing to open work order form for appointment:`, appointmentId);
                
                // Buscar la cita
                const appointment = appointments.find(a => a.id === appointmentId);
                if (!appointment) {
                    throw new Error('Cita no encontrada');
                }
                
                console.log('🔍 Found appointment:', appointment);
                
                // Preparar datos iniciales para el formulario
                const initialData = {
                    clientId: appointment.clientId,
                    vehicleId: appointment.vehicleId,
                    serviceRequested: appointment.serviceRequested,
                    advisorId: appointment.advisorId,
                };
                
                console.log('🔍 Initial data for work order form:', initialData);
                
                // Esta función ahora solo prepara los datos, el modal se abrirá desde el componente padre
                // que llamará a openModal con estos datos
                return initialData;
                
            } catch (error) {
                console.error('Error preparing work order from appointment:', error);
                throw error;
            }
        },
        handleAddTransaction: async (transactionData: any) => {
            console.warn('handleAddTransaction not implemented');
        },
        
        // Update functions
        updateLocation,
    }), [locations, workOrders, clients, vehicles, staffMembers, services, inventoryItems, suppliers, pettyCashTransactions, invoices, quotes, purchaseOrders, operatingExpenses, financialAccounts, appSettings, timeClockEntries, loans, loanPayments, notifications, appointments, isLoading, error]);

    // SISTEMA AUTOMÁTICO FORZADO - DESHABILITADO TEMPORALMENTE
    React.useEffect(() => {
        return; // Sistema automático deshabilitado
        
        console.log('🚀 SISTEMA AUTOMÁTICO INICIADO - useEffect ejecutado');
        console.log('🚀 SISTEMA AUTOMÁTICO - workOrders.length:', workOrders.length);
        console.log('🚀 SISTEMA AUTOMÁTICO - quotes.length:', quotes.length);
        
        const autoFixAllStages = async() => {
            try {
                console.log('🔧 SISTEMA AUTOMÁTICO: Iniciando corrección de etapas...');
                console.log('🔧 SISTEMA AUTOMÁTICO: Estado actual - workOrders:', workOrders.length, 'quotes:', quotes.length);
                console.log('🔧 SISTEMA AUTOMÁTICO: Contexto disponible:', { supabaseService: !!supabaseService, handleUpdateWorkOrderHistory: !!handleUpdateWorkOrderHistory });
                
                // Obtener datos frescos directamente de Supabase
                console.log('📡 Obteniendo datos de Supabase...');
                const [allWorkOrders, allQuotes] = await Promise.all([
                    supabaseService.getWorkOrders(),
                    supabaseService.getQuotes(),
                ]);
                
                console.log(`📊 Datos obtenidos: ${allWorkOrders.length} órdenes, ${allQuotes.length} cotizaciones`);
                console.log('📊 Primeras 3 órdenes:', allWorkOrders.slice(0, 3).map(wo => ({ id: wo.id, stage: wo.stage, linkedQuoteIds: wo.linkedQuoteIds })));
                console.log('📊 Primeras 3 cotizaciones:', allQuotes.slice(0, 3).map(q => ({ id: q.id, status: q.status, workOrderId: q.workOrderId })));
                
                // Buscar específicamente la orden #0081
                const order0081 = allWorkOrders.find(wo => wo.id === '0081');
                if (order0081) {
                    console.log('🔍 SISTEMA AUTOMÁTICO: ¡Encontrada orden #0081 en la base de datos!', {
                        id: order0081.id,
                        stage: order0081.stage,
                        linkedQuoteIds: order0081.linkedQuoteIds,
                    });
                } else {
                    console.log('❌ SISTEMA AUTOMÁTICO: ¡Orden #0081 NO encontrada en la base de datos!');
                    console.log('📊 IDs de órdenes disponibles:', allWorkOrders.map(wo => wo.id));
                }
                
                if (allWorkOrders.length === 0 || allQuotes.length === 0) {
                    console.log('⏳ SISTEMA AUTOMÁTICO: No hay datos suficientes, reintentando en 3 segundos...');
                    setTimeout(autoFixAllStages, 3000);
                    return;
                }
                
                let fixedCount = 0;
                const errors: string[] = [];
                
                console.log('🔍 SISTEMA AUTOMÁTICO: Analizando todas las órdenes...');
                
                // El bucle general manejará TODAS las órdenes automáticamente
                
                // Verificar cada orden de trabajo
                console.log('🔍 SISTEMA AUTOMÁTICO: Iniciando bucle general para todas las órdenes...');
                for (const workOrder of allWorkOrders) {
                    console.log(`🔍 SISTEMA AUTOMÁTICO: Procesando orden ${workOrder.id} (stage: ${workOrder.stage})`);
                    try {
                        // Saltar órdenes completadas o canceladas
                        if (workOrder.stage === KanbanStage.ENTREGADO || workOrder.stage === KanbanStage.CANCELADO) {
                            console.log(`⏩ SISTEMA AUTOMÁTICO: Saltando orden ${workOrder.id} (stage: ${workOrder.stage})`);
                            continue;
                        }
                        
                        // Buscar cotizaciones para esta orden
                        const orderQuotes = allQuotes.filter(q => 
                            q.workOrderId === workOrder.id || 
                            (workOrder.linkedQuoteIds && workOrder.linkedQuoteIds.includes(q.id)),
                        );
                        
                        if (orderQuotes.length === 0) {
                            console.log(`⏩ SISTEMA AUTOMÁTICO: Saltando orden ${workOrder.id} (no tiene cotizaciones)`);
                            continue; // No hay cotizaciones
                        }
                        
                        console.log(`🔍 Analizando orden ${workOrder.id}: stage=${workOrder.stage}, quotes=${orderQuotes.length}`);
                        console.log(`📋 Cotizaciones:`, orderQuotes.map(q => ({ id: q.id, status: q.status })));
                        
                        // Analizar estado de las cotizaciones
                        const approvedQuotes = orderQuotes.filter(q => q.status === QuoteStatus.APROBADO);
                        const rejectedQuotes = orderQuotes.filter(q => q.status === QuoteStatus.RECHAZADO);
                        const sentQuotes = orderQuotes.filter(q => q.status === QuoteStatus.ENVIADO);
                        const draftQuotes = orderQuotes.filter(q => q.status === QuoteStatus.BORRADOR);
                        
                        // Determinar la etapa correcta
                        let correctStage = workOrder.stage;
                        let updateReason = '';
                        
                        if (approvedQuotes.length > 0) {
                            correctStage = KanbanStage.EN_REPARACION;
                            updateReason = `Cotización aprobada (${approvedQuotes.map(q => q.id).join(', ')}) - debe estar en En Reparación`;
                        } else if (rejectedQuotes.length > 0) {
                            correctStage = KanbanStage.ATENCION_REQUERIDA;
                            updateReason = `Cotización rechazada (${rejectedQuotes.map(q => q.id).join(', ')}) - debe estar en Atención Requerida`;
                        } else if (sentQuotes.length > 0) {
                            correctStage = KanbanStage.ESPERA_APROBACION;
                            updateReason = `Cotización enviada (${sentQuotes.map(q => q.id).join(', ')}) - debe estar en Espera Aprobación`;
                        } else if (draftQuotes.length > 0) {
                            correctStage = KanbanStage.PENDIENTE_COTIZACION;
                            updateReason = `Solo cotizaciones en borrador - debe estar en Pendiente Cotización`;
                        }
                        
                        console.log(`🔧 Etapa correcta para ${workOrder.id}: ${correctStage} (actual: ${workOrder.stage})`);
                        
                        // Actualizar si es necesario
                        if (correctStage !== workOrder.stage) {
                            console.log(`🔧 CORRIGIENDO: Orden ${workOrder.id} - ${workOrder.stage} → ${correctStage} (${updateReason})`);
                            
                            // Actualizar linkedQuoteIds si faltan
                            const missingQuoteIds = orderQuotes
                                .filter(q => !workOrder.linkedQuoteIds?.includes(q.id))
                                .map(q => q.id);
                            
                            const newLinkedQuoteIds = [...new Set([
                                ...(workOrder.linkedQuoteIds || []),
                                ...missingQuoteIds,
                            ])];
                            
                            const updateData = {
                                stage: correctStage,
                                linkedQuoteIds: newLinkedQuoteIds,
                            };
                            
                            console.log(`💾 Actualizando orden ${workOrder.id} en Supabase...`);
                            await supabaseService.updateWorkOrder(workOrder.id, updateData);
                            
                            // Actualizar estado local
                            setWorkOrders(prev => prev.map(wo => 
                                wo.id === workOrder.id ? { 
                                    ...wo, 
                                    stage: correctStage, 
                                    linkedQuoteIds: newLinkedQuoteIds, 
                                } : wo,
                            ));
                            
                            // Añadir entrada al historial
                            const historyEntry = {
                                stage: correctStage,
                                date: new Date().toISOString(),
                                user: 'Sistema Automático',
                                notes: updateReason,
                            };
                            console.log(`📝 Añadiendo entrada al historial para orden ${workOrder.id}...`);
                            await handleUpdateWorkOrderHistory(workOrder.id, historyEntry);
                            
                            fixedCount++;
                            console.log(`✅ Orden ${workOrder.id} corregida exitosamente`);
                        } else {
                            console.log(`✅ Orden ${workOrder.id} ya está en la etapa correcta`);
                        }
                        
                    } catch (error) {
                        const errorMsg = `Error corrigiendo orden ${workOrder.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                        console.error(errorMsg);
                        errors.push(errorMsg);
                    }
                }
                
                console.log(`🎯 SISTEMA AUTOMÁTICO: Bucle completado. Procesadas ${allWorkOrders.length} órdenes, corregidas ${fixedCount}, errores ${errors.length}`);
                
                if (fixedCount > 0) {
                    console.log(`✅ SISTEMA AUTOMÁTICO: Corregidas ${fixedCount} órdenes`);
                    console.log(`❌ Errores: ${errors.length}`);
                    
                    // Recargar datos para mostrar cambios
                    console.log('🔄 Recargando datos para mostrar cambios...');
                    await loadAllData();
                } else {
                    console.log('✅ SISTEMA AUTOMÁTICO: Todas las etapas están correctas');
                }
                
            } catch (error) {
                console.error('❌ Error en sistema automático:', error);
            }
        };
        
        // Ejecutar solo una vez al cargar la aplicación
        console.log('⏰ SISTEMA AUTOMÁTICO: Programando ejecución única...');
        const timer = setTimeout(() => {
            console.log('⏰ SISTEMA AUTOMÁTICO: Timer ejecutado, iniciando corrección...');
            autoFixAllStages().catch(error => {
                console.error('❌ SISTEMA AUTOMÁTICO: Error en autoFixAllStages:', error);
            });
        }, 1000);

        return () => {
            console.log('🧹 SISTEMA AUTOMÁTICO: Limpiando timer...');
            clearTimeout(timer);
        };
    }, []); // Se ejecuta solo una vez al montar el componente

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