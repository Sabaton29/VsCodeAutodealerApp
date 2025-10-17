import { supabase } from '../lib/supabase';
import { 
    Location, WorkOrder, Client, Vehicle, StaffMember, Service, InventoryItem, 
    Supplier, PettyCashTransaction, Invoice, Quote, PurchaseOrder, 
    OperatingExpense, FinancialAccount, AppSettings, TimeClockEntry, Loan, 
    LoanPayment, Notification, Appointment
} from '../types';

// Helper function to handle Supabase errors
const handleSupabaseError = (error: any, operation: string) => {
    console.error(`Error in ${operation}:`, error);
    throw new Error(`Failed to ${operation}: ${error.message}`);
};

// Helper function to convert camelCase to snake_case
const toSnakeCase = (str: string): string => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

// Helper function to convert snake_case to camelCase
const toCamelCase = (str: string): string => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

// Generic function to clean data before sending to Supabase
const cleanData = (data: any): any => {
    if (!data || typeof data !== 'object') return data;
    
    if (Array.isArray(data)) {
        return data.map(item => cleanData(item));
    }
    
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
        // Skip empty values that cause UUID errors, but preserve important fields
        if (value === '' || value === null || value === undefined) {
            // Don't skip important fields like status, even if they might be empty
            if (key === 'status' || key === 'stage' || key === 'type' || key === 'items') {
                cleaned[key] = value;
            }
            continue;
        }
        
        // Skip empty objects that cause errors (including timestamp objects)
        if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) {
            continue;
        }
        
        
        // Skip objects that are just empty braces (common timestamp issue)
        if (typeof value === 'object' && value !== null && JSON.stringify(value) === '{}') {
            continue;
        }
        
        // Convert dates to ISO strings
        if (value instanceof Date) {
            cleaned[key] = value.toISOString();
        } else if (typeof value === 'object' && value !== null) {
            // Recursively clean nested objects
            const cleanedValue = cleanData(value);
            // Only include if the cleaned value is not empty
            if (cleanedValue !== null && cleanedValue !== undefined && 
                (typeof cleanedValue !== 'object' || Object.keys(cleanedValue).length > 0)) {
                cleaned[key] = cleanedValue;
            }
        } else {
            cleaned[key] = value;
        }
    }
    return cleaned;
};

// Generic function to transform data between camelCase and snake_case
const transformData = (data: any, toSnake: boolean = true): any => {
    if (!data || typeof data !== 'object') return data;
    
    if (Array.isArray(data)) {
        return data.map(item => transformData(item, toSnake));
    }
    
    const transformed: any = {};
    for (const [key, value] of Object.entries(data)) {
        const newKey = toSnake ? toSnakeCase(key) : toCamelCase(key);
        transformed[newKey] = transformData(value, toSnake);
        
    }
    return transformed;
};

// Generic CRUD operations
export const insert = async (tableName: string, data: any): Promise<any> => {
    try {
        const cleanedData = cleanData(data);
        const transformedData = transformData(cleanedData);
            
            const { data: result, error } = await supabase
            .from(tableName)
            .insert(transformedData)
            .select()
            .single();
            
            if (error) {
            console.error(`🔍 Supabase insert - error:`, error);
            throw error;
        }
        
        const finalResult = transformData(result, false);
        
        return finalResult;
        } catch (error) {
        handleSupabaseError(error, `insert ${tableName}`);
        throw error;
    }
};

export const update = async (tableName: string, id: string, data: any): Promise<any> => {
    try {
        const cleanedData = cleanData(data);
        const transformedData = transformData(cleanedData);
            const { data: result, error } = await supabase
            .from(tableName)
            .update(transformedData)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
        return transformData(result, false);
        } catch (error) {
        handleSupabaseError(error, `update ${tableName}`);
                throw error;
        }
};

export const deleteRecord = async (tableName: string, id: string): Promise<boolean> => {
        try {
            const { error } = await supabase
            .from(tableName)
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
        handleSupabaseError(error, `delete ${tableName}`);
            return false;
        }
};

// LOCATIONS
export const getLocations = async (): Promise<Location[]> => {
    try {
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .order('name');
        
        if (error) throw error;
        return transformData(data, false) as Location[];
        } catch (error) {
        handleSupabaseError(error, 'get locations');
        return [];
    }
};

export const createLocation = async (locationData: Omit<Location, 'id'>): Promise<Location> => {
    try {
        const transformedData = transformData(locationData);
        const { data, error } = await supabase
            .from('locations')
            .insert(transformedData)
                .select()
                .single();
            
        if (error) throw error;
        return transformData(data, false) as Location;
    } catch (error) {
        handleSupabaseError(error, 'create location');
        throw error;
    }
};

