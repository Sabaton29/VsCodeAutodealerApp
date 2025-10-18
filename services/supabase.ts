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

// Helper function to convert camelCase to snake_case for strings
const toSnakeCaseString = (str: string): string => {
    // Handle special cases
    if (str === 'isB2B') return 'is_b2b';
    if (str === 'registrationDate') return 'registration_date';
    if (str === 'vehicleCount') return 'vehicle_count';
    if (str === 'locationId') return 'location_id';
    if (str === 'personType') return 'person_type';
    if (str === 'idType') return 'id_type';
    if (str === 'idNumber') return 'id_number';
    if (str === 'commissionRate') return 'commission_rate';
    if (str === 'paymentTerms') return 'payment_terms';
    if (str === 'sequentialId') return 'sequential_id';
    if (str === 'deliveryDate') return 'delivery_date';
    if (str === 'date') return 'date'; // Keep date as is
    // Inventory checklist special cases
    if (str === 'spareTire') return 'spare_tire';
    if (str === 'jackKit') return 'jack_kit';
    if (str === 'fireExtinguisher') return 'fire_extinguisher';
    if (str === 'firstAidKit') return 'first_aid_kit';
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

// Helper function to convert camelCase to snake_case for objects
const toSnakeCase = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(toSnakeCase);
    
    const result: any = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const snakeKey = toSnakeCaseString(key);
            result[snakeKey] = toSnakeCase(obj[key]);
        }
    }
    return result;
};

// Helper function to convert snake_case to camelCase for strings
const toCamelCaseString = (str: string): string => {
    // Handle special cases
    if (str === 'is_b2b') return 'isB2B';
    if (str === 'registration_date') return 'registrationDate';
    if (str === 'vehicle_count') return 'vehicleCount';
    if (str === 'location_id') return 'locationId';
    if (str === 'person_type') return 'personType';
    if (str === 'id_type') return 'idType';
    if (str === 'id_number') return 'idNumber';
    if (str === 'commission_rate') return 'commissionRate';
    if (str === 'payment_terms') return 'paymentTerms';
    if (str === 'sequential_id') return 'sequentialId';
    if (str === 'delivery_date') return 'deliveryDate';
    if (str === 'date') return 'date'; // Keep date as is
    // Inventory checklist special cases
    if (str === 'spare_tire') return 'spareTire';
    if (str === 'jack_kit') return 'jackKit';
    if (str === 'fire_extinguisher') return 'fireExtinguisher';
    if (str === 'first_aid_kit') return 'firstAidKit';
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

// Helper function to convert snake_case to camelCase for objects
const toCamelCase = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(toCamelCase);
    
    const result: any = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const camelKey = toCamelCaseString(key);
            result[camelKey] = toCamelCase(obj[key]);
        }
    }
    return result;
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
        const newKey = toSnake ? toSnakeCaseString(key) : toCamelCaseString(key);
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

export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
    try {
        const { data, error } = await supabase
            .from('work_orders')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) {
            console.error('Error fetching work order by ID:', error);
            throw error;
        }
        
        if (!data) return null;
        
        const transformed = transformData([data], false) as WorkOrder[];
        return transformed[0] || null;
    } catch (error) {
        console.error('Error en getWorkOrderById:', error);
        handleSupabaseError(error, 'get work order by id');
        return null;
    }
};

export const createWorkOrder = async (workOrderData: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkOrder> => {
    try {
        // Limpiar datos antes de enviar - eliminar campos vacíos que causan errores
        const cleanedData = { ...workOrderData };
        
        // Extraer client_id y vehicle_id de los objetos client y vehicle
        if (cleanedData.client?.id) {
            cleanedData.clientId = cleanedData.client.id;
            delete cleanedData.client;
        }
        if (cleanedData.vehicle?.id) {
            cleanedData.vehicleId = cleanedData.vehicle.id;
            delete cleanedData.vehicle;
        }
        
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
        // Primero intentar obtener todos los registros y tomar el más reciente
        const { data, error } = await supabase
            .from('app_settings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);
        
        if (error) {
            console.error('❌ Error en getAppSettings:', error);
            
            // Si es error 406 u otro error, usar configuración por defecto
            if (error.code === 'PGRST301' || error.message?.includes('406')) {
                console.warn('⚠️ Error 406 en app_settings, usando configuración por defecto');
                return getDefaultAppSettings();
            }
            
            throw error;
        }
        
        if (data && data.length > 0) {
            return transformData(data[0], false) as AppSettings;
        }
        
        // Si no hay datos, usar configuración por defecto
        return getDefaultAppSettings();
    } catch (error) {
        console.error('❌ Error crítico en getAppSettings:', error);
        return getDefaultAppSettings();
    }
};

// Función para obtener configuración por defecto
const getDefaultAppSettings = (): AppSettings => {
    return {
        id: 'default',
        companyName: 'Autodealer Cloud',
        companyNit: '900123456-7',
        companyLogoUrl: '/images/company/Logo.png',
        companyInfo: {
            address: 'Calle Falsa 123',
            phone: '555-1234',
            email: 'info@autodealer.com'
        },
        billingSettings: {
            currency: 'USD',
            taxRate: 0.19
        },
        operationsSettings: {
            serviceCategories: ['Mecánica General', 'Eléctrico', 'Pintura'],
            inventoryCategories: ['Filtros', 'Aceites', 'Llantas']
        },
        diagnosticSettings: {
            basic: [],
            intermediate: [],
            advanced: []
        },
        createdAt: new Date(),
        updatedAt: new Date()
    };
};

export const updateAppSettings = async (settingsData: Partial<AppSettings>): Promise<AppSettings> => {
    try {
        const transformedData = transformData(settingsData);
        const { data, error } = await supabase
            .from('app_settings')
            .upsert(transformedData)
            .select('*')
            .single();
        
        if (error) {
            console.error('❌ Error en updateAppSettings:', error);
            
            // Si es error 406, intentar crear la tabla o usar configuración por defecto
            if (error.code === 'PGRST301' || error.message?.includes('406')) {
                console.warn('⚠️ Error 406 en updateAppSettings, no se puede guardar');
                // Devolver los datos que se intentaron guardar como si se hubieran guardado
                return {
                    ...getDefaultAppSettings(),
                    ...settingsData,
                    updatedAt: new Date()
                } as AppSettings;
            }
            
            throw error;
        }
        
        return transformData(data, false) as AppSettings;
    } catch (error) {
        console.error('❌ Error crítico en updateAppSettings:', error);
        handleSupabaseError(error, 'update app settings');
        
        // En caso de error, devolver los datos como si se hubieran guardado
        return {
            ...getDefaultAppSettings(),
            ...settingsData,
            updatedAt: new Date()
        } as AppSettings;
    }
};

// Funciones financieras - Conectadas a la base de datos
export const getPettyCashTransactions = async (): Promise<PettyCashTransaction[]> => {
    try {
        console.log('🔍 getPettyCashTransactions - Fetching from Supabase...');
        const { data, error } = await supabase
            .from('petty_cash_transactions')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('❌ getPettyCashTransactions - Supabase error:', error);
            if (error.code === 'PGRST116' || error.message.includes('relation "petty_cash_transactions" does not exist')) {
                console.warn('⚠️ getPettyCashTransactions - Table does not exist. Please run CREATE_ALL_FINANCIAL_TABLES.sql');
                return [];
            }
            throw error;
        }

        console.log('✅ getPettyCashTransactions - Success:', data?.length || 0, 'transactions');
        return data?.map(toCamelCase) || [];
    } catch (error) {
        console.error('❌ getPettyCashTransactions - Error:', error);
        return [];
    }
};

export const getInvoices = async (): Promise<Invoice[]> => {
    try {
        console.log('🔍 getInvoices - Fetching invoices from Supabase...');
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ getInvoices - Supabase error:', error);
            console.error('❌ getInvoices - Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            
            // Si la tabla no existe, devolver array vacío pero loguear el problema
            if (error.code === 'PGRST116' || error.message.includes('relation "invoices" does not exist')) {
                console.warn('⚠️ getInvoices - Table "invoices" does not exist. Please create it using the SQL script provided.');
                return [];
            }
            
            // Si la columna sequential_id no existe, intentar sin ella
            if (error.message.includes('column "sequential_id" does not exist')) {
                console.warn('⚠️ getInvoices - Column "sequential_id" does not exist. Fetching without it...');
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('invoices')
                    .select('id, work_order_id, client_id, client_name, vehicle_summary, issue_date, due_date, subtotal, tax_amount, total, status, location_id, items, notes, payment_terms, vat_included, factoring_info, created_at, updated_at')
                    .order('created_at', { ascending: false });
                    
                if (fallbackError) {
                    console.error('❌ getInvoices - Fallback query also failed:', fallbackError);
                    return [];
                }
                
                console.log('✅ getInvoices - Fallback query successful:', fallbackData?.length || 0);
                return fallbackData || [];
            }
            
            throw error;
        }

        console.log('✅ getInvoices - Successfully fetched invoices:', data?.length || 0);
        console.log('🔍 getInvoices - Raw data:', data);
        
        // Convertir de snake_case a camelCase
        const convertedData = data?.map(invoice => ({
            id: invoice.id,
            workOrderId: invoice.work_order_id,
            clientId: invoice.client_id,
            clientName: invoice.client_name,
            vehicleSummary: invoice.vehicle_summary,
            issueDate: invoice.issue_date,
            dueDate: invoice.due_date,
            subtotal: invoice.subtotal,
            taxAmount: invoice.tax_amount,
            total: invoice.total,
            status: invoice.status as InvoiceStatus,
            locationId: invoice.location_id,
            items: invoice.items,
            notes: invoice.notes,
            paymentTerms: invoice.payment_terms,
            vatIncluded: invoice.vat_included,
            sequentialId: invoice.sequential_id,
            factoringInfo: invoice.factoring_info
        })) || [];
        
        console.log('🔍 getInvoices - Converted data:', convertedData);
        return convertedData;
    } catch (error) {
        console.error('❌ getInvoices - Error fetching invoices:', error);
        return [];
    }
};

export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
    return [];
};