export const updateLocation = async (id: string, locationData: Partial<Location>): Promise<Location> => {
    try {
        const transformedData = transformData(locationData);
        const { data, error } = await supabase
            .from('locations')
            .update(transformedData)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
        return transformData(data, false) as Location;
        } catch (error) {
        handleSupabaseError(error, 'update location');
                throw error;
        }
};

export const deleteLocation = async (id: string): Promise<void> => {
        try {
            const { error } = await supabase
            .from('locations')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
        } catch (error) {
        handleSupabaseError(error, 'delete location');
        throw error;
    }
};

// WORK ORDERS
export const getWorkOrders = async (): Promise<WorkOrder[]> => {
    try {
        const { data, error } = await supabase
            .from('work_orders')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching work orders:', error);
            throw error;
        }
        
        return transformData(data, false) as WorkOrder[];
    } catch (error) {
        console.error('Error en getWorkOrders:', error);
        handleSupabaseError(error, 'get work orders');
        return [];
    }
};

export const createWorkOrder = async (workOrderData: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkOrder> => {
    try {
        // Limpiar datos antes de enviar - eliminar campos vacíos que causan errores
        const cleanedData = { ...workOrderData };
        
        // Eliminar campos problemáticos
        Object.keys(cleanedData).forEach(key => {
            const value = cleanedData[key];
            
            // Eliminar strings vacíos, null, undefined, objetos vacíos
            if (value === '' || value === null || value === undefined) {
                delete cleanedData[key];
            }
            
            // Eliminar objetos vacíos que causan errores de timestamp
            if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) {
                delete cleanedData[key];
            }
            
            // Convertir fechas a formato ISO si son objetos Date
            if (value instanceof Date) {
                cleanedData[key] = value.toISOString();
            }
        });
        
        const transformedData = transformData(cleanedData);
        const { data, error } = await supabase
            .from('work_orders')
            .insert(transformedData)
                .select('*')
                .single();
            
        if (error) throw error;
        return transformData(data, false) as WorkOrder;
    } catch (error) {
        handleSupabaseError(error, 'create work order');
        throw error;
    }
};

export const updateWorkOrder = async (id: string, workOrderData: Partial<WorkOrder>): Promise<WorkOrder> => {
    try {
        
        // Limpiar datos antes de enviar - eliminar campos vacíos que causan errores
        const cleanedData = { ...workOrderData };
        
        // Eliminar campos problemáticos
        Object.keys(cleanedData).forEach(key => {
            const value = cleanedData[key];
            
            // Eliminar strings vacíos, null, undefined, objetos vacíos
            if (value === '' || value === null || value === undefined) {
                delete cleanedData[key];
            }
            
            // Eliminar objetos vacíos que causan errores de UUID
            if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) {
                delete cleanedData[key];
            }
            
            // Convertir fechas a formato ISO si son objetos Date
            if (value instanceof Date) {
                cleanedData[key] = value.toISOString();
            }
        });
        
        const transformedData = transformData(cleanedData);
        
        const { data, error } = await supabase
            .from('work_orders')
            .update(transformedData)
            .eq('id', id)
            .select('*')
                        .single();
                    

        if (error) {
            console.error(`❌ supabase.ts - updateWorkOrder - Error de Supabase:`, error);
            throw error;
        }
        
        const result = transformData(data, false) as WorkOrder;
        return result;
    } catch (error) {
        console.error(`❌ supabase.ts - updateWorkOrder - Error general:`, error);
        handleSupabaseError(error, 'update work order');
        throw error;
    }
};

export const deleteWorkOrder = async (id: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('work_orders')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        } catch (error) {
        handleSupabaseError(error, 'delete work order');
        throw error;
        }
};

// CLIENTS
export const getClients = async (): Promise<Client[]> => {
    try {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('name');
        
        if (error) throw error;
        return transformData(data, false) as Client[];
    } catch (error) {
        handleSupabaseError(error, 'get clients');
            return [];
        }
};

export const createClient = async (clientData: Omit<Client, 'id' | 'vehicleCount' | 'registrationDate'>): Promise<Client> => {
    try {
        const transformedData = transformData(clientData);
        const { data, error } = await supabase
            .from('clients')
            .insert(transformedData)
            .select()
                .single();

        if (error) throw error;
        return transformData(data, false) as Client;
    } catch (error) {
        handleSupabaseError(error, 'create client');
        throw error;
    }
};