// Función para insertar facturas
// Funciones de inserción para tablas financieras
export const insertPettyCashTransaction = async (transaction: PettyCashTransaction): Promise<PettyCashTransaction | null> => {
    try {
        console.log('🔍 insertPettyCashTransaction - Inserting transaction:', transaction);
        
        const transactionData = {
            id: transaction.id,
            type: transaction.type,
            description: transaction.description,
            amount: transaction.amount,
            date: transaction.date,
            payment_method: transaction.paymentMethod,
            supplier_id: transaction.supplierId,
            payment_partner_id: transaction.paymentPartnerId,
            receipt_image_url: transaction.receiptImageUrl,
            location_id: transaction.locationId,
            account_id: transaction.accountId,
            user_id: transaction.userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('petty_cash_transactions')
            .insert([transactionData])
            .select()
            .single();

        if (error) {
            console.error('❌ insertPettyCashTransaction - Supabase error:', error);
            return null;
        }

        console.log('✅ insertPettyCashTransaction - Success:', data);
        return toCamelCase(data);
    } catch (error) {
        console.error('❌ insertPettyCashTransaction - Error:', error);
        return null;
    }
};

export const insertOperatingExpense = async (expense: OperatingExpense): Promise<OperatingExpense | null> => {
    try {
        console.log('🔍 insertOperatingExpense - Inserting expense:', expense);
        
        const expenseData = {
            id: expense.id,
            description: expense.description,
            category: expense.category,
            amount: expense.amount,
            date: expense.date,
            location_id: expense.locationId,
            account_id: expense.accountId,
            user_id: expense.userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('operating_expenses')
            .insert([expenseData])
            .select()
            .single();

        if (error) {
            console.error('❌ insertOperatingExpense - Supabase error:', error);
            return null;
        }

        console.log('✅ insertOperatingExpense - Success:', data);
        return toCamelCase(data);
    } catch (error) {
        console.error('❌ insertOperatingExpense - Error:', error);
        return null;
    }
};

export const insertFinancialAccount = async (account: FinancialAccount): Promise<FinancialAccount | null> => {
    try {
        console.log('🔍 insertFinancialAccount - Inserting account:', account);
        
        const accountData = {
            id: account.id,
            name: account.name,
            type: account.type,
            location_id: account.locationId,
            assigned_user_ids: account.assignedUserIds,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('financial_accounts')
            .insert([accountData])
            .select()
            .single();

        if (error) {
            console.error('❌ insertFinancialAccount - Supabase error:', error);
            return null;
        }

        console.log('✅ insertFinancialAccount - Success:', data);
        return toCamelCase(data);
    } catch (error) {
        console.error('❌ insertFinancialAccount - Error:', error);
        return null;
    }
};

export const insertLoan = async (loan: Loan): Promise<Loan | null> => {
    try {
        console.log('🔍 insertLoan - Inserting loan:', loan);
        
        const loanData = {
            id: loan.id,
            staff_id: loan.staffId,
            location_id: loan.locationId,
            amount: loan.amount,
            reason: loan.reason,
            issue_date: loan.issueDate,
            deduction_per_pay_period: loan.deductionPerPayPeriod,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('loans')
            .insert([loanData])
            .select()
            .single();

        if (error) {
            console.error('❌ insertLoan - Supabase error:', error);
            return null;
        }

        console.log('✅ insertLoan - Success:', data);
        return toCamelCase(data);
    } catch (error) {
        console.error('❌ insertLoan - Error:', error);
        return null;
    }
};

export const insertLoanPayment = async (payment: LoanPayment): Promise<LoanPayment | null> => {
    try {
        console.log('🔍 insertLoanPayment - Inserting payment:', payment);
        
        const paymentData = {
            id: payment.id,
            loan_id: payment.loanId,
            amount: payment.amount,
            payment_date: payment.paymentDate,
            is_payroll_deduction: payment.isPayrollDeduction,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('loan_payments')
            .insert([paymentData])
            .select()
            .single();

        if (error) {
            console.error('❌ insertLoanPayment - Supabase error:', error);
            return null;
        }

        console.log('✅ insertLoanPayment - Success:', data);
        return toCamelCase(data);
    } catch (error) {
        console.error('❌ insertLoanPayment - Error:', error);
        return null;
    }
};

export const insertTimeClockEntry = async (entry: TimeClockEntry): Promise<TimeClockEntry | null> => {
    try {
        console.log('🔍 insertTimeClockEntry - Inserting entry:', entry);
        
        const entryData = {
            id: entry.id,
            staff_id: entry.staffId,
            type: entry.type,
            timestamp: entry.timestamp,
            location_id: entry.locationId,
            notes: entry.notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('time_clock_entries')
            .insert([entryData])
            .select()
            .single();

        if (error) {
            console.error('❌ insertTimeClockEntry - Supabase error:', error);
            return null;
        }

        console.log('✅ insertTimeClockEntry - Success:', data);
        return toCamelCase(data);
    } catch (error) {
        console.error('❌ insertTimeClockEntry - Error:', error);
        return null;
    }
};

export const insertInvoice = async (invoice: Invoice): Promise<Invoice | null> => {
    try {
        console.log('🔍 insertInvoice - Inserting invoice:', invoice);
        
        // Convertir a snake_case para Supabase
        const invoiceData = {
            id: invoice.id,
            work_order_id: invoice.workOrderId,
            client_id: invoice.clientId,
            client_name: invoice.clientName,
            vehicle_summary: invoice.vehicleSummary,
            issue_date: invoice.issueDate,
            due_date: invoice.dueDate,
            subtotal: invoice.subtotal,
            tax_amount: invoice.taxAmount,
            total: invoice.total,
            status: invoice.status,
            location_id: invoice.locationId,
            items: invoice.items,
            notes: invoice.notes,
            payment_terms: invoice.paymentTerms,
            vat_included: invoice.vatIncluded,
            sequential_id: invoice.sequentialId,
            factoring_info: invoice.factoringInfo,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        console.log('🔍 insertInvoice - Converted data for Supabase:', invoiceData);
        
        const { data, error } = await supabase
            .from('invoices')
            .insert([invoiceData])
            .select()
            .single();

        if (error) {
            console.error('❌ insertInvoice - Supabase error:', error);
            console.error('❌ insertInvoice - Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            
            // Si la tabla no existe, mostrar mensaje de error más claro
            if (error.code === 'PGRST116' || error.message.includes('relation "invoices" does not exist')) {
                console.error('❌ insertInvoice - Table "invoices" does not exist. Please create it first.');
                alert('Error: La tabla de facturas no existe en la base de datos. Por favor, ejecuta el script SQL para crear la tabla.');
                return null;
            }
            
            // Si la columna sequential_id no existe, intentar insertar sin ella
            if (error.message.includes('column "sequential_id" does not exist')) {
                console.warn('⚠️ insertInvoice - Column "sequential_id" does not exist. Inserting without it...');
                const { sequentialId, ...invoiceWithoutSequentialId } = invoice;
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('invoices')
                    .insert([invoiceWithoutSequentialId])
                    .select()
                    .single();
                    
                if (fallbackError) {
                    console.error('❌ insertInvoice - Fallback insert also failed:', fallbackError);
                    alert('Error: No se pudo insertar la factura. Verifica la estructura de la tabla.');
                    return null;
                }
                
                console.log('✅ insertInvoice - Fallback insert successful:', fallbackData);
                return fallbackData;
            }
            
            throw error;
        }

        console.log('✅ insertInvoice - Successfully inserted invoice:', data);
        
        // Convertir de vuelta a camelCase
        const convertedData: Invoice = {
            id: data.id,
            workOrderId: data.work_order_id,
            clientId: data.client_id,
            clientName: data.client_name,
            vehicleSummary: data.vehicle_summary,
            issueDate: data.issue_date,
            dueDate: data.due_date,
            subtotal: data.subtotal,
            taxAmount: data.tax_amount,
            total: data.total,
            status: data.status as InvoiceStatus,
            locationId: data.location_id,
            items: data.items,
            notes: data.notes,
            paymentTerms: data.payment_terms,
            vatIncluded: data.vat_included,
            sequentialId: data.sequential_id,
            factoringInfo: data.factoring_info
        };
        
        console.log('✅ insertInvoice - Converted response:', convertedData);
        return convertedData;
    } catch (error) {
        console.error('❌ insertInvoice - Error inserting invoice:', error);
        return null;
    }
};

export const getOperatingExpenses = async (): Promise<OperatingExpense[]> => {
    try {
        console.log('🔍 getOperatingExpenses - Fetching from Supabase...');
        const { data, error } = await supabase
            .from('operating_expenses')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('❌ getOperatingExpenses - Supabase error:', error);
            if (error.code === 'PGRST116' || error.message.includes('relation "operating_expenses" does not exist')) {
                console.warn('⚠️ getOperatingExpenses - Table does not exist. Please run CREATE_ALL_FINANCIAL_TABLES.sql');
                return [];
            }
            throw error;
        }

        console.log('✅ getOperatingExpenses - Success:', data?.length || 0, 'expenses');
        return data?.map(toCamelCase) || [];
    } catch (error) {
        console.error('❌ getOperatingExpenses - Error:', error);
        return [];
    }
};

export const getFinancialAccounts = async (): Promise<FinancialAccount[]> => {
    try {
        console.log('🔍 getFinancialAccounts - Fetching from Supabase...');
        const { data, error } = await supabase
            .from('financial_accounts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ getFinancialAccounts - Supabase error:', error);
            if (error.code === 'PGRST116' || error.message.includes('relation "financial_accounts" does not exist')) {
                console.warn('⚠️ getFinancialAccounts - Table does not exist. Please run CREATE_ALL_FINANCIAL_TABLES.sql');
                return [];
            }
            throw error;
        }

        console.log('✅ getFinancialAccounts - Success:', data?.length || 0, 'accounts');
        return data?.map(toCamelCase) || [];
    } catch (error) {
        console.error('❌ getFinancialAccounts - Error:', error);
        return [];
    }
};

export const getTimeClockEntries = async (): Promise<TimeClockEntry[]> => {
    try {
        console.log('🔍 getTimeClockEntries - Fetching from Supabase...');
        const { data, error } = await supabase
            .from('time_clock_entries')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) {
            console.error('❌ getTimeClockEntries - Supabase error:', error);
            if (error.code === 'PGRST116' || error.message.includes('relation "time_clock_entries" does not exist')) {
                console.warn('⚠️ getTimeClockEntries - Table does not exist. Please run CREATE_ALL_FINANCIAL_TABLES.sql');
                return [];
            }
            throw error;
        }

        console.log('✅ getTimeClockEntries - Success:', data?.length || 0, 'entries');
        return data?.map(toCamelCase) || [];
    } catch (error) {
        console.error('❌ getTimeClockEntries - Error:', error);
        return [];
    }
};

export const getLoans = async (): Promise<Loan[]> => {
    try {
        console.log('🔍 getLoans - Fetching from Supabase...');
        const { data, error } = await supabase
            .from('loans')
            .select('*')
            .order('issue_date', { ascending: false });

        if (error) {
            console.error('❌ getLoans - Supabase error:', error);
            if (error.code === 'PGRST116' || error.message.includes('relation "loans" does not exist')) {
                console.warn('⚠️ getLoans - Table does not exist. Please run CREATE_ALL_FINANCIAL_TABLES.sql');
                return [];
            }
            throw error;
        }

        console.log('✅ getLoans - Success:', data?.length || 0, 'loans');
        return data?.map(toCamelCase) || [];
    } catch (error) {
        console.error('❌ getLoans - Error:', error);
        return [];
    }
};

export const getLoanPayments = async (): Promise<LoanPayment[]> => {
    try {
        console.log('🔍 getLoanPayments - Fetching from Supabase...');
        const { data, error } = await supabase
            .from('loan_payments')
            .select('*')
            .order('payment_date', { ascending: false });

        if (error) {
            console.error('❌ getLoanPayments - Supabase error:', error);
            if (error.code === 'PGRST116' || error.message.includes('relation "loan_payments" does not exist')) {
                console.warn('⚠️ getLoanPayments - Table does not exist. Please run CREATE_ALL_FINANCIAL_TABLES.sql');
                return [];
            }
            throw error;
        }

        console.log('✅ getLoanPayments - Success:', data?.length || 0, 'payments');
        return data?.map(toCamelCase) || [];
    } catch (error) {
        console.error('❌ getLoanPayments - Error:', error);
        return [];
    }
};

export const getNotifications = async (): Promise<Notification[]> => {
    return [];
};

export const getAppointments = async (): Promise<Appointment[]> => {
    try {
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .order('appointment_date_time', { ascending: true });
        
        if (error) {
            console.error('Error fetching appointments:', error);
            throw error;
        }
        
        return transformData(data, false) as Appointment[];
    } catch (error) {
        console.error('Error en getAppointments:', error);
        handleSupabaseError(error, 'get appointments');
        return [];
    }
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
    getWorkOrderById,
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
    
    // Financial functions
    getPettyCashTransactions,
    insertPettyCashTransaction,
    getOperatingExpenses,
    insertOperatingExpense,
    getFinancialAccounts,
    insertFinancialAccount,
    getTimeClockEntries,
    insertTimeClockEntry,
    getLoans,
    insertLoan,
    getLoanPayments,
    insertLoanPayment,
    
    // Invoices
    getInvoices,
    insertInvoice,
    
    // Other functions
    getPurchaseOrders,
    getNotifications,
    getAppointments,
    insertNotification,
    uploadFileToStorage,
};