export const updateClient = async (id: string, clientData: Partial<Client>): Promise<Client> => {
    try {
        const transformedData = transformData(clientData);
            const { data, error } = await supabase
            .from('clients')
            .update(transformedData)
            .eq('id', id)
            .select()
                .single();

        if (error) throw error;
        return transformData(data, false) as Client;
    } catch (error) {
        handleSupabaseError(error, 'update client');
        throw error;
    }
};

export const deleteClient = async (id: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    } catch (error) {
        handleSupabaseError(error, 'delete client');
        throw error;
    }
};

// VEHICLES
export const getVehicles = async (): Promise<Vehicle[]> => {
    try {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return transformData(data, false) as Vehicle[];
    } catch (error) {
        handleSupabaseError(error, 'get vehicles');
            return [];
        }
};

export const createVehicle = async (vehicleData: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
    try {
        const transformedData = transformData(vehicleData);
        const { data, error } = await supabase
            .from('vehicles')
            .insert(transformedData)
            .select('*')
                .single();

        if (error) throw error;
        return transformData(data, false) as Vehicle;
    } catch (error) {
        handleSupabaseError(error, 'create vehicle');
        throw error;
    }
};

export const updateVehicle = async (id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    try {
        const transformedData = transformData(vehicleData);
        const { data, error } = await supabase
            .from('vehicles')
            .update(transformedData)
            .eq('id', id)
            .select('*')
            .single();
        
        if (error) throw error;
        return transformData(data, false) as Vehicle;
    } catch (error) {
        handleSupabaseError(error, 'update vehicle');
        throw error;
    }
};

export const deleteVehicle = async (id: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('vehicles')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        } catch (error) {
        handleSupabaseError(error, 'delete vehicle');
        throw error;
    }
};

// STAFF MEMBERS
export const getStaffMembers = async (): Promise<StaffMember[]> => {
    try {
        const { data, error } = await supabase
            .from('staff_members')
            .select('*')
            .order('name');
        
        if (error) throw error;
        return transformData(data, false) as StaffMember[];
    } catch (error) {
        handleSupabaseError(error, 'get staff members');
        return [];
    }
};

export const createStaffMember = async (staffData: Omit<StaffMember, 'id' | 'avatarUrl'>): Promise<StaffMember> => {
    try {
        const transformedData = transformData(staffData);
        const { data, error } = await supabase
            .from('staff_members')
            .insert(transformedData)
            .select()
            .single();
        
        if (error) throw error;
        return transformData(data, false) as StaffMember;
    } catch (error) {
        handleSupabaseError(error, 'create staff member');
        throw error;
    }
};

export const updateStaffMember = async (id: string, staffData: Partial<StaffMember>): Promise<StaffMember> => {
    try {
        const transformedData = transformData(staffData);
        const { data, error } = await supabase
            .from('staff_members')
            .update(transformedData)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return transformData(data, false) as StaffMember;
    } catch (error) {
        handleSupabaseError(error, 'update staff member');
        throw error;
    }
};

export const deleteStaffMember = async (id: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('staff_members')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    } catch (error) {
        handleSupabaseError(error, 'delete staff member');
        throw error;
    }
};

// SERVICES
export const getServices = async (): Promise<Service[]> => {
    try {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('name');
        
        if (error) throw error;
        return transformData(data, false) as Service[];
    } catch (error) {
        handleSupabaseError(error, 'get services');
        return [];
    }
};

export const createService = async (serviceData: Omit<Service, 'id'>): Promise<Service> => {
    try {
        const transformedData = transformData(serviceData);
        const { data, error } = await supabase
            .from('services')
            .insert(transformedData)
            .select()
            .single();
        
        if (error) throw error;
        return transformData(data, false) as Service;
    } catch (error) {
        handleSupabaseError(error, 'create service');
        throw error;
    }
};

export const updateService = async (id: string, serviceData: Partial<Service>): Promise<Service> => {
    try {
        const transformedData = transformData(serviceData);
        const { data, error } = await supabase
            .from('services')
            .update(transformedData)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return transformData(data, false) as Service;
    } catch (error) {
        handleSupabaseError(error, 'update service');
        throw error;
    }
};

export const deleteService = async (id: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    } catch (error) {
        handleSupabaseError(error, 'delete service');
        throw error;
    }
};

// INVENTORY ITEMS
export const getInventoryItems = async (): Promise<InventoryItem[]> => {
    try {
        const { data, error } = await supabase
            .from('inventory_items')
            .select('*')
            .order('name');
        
        if (error) throw error;
        return transformData(data, false) as InventoryItem[];
    } catch (error) {
        handleSupabaseError(error, 'get inventory items');
        return [];
    }
};

export const createInventoryItem = async (itemData: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
    try {
        const transformedData = transformData(itemData);
        const { data, error } = await supabase
            .from('inventory_items')
            .insert(transformedData)
            .select()
            .single();
        
        if (error) throw error;
        return transformData(data, false) as InventoryItem;
    } catch (error) {
        handleSupabaseError(error, 'create inventory item');
        throw error;
    }
};

export const updateInventoryItem = async (id: string, itemData: Partial<InventoryItem>): Promise<InventoryItem> => {
    try {
        const transformedData = transformData(itemData);
        const { data, error } = await supabase
            .from('inventory_items')
            .update(transformedData)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return transformData(data, false) as InventoryItem;
    } catch (error) {
        handleSupabaseError(error, 'update inventory item');
        throw error;
    }
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('inventory_items')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    } catch (error) {
        handleSupabaseError(error, 'delete inventory item');
        throw error;
    }
};

// SUPPLIERS
export const getSuppliers = async (): Promise<Supplier[]> => {
    try {
        const { data, error } = await supabase
            .from('suppliers')
            .select('*')
            .order('name');
        
        if (error) throw error;
        return transformData(data, false) as Supplier[];
    } catch (error) {
        handleSupabaseError(error, 'get suppliers');
        return [];
    }
};

export const createSupplier = async (supplierData: Omit<Supplier, 'id'>): Promise<Supplier> => {
    try {
        const transformedData = transformData(supplierData);
        const { data, error } = await supabase
            .from('suppliers')
            .insert(transformedData)
            .select()
            .single();
        
        if (error) throw error;
        return transformData(data, false) as Supplier;
    } catch (error) {
        handleSupabaseError(error, 'create supplier');
        throw error;
    }
};

export const updateSupplier = async (id: string, supplierData: Partial<Supplier>): Promise<Supplier> => {
    try {
        const transformedData = transformData(supplierData);
        const { data, error } = await supabase
            .from('suppliers')
            .update(transformedData)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return transformData(data, false) as Supplier;
    } catch (error) {
        handleSupabaseError(error, 'update supplier');
        throw error;
    }
};

export const deleteSupplier = async (id: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('suppliers')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    } catch (error) {
        handleSupabaseError(error, 'delete supplier');
        throw error;
    }
};

// QUOTES
export const getQuotes = async (): Promise<Quote[]> => {
    try {
        const { data, error } = await supabase
            .from('quotes')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return transformData(data, false) as Quote[];
    } catch (error) {
        handleSupabaseError(error, 'get quotes');
        return [];
    }
};

export const createQuote = async (quoteData: Omit<Quote, 'id'>): Promise<Quote> => {
    try {
        const cleanedData = cleanData(quoteData);
        const transformedData = transformData(cleanedData);
        
        const { data, error } = await supabase
            .from('quotes')
            .insert(transformedData)
            .select('*')
            .single();
        
        if (error) {
            console.error('🔍 createQuote - Supabase error:', error);
            throw error;
        }
        
        const finalResult = transformData(data, false) as Quote;
        
        return finalResult;
    } catch (error) {
        handleSupabaseError(error, 'create quote');
        throw error;
    }
};

export const updateQuote = async (id: string, quoteData: Partial<Quote>): Promise<Quote> => {
    try {
        const cleanedData = cleanData(quoteData);
        const transformedData = transformData(cleanedData);
        
        const { data, error } = await supabase
            .from('quotes')
            .update(transformedData)
            .eq('id', id)
            .select('*')
            .single();
        
        if (error) {
            console.error('🔍 updateQuote - Supabase error:', error);
            throw error;
        }
        
        return transformData(data, false) as Quote;
    } catch (error) {
        handleSupabaseError(error, 'update quote');
        throw error;
    }
};

export const deleteQuote = async (id: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('quotes')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    } catch (error) {
        handleSupabaseError(error, 'delete quote');
        throw error;
    }
};

// Get quote with items (quotes + quote_items)
export const getQuoteWithItems = async (quoteId: string): Promise<any> => {
    try {
        // Get the quote
        const { data: quote, error: quoteError } = await supabase
            .from('quotes')
            .select('*')
            .eq('id', quoteId)
            .single();
        
        if (quoteError) throw quoteError;
        
        // Since quote_items table doesn't exist, we'll get items from the quote's items field
        // or return empty array if not available
        const items = quote.items || [];
        
        // Solo devolver items si existen y tienen datos válidos
        const finalItems = items && items.length > 0 ? items : [];
        
        return {
            ...quote,
            items: finalItems
        };
    } catch (error) {
        handleSupabaseError(error, 'get quote with items');
        throw error;
    }
};

// APP SETTINGS
export const getAppSettings = async (): Promise<AppSettings | null> => {
    try {
        // Primero intentar obtener un solo registro
        const { data, error } = await supabase
            .from('app_settings')
            .select('*')
            .single();
        
        if (error) {
            // Si hay error por múltiples registros, obtener el más reciente
            if (error.code === 'PGRST116') {
                console.log('⚠️ Múltiples registros en app_settings, obteniendo el más reciente...');
                const { data: multipleData, error: multipleError } = await supabase
                    .from('app_settings')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(1);
                
                if (multipleError) throw multipleError;
                if (multipleData && multipleData.length > 0) {
                    return transformData(multipleData[0], false) as AppSettings;
                }
            }
            throw error;
        }
        
        return transformData(data, false) as AppSettings;
    } catch (error) {
        console.error('❌ Error obteniendo app settings:', error);
        return null;
    }
};

export const updateAppSettings = async (settingsData: Partial<AppSettings>): Promise<AppSettings> => {
    try {
        const transformedData = transformData(settingsData);
        const { data, error } = await supabase
            .from('app_settings')
            .upsert(transformedData)
            .select()
            .single();
        
        if (error) throw error;
        return transformData(data, false) as AppSettings;
    } catch (error) {
        handleSupabaseError(error, 'update app settings');
        throw error;
    }
};

// Funciones que devuelven arrays vacíos temporalmente para evitar errores
export const getPettyCashTransactions = async (): Promise<PettyCashTransaction[]> => {
    return [];
};

export const getInvoices = async (): Promise<Invoice[]> => {
    return [];
};

export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
    return [];
};

export const getOperatingExpenses = async (): Promise<OperatingExpense[]> => {
    return [];
};

export const getFinancialAccounts = async (): Promise<FinancialAccount[]> => {
    return [];
};

export const getTimeClockEntries = async (): Promise<TimeClockEntry[]> => {
    return [];
};

export const getLoans = async (): Promise<Loan[]> => {
    return [];
};

export const getLoanPayments = async (): Promise<LoanPayment[]> => {
    return [];
};

export const getNotifications = async (): Promise<Notification[]> => {
    return [];
};

export const getAppointments = async (): Promise<Appointment[]> => {
    return [];
};

// Funciones específicas que necesita DataContext
export const insertNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> => {
    try {
        const transformedData = transformData(notificationData);
        const { data, error } = await supabase
            .from('notifications')
            .insert(transformedData)
            .select()
            .single();
        
        if (error) throw error;
        return transformData(data, false) as Notification;
    } catch (error) {
        handleSupabaseError(error, 'insert notification');
        throw error;
    }
};

// UPLOAD FILE TO STORAGE
export const uploadFileToStorage = async (file: File, bucket: string, path: string): Promise<string> => {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file);

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return urlData.publicUrl;
    } catch (error) {
        handleSupabaseError(error, 'upload file to storage');
        throw error;
    }
};

export const insertWorkOrder = createWorkOrder; // Alias para compatibilidad

// Export all functions as a service object for backward compatibility
export const supabaseService = {
    // Generic CRUD
    insert,
    update,
    delete: deleteRecord,
    
    // Locations
    getLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    
    // Work Orders
    getWorkOrders,
    createWorkOrder,
    insertWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    
    // Clients
    getClients,
    createClient,
    updateClient,
    deleteClient,
    
    // Vehicles
    getVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    
    // Staff Members
    getStaffMembers,
    createStaffMember,
    updateStaffMember,
    deleteStaffMember,
    
    // Services
    getServices,
    createService,
    updateService,
    deleteService,
    
    // Inventory Items
    getInventoryItems,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    
    // Suppliers
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    
    // Quotes
    getQuotes,
    createQuote,
    updateQuote,
    deleteQuote,
    getQuoteWithItems,
    
    // App Settings
    getAppSettings,
    updateAppSettings,
    
    // Additional functions
    getPettyCashTransactions,
    getInvoices,
    getPurchaseOrders,
    getOperatingExpenses,
    getFinancialAccounts,
    getTimeClockEntries,
    getLoans,
    getLoanPayments,
    getNotifications,
    getAppointments,
    insertNotification,
    uploadFileToStorage,
};