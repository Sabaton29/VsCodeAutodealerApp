





import React, { useContext, useMemo, lazy, Suspense } from 'react';
import { DataContext } from './components/DataContext';
import { UIContext } from './components/UIContext';
import { usePermissions } from './hooks/usePermissions';
import { getQuoteDisplayId } from './utils/quoteId';

// Core components - loaded immediately
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Modal from './components/Modal';

// Lazy load heavy components for code splitting
const CreateWorkOrderForm = lazy(() => import('./components/CreateWorkOrderForm'));
const EditWorkOrderForm = lazy(() => import('./components/EditWorkOrderForm'));
const AddClientForm = lazy(() => import('./components/AddClientForm'));
const AddVehicleForm = lazy(() => import('./components/AddVehicleForm'));
const AddStaffForm = lazy(() => import('./components/AddStaffForm'));
const AddServiceForm = lazy(() => import('./components/AddServiceForm'));
const AddInventoryItemForm = lazy(() => import('./components/AddInventoryItemForm'));
const AddSupplierForm = lazy(() => import('./components/AddSupplierForm'));
const AddTransactionForm = lazy(() => import('./components/AddTransactionForm'));
const AddOperatingExpenseForm = lazy(() => import('./components/AddOperatingExpenseForm'));
const RegisterPaymentForm = lazy(() => import('./components/RegisterPaymentForm'));
const DiagnosticChecklistModal = lazy(() => import('./components/DiagnosticChecklistModal'));
const CreateQuoteForm = lazy(() => import('./components/CreateQuoteForm'));
const ApproveQuoteForm = lazy(() => import('./components/ApproveQuoteForm'));

// SOLUCIÓN SIMPLE: Usar directamente getQuoteWithItems en ApproveQuoteForm
// No necesitamos un wrapper complejo
const CreatePurchaseOrderForm = lazy(() => import('./components/CreatePurchaseOrderForm'));
const QuickAddItemFlow = lazy(() => import('./components/QuickAddItemFlow'));
const RegisterDeliveryForm = lazy(() => import('./components/RegisterDeliveryForm'));
const AddLocationForm = lazy(() => import('./components/AddLocationForm'));
const PermissionsModal = lazy(() => import('./components/PermissionsModal'));
const CategoryForm = lazy(() => import('./components/CategoryForm'));
const AddFinancialAccountForm = lazy(() => import('./components/AddFinancialAccountForm'));
const AssignAccountsModal = lazy(() => import('./components/AssignAccountsModal'));
const FinancialSettings = lazy(() => import('./components/FinancialSettings'));
const ManageCommissionsModal = lazy(() => import('./components/ManageCommissionsModal'));
const FactorInvoiceForm = lazy(() => import('./components/FactorInvoiceForm'));
const ReleaseRetentionModal = lazy(() => import('./components/ReleaseRetentionModal'));
const CreateManualQuoteForm = lazy(() => import('./components/CreateManualQuoteForm'));
const SelectDiagnosticTypeModal = lazy(() => import('./components/SelectDiagnosticTypeModal'));
const AddLoanForm = lazy(() => import('./components/AddLoanForm'));
const AddLoanPaymentForm = lazy(() => import('./components/AddLoanPaymentForm'));
const ReportUnforeseenIssueModal = lazy(() => import('./components/ReportUnforeseenIssueModal'));
const TransactionDetailModal = lazy(() => import('./components/TransactionDetailModal'));
const ShareClientPortalModal = lazy(() => import('./components/ShareClientPortalModal'));
const AddAppointmentForm = lazy(() => import('./components/AddAppointmentForm'));

// Lazy load views
const ClientsView = lazy(() => import('./components/views/ClientsView'));
const VehiclesView = lazy(() => import('./components/views/VehiclesView'));
const InventoryView = lazy(() => import('./components/views/InventoryView'));
const ServicesCatalogView = lazy(() => import('./components/views/ServicesCatalogView'));
const SuppliersView = lazy(() => import('./components/views/SuppliersView'));
const BillingView = lazy(() => import('./components/views/BillingView'));
const FinanceView = lazy(() => import('./components/views/FinanceView'));
const StaffView = lazy(() => import('./components/views/StaffView'));
const ReportsView = lazy(() => import('./components/views/ReportsView'));
const EnvironmentalView = lazy(() => import('./components/views/EnvironmentalView'));
const SettingsView = lazy(() => import('./components/views/SettingsView'));
const WorkOrdersView = lazy(() => import('./components/views/WorkOrdersView'));
const QuotesView = lazy(() => import('./components/views/QuotesView'));
const QuoteDetailView = lazy(() => import('./components/views/QuoteDetailView'));
const ClientDetailView = lazy(() => import('./components/views/ClientDetailView'));
const VehicleDetailView = lazy(() => import('./components/views/VehicleDetailView'));
const PurchaseOrdersView = lazy(() => import('./components/views/PurchaseOrdersView'));
const PurchaseOrderDetailView = lazy(() => import('./components/views/PurchaseOrderDetailView'));
const InvoiceDetailView = lazy(() => import('./components/views/InvoiceDetailView'));
const StaffDetailView = lazy(() => import('./components/views/StaffDetailView'));
const ClientPortalView = lazy(() => import('./components/views/ClientPortalView'));
const AppointmentsView = lazy(() => import('./components/views/AppointmentsView'));
const WorkOrderDetailView = lazy(() => import('./components/views/WorkOrderDetailView'));

import { STAGE_DISPLAY_CONFIG } from './constants';
import { QuoteItem, Quote, DiagnosticType, Notification } from './types';

// Loading spinner component
const LoadingSpinner: React.FC = () => (
    <div className="flex h-full w-full items-center justify-center">
        <div className="text-white">Cargando...</div>
    </div>
);

const viewComponents: { [key: string]: React.FC<any> } = {
    'Dashboard': Dashboard, 'Órdenes de Trabajo': WorkOrdersView, 'Citas': AppointmentsView, 'Clientes': ClientsView,
    'Vehículos': VehiclesView, 'Inventario': InventoryView, 'Catálogo de Servicios': ServicesCatalogView,
    'Proveedores': SuppliersView, 'Órdenes de Compra': PurchaseOrdersView, 'Facturación': BillingView,
    'Cotizaciones': QuotesView, 'Finanzas': FinanceView, 'Personal': StaffView,
    'Reportes': ReportsView, 'Gestión Ambiental': EnvironmentalView, 'Ajustes': SettingsView,
};

const AppContent: React.FC = () => {
    const data = useContext(DataContext);
    const ui = useContext(UIContext);

    // --- Client Portal Routing ---
    const path = window.location.pathname;
    const portalMatch = path.match(/\/portal\/([^/]+)/);

    if (portalMatch) {
        const workOrderId = portalMatch[1];
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!data || data.isLoading) {
             return (
                <div className="flex h-screen w-full items-center justify-center bg-dark text-white">
                    Cargando portal...
                </div>
            );
        }
        return <ClientPortalView workOrderId={workOrderId} token={token} />;
    }
    // --- End Client Portal Routing ---
    
    if (!data || !ui) {
        throw new Error('App must be used within DataProvider and UIProvider');
    }

    const { hasPermission } = usePermissions(ui.currentUser);

    const {
        viewingWorkOrderId, viewingQuoteId, viewingClientId, viewingVehicleId, viewingPurchaseOrderId, viewingInvoiceId, viewingStaffId, setView,
        modalState, closeModal, openModal,
    } = ui;
    const { 
        workOrders, clients, vehicles, quotes, invoices, purchaseOrders, inventoryItems, services, 
        suppliers, locations, staffMembers, pettyCashTransactions, operatingExpenses, financialAccounts,
        appSettings, timeClockEntries, loans, loanPayments, notifications, appointments,
        handleClockIn, handleClockOut,
        handleSaveAppSettings, handleSaveLocation, handleDeleteLocation, handleUpdateStaffRole,
        handleUpdateStaffPermissions, handleSaveServiceCategory, handleDeleteServiceCategory,
        handleSaveInventoryCategory, handleDeleteInventoryCategory, handleSaveFinancialAccount, handleDeleteFinancialAccount, handleAssignAccountsToUser,
        handleMarkNotificationAsRead, handleMarkAllNotificationsAsRead,
        handleUpdateWorkOrderDiagnosticType,
    } = data;

    // Memoized filtered data based on selected location
    const ALL = 'ALL_LOCATIONS';
    // Debug logging removed for production
    
    // Optimize: Create lookup maps to avoid O(n²) complexity
    const clientsMap = useMemo(() => new Map(clients.map(c => [c.id, c])), [clients]);
    const vehiclesMap = useMemo(() => new Map(vehicles.map(v => [v.id, v])), [vehicles]);
    
    const filteredWorkOrders = useMemo(() => {
        let filtered = workOrders;
        
        // Filtrar por ubicación si no es vista global
        if (ui.selectedLocationId !== 'ALL_LOCATIONS') {
            filtered = filtered.filter(wo => wo.locationId === ui.selectedLocationId);
        }
        
        // Use map lookup instead of find() for O(1) complexity
        filtered = filtered.map(wo => ({
            ...wo,
            client: clientsMap.get(wo.clientId),
            vehicle: vehiclesMap.get(wo.vehicleId),
        }));
        
        return filtered;
    }, [workOrders, clientsMap, vehiclesMap, ui.selectedLocationId]);
    const filteredClients = useMemo(() => {
        // Also populate vehicles for each client
        let filtered = clients;
        
        // Filtrar por ubicación si no es vista global
        if (ui.selectedLocationId !== 'ALL_LOCATIONS') {
            filtered = filtered.filter(c => c.locationId === ui.selectedLocationId);
        }
        
        filtered = filtered.map(client => ({
            ...client,
            vehicles: vehicles.filter(v => v.clientId === client.id),
        }));
        
        return filtered;
    }, [clients, vehicles, ui.selectedLocationId]);
    const filteredQuotes = useMemo(() => {
        if (ui.selectedLocationId === 'ALL_LOCATIONS') {
            return quotes;
        }
        return quotes.filter(q => q.locationId === ui.selectedLocationId);
    }, [quotes, ui.selectedLocationId]);
    const filteredInvoices = useMemo(() => {
        
        
        if (ui.selectedLocationId === 'ALL_LOCATIONS') {
            return invoices;
        }
        
        // Filtro para sedes específicas: solo incluir facturas con locationId coincidente
        const filtered = invoices.filter(i => {
            // Solo incluir facturas que tengan locationId y coincida con la sede seleccionada
            if (!i.locationId) {
                return false; // Excluir facturas sin locationId de filtros específicos
            }
            const matches = i.locationId === ui.selectedLocationId;
            return matches;
        });
        return filtered;
    }, [invoices, ui.selectedLocationId]);
    const filteredPurchaseOrders = useMemo(() => {
        // TEMPORARY FIX: Show all data since locationId is undefined in Supabase
        return purchaseOrders;
    }, [purchaseOrders, ui.selectedLocationId]);
    const filteredInventoryItems = useMemo(() => {
        if (ui.selectedLocationId === 'ALL_LOCATIONS') {
            return inventoryItems;
        }
        return inventoryItems.filter(i => i.locationId === ui.selectedLocationId);
    }, [inventoryItems, ui.selectedLocationId]);
    const filteredServices = useMemo(() => {
        if (ui.selectedLocationId === 'ALL_LOCATIONS') {
            return services;
        }
        return services.filter(s => s.locationId === ui.selectedLocationId);
    }, [services, ui.selectedLocationId]);
    const filteredSuppliers = useMemo(() => {
        if (ui.selectedLocationId === 'ALL_LOCATIONS') {
            return suppliers;
        }
        return suppliers.filter(s => s.locationId === ui.selectedLocationId);
    }, [suppliers, ui.selectedLocationId]);
    const filteredStaff = useMemo(() => {
        if (ui.selectedLocationId === 'ALL_LOCATIONS') {
            return staffMembers;
        }
        return staffMembers.filter(s => s.locationId === ui.selectedLocationId);
    }, [staffMembers, ui.selectedLocationId]);
    const filteredPettyCash = useMemo(() => {
        if (ui.selectedLocationId === 'ALL_LOCATIONS') {
            return pettyCashTransactions;
        }
        return pettyCashTransactions.filter(p => p.locationId === ui.selectedLocationId);
    }, [pettyCashTransactions, ui.selectedLocationId]);
    const filteredOperatingExpenses = useMemo(() => {
        if (ui.selectedLocationId === 'ALL_LOCATIONS') {
            return operatingExpenses;
        }
        return operatingExpenses.filter(o => o.locationId === ui.selectedLocationId);
    }, [operatingExpenses, ui.selectedLocationId]);
    const filteredFinancialAccounts = useMemo(() => {
        if (ui.selectedLocationId === 'ALL_LOCATIONS') {
            return financialAccounts;
        }
        return financialAccounts.filter(f => f.locationId === ui.selectedLocationId);
    }, [financialAccounts, ui.selectedLocationId]);
    const filteredVehicles = useMemo(() => {
        if (ui.selectedLocationId === 'ALL_LOCATIONS') {
            return vehicles;
        }
        return vehicles.filter(v => v.locationId === ui.selectedLocationId);
    }, [vehicles, ui.selectedLocationId]);


    const viewingWorkOrder = useMemo(() => workOrders.find(wo => wo.id === viewingWorkOrderId), [viewingWorkOrderId, workOrders]);
    const viewingWorkOrderQuotes = useMemo(() => {
        if (!viewingWorkOrder) return [];
        
        // Filtrar cotizaciones por workOrderId (relación directa)
        const directQuotes = quotes.filter(q => q.workOrderId === viewingWorkOrder.id);
        
        // También incluir cotizaciones vinculadas por linkedQuoteIds (para compatibilidad)
        const linkedQuotes = quotes.filter(q => (viewingWorkOrder.linkedQuoteIds || []).includes(q.id));
        
        // Combinar y eliminar duplicados usando Set para mejor performance
        const quoteIds = new Set<string>();
        const uniqueQuotes = [...directQuotes, ...linkedQuotes].filter(quote => {
            if (quoteIds.has(quote.id)) return false;
            quoteIds.add(quote.id);
            return true;
        });
        
        return uniqueQuotes;
    }, [viewingWorkOrder, quotes]);
    const viewingQuote = useMemo(() => quotes.find(q => q.id === viewingQuoteId), [viewingQuoteId, quotes]);
    const viewingClient = useMemo(() => clients.find(c => c.id === viewingClientId), [viewingClientId, clients]);
    const viewingVehicle = useMemo(() => vehicles.find(v => v.id === viewingVehicleId), [viewingVehicleId, vehicles]);
    const viewingPurchaseOrder = useMemo(() => purchaseOrders.find(po => po.id === viewingPurchaseOrderId), [viewingPurchaseOrderId, purchaseOrders]);
    const viewingInvoice = useMemo(() => invoices.find(i => i.id === viewingInvoiceId), [viewingInvoiceId, invoices]);
    const viewingStaffMember = useMemo(() => staffMembers.find(s => s.id === viewingStaffId), [viewingStaffId, staffMembers]);

    const handleStartDiagnostic = (workOrderId: string) => {
        const workOrder = workOrders.find(wo => wo.id === workOrderId);
        if (!workOrder) return;

        if (workOrder.diagnosticType) {
            // If type is already defined, go straight to the checklist
            openModal('DIAGNOSTIC_CHECKLIST', { ...workOrder, diagnosticType: workOrder.diagnosticType });
        } else {
            // Otherwise, ask the technician to select one
            openModal('SELECT_DIAGNOSTIC_TYPE', workOrder);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (notification.workOrderId) {
            setView('workOrder', notification.workOrderId);
        }
        handleMarkNotificationAsRead(notification.id);
    };

    const renderActiveView = () => {
        if (viewingWorkOrder) return <Suspense fallback={<LoadingSpinner />}><WorkOrderDetailView 
            workOrder={viewingWorkOrder} 
            quotes={viewingWorkOrderQuotes}
            onBack={() => setView(null, null)}
            client={data.clients.find(c => c.id === viewingWorkOrder.clientId)}
            vehicle={data.vehicles.find(v => v.id === viewingWorkOrder.vehicleId)}
            stageConfig={STAGE_DISPLAY_CONFIG[viewingWorkOrder.stage]}
            hasPermission={hasPermission}
            onCreateQuote={(wo, isAdditional) => {
                openModal('CREATE_QUOTE', { workOrder: wo, initialItems: isAdditional ? [] : wo.recommendedItems, isAdditional });
            }}
            onShareWithClient={() => openModal('SHARE_CLIENT_PORTAL', { workOrder: viewingWorkOrder, client: data.clients.find(c => c.id === viewingWorkOrder.clientId) })}
            onCreateInvoiceFromWorkOrder={async(workOrderId) => {
                try {
                    
                    // Buscar la orden de trabajo
                    const workOrder = data.workOrders.find(wo => wo.id === workOrderId);
                    const client = data.clients.find(c => c.id === workOrder?.clientId);
                    
                    console.debug('🔍 Client and Vehicle debug:', {
                        workOrderId,
                        workOrder: workOrder ? { id: workOrder.id, clientId: workOrder.clientId, vehicle: workOrder.vehicle } : null,
                        client: client ? { id: client.id, name: client.name } : null,
                        allClients: data.clients.map(c => ({ id: c.id, name: c.name })),
                    });
                    
                    if (!workOrder || !client) {
                        console.warn('No se encontró la orden de trabajo o el cliente.');
                        return;
                    }

                    // Debug: Ver estructura de workOrder
                    console.debug('🔍 WorkOrder structure:', {
                        id: workOrder.id,
                        clientId: workOrder.clientId,
                        vehicle: workOrder.vehicle,
                        locationId: workOrder.locationId,
                        locationIdType: typeof workOrder.locationId,
                        linkedQuoteIds: workOrder.linkedQuoteIds,
                    });
                    
                    // Debug: Verificar locationId del workOrder
                    if (!workOrder.locationId) {
                        console.warn('⚠️ WorkOrder no tiene locationId:', workOrder);
                        // Usar la ubicación seleccionada como fallback
                        workOrder.locationId = ui.selectedLocationId;
                        console.debug('🔧 Usando selectedLocationId como fallback:', ui.selectedLocationId);
                    }

                    // Debug: Ver qué cotizaciones tenemos
                    console.debug('🔍 WorkOrder linkedQuoteIds:', workOrder.linkedQuoteIds);
                    console.debug('🔍 WorkOrder ID:', workOrderId);
                    console.debug('🔍 All quotes:', data.quotes.map(q => ({ 
                        id: q.id, 
                        status: q.status, 
                        workOrderId: q.workOrderId,
                        clientId: q.clientId,
                        total: q.total,
                    })));
                    
                    // Debug detallado de cotizaciones
                    console.debug('🔍 WorkOrder clientId:', workOrder.clientId);
                    console.debug('🔍 All quotes detailed:', data.quotes.map(q => ({ 
                        id: q.id, 
                        status: q.status, 
                        workOrderId: q.workOrderId,
                        clientId: q.clientId,
                        total: q.total,
                        linkedInvoiceId: q.linkedInvoiceId,
                    })));
                    
                    // Debug del filtro paso a paso
                    const clientQuotesStep1 = data.quotes.filter(q => q.clientId === workOrder.clientId);
                    
                    
                    const clientQuotesStep2 = clientQuotesStep1.filter(q => q.status?.trim().toUpperCase() === 'APROBADO');
                    
                    const clientQuotesStep3 = clientQuotesStep2.filter(q => !q.linkedInvoiceId);
                    
                    
                    // Buscar cotizaciones aprobadas para este cliente
                    const clientQuotes = data.quotes.filter(q => 
                        q.clientId === workOrder.clientId &&
                        q.status?.trim().toUpperCase() === 'APROBADO' &&
                        !q.linkedInvoiceId,
                    );
                    console.debug('🔍 Client approved quotes (final):', clientQuotes);
                    
                    // Buscar TODAS las cotizaciones del cliente (sin filtro de status)
                    const allClientQuotes = data.quotes.filter(q => 
                        q.clientId === workOrder.clientId,
                    );
                    console.debug('🔍 All client quotes (any status):', allClientQuotes);
                    
                    // Buscar cotizaciones aprobadas y no facturadas
                    let quotesToInvoice = data.quotes.filter(q => 
                        (workOrder.linkedQuoteIds || []).includes(q.id) &&
                        q.status?.trim().toUpperCase() === 'APROBADO' &&
                        !q.linkedInvoiceId,
                    );

                    console.debug('🔍 Quotes to invoice:', quotesToInvoice);

                    if (quotesToInvoice.length === 0) {
                        // Buscar cotizaciones por workOrderId como alternativa
                        const alternativeQuotes = data.quotes.filter(q => 
                            q.workOrderId === workOrderId &&
                            q.status?.trim().toUpperCase() === 'APROBADO' &&
                            !q.linkedInvoiceId,
                        );
                        
                        console.debug('🔍 Alternative quotes by workOrderId:', alternativeQuotes);
                        
                        if (alternativeQuotes.length === 0) {
                            // Si no hay por workOrderId, usar las cotizaciones del cliente
                            if (clientQuotes.length > 0) {
                                console.debug('🔍 Using client quotes instead:', clientQuotes);
                                quotesToInvoice = clientQuotes;
                            } else if (allClientQuotes.length > 0) {
                                // Si hay cotizaciones del cliente pero no están aprobadas, mostrar info
                                console.debug('🔍 Client has quotes but none are approved:', allClientQuotes);
                                console.warn(`El cliente tiene ${allClientQuotes.length} cotización(es), pero ninguna está aprobada.`);
                                return;
                            } else {
                                console.warn('No hay cotizaciones aprobadas pendientes de facturar para esta orden.');
                                return;
                            }
                        } else {
                            // Usar las cotizaciones encontradas por workOrderId
                            quotesToInvoice = alternativeQuotes;
                        }
                    }
                    
                    // Asegurar que tenemos cotizaciones para facturar
                    if (quotesToInvoice.length === 0) {
                        console.debug('🔍 No quotes to invoice, trying client quotes as fallback');
                        if (clientQuotes.length > 0) {
                            quotesToInvoice = clientQuotes;
                            console.debug('🔍 Using client quotes as final fallback:', quotesToInvoice);
                        } else {
                            console.warn('No hay cotizaciones aprobadas pendientes de facturar para esta orden.');
                            return;
                        }
                    }

                    // Consolidar todos los ítems
                    const allItems = quotesToInvoice.flatMap(q => q.items);
                    console.debug('🔍 All items for invoice:', allItems);
                    
                    const subtotal = allItems.reduce((sum, item) => {
                        const unitPrice = Number(item.unitPrice) || 0;
                        const quantity = Number(item.quantity) || 0;
                        const discount = Number(item.discount) || 0;
                        const itemTotal = (unitPrice * quantity) - discount;
                        console.debug(`🔍 Item calculation: ${item.description} - Price: ${unitPrice}, Qty: ${quantity}, Discount: ${discount}, Total: ${itemTotal}`);
                        return sum + itemTotal;
                    }, 0);
                    
                    const taxAmount = allItems.reduce((sum, item) => {
                        const unitPrice = Number(item.unitPrice) || 0;
                        const quantity = Number(item.quantity) || 0;
                        const discount = Number(item.discount) || 0;
                        const taxRate = Number(item.taxRate) || 0;
                        const itemSubtotal = (unitPrice * quantity) - discount;
                        const itemTax = itemSubtotal * (taxRate / 100);
                        return sum + itemTax;
                    }, 0);
                    
                    console.debug('🔍 Calculated values:', {
                        subtotal,
                        taxAmount,
                        total: subtotal + taxAmount,
                        subtotalType: typeof subtotal,
                        taxAmountType: typeof taxAmount,
                    });
                    
                    const issueDate = new Date();
                    const dueDate = new Date(issueDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 días

                    const newInvoice = {
                        id: `INV-${String(data.invoices.length + 1).padStart(3, '0')}`,
                        work_order_id: workOrderId,
                        client_id: client.id,
                        client_name: client.name || 'Cliente no especificado',
                        vehicle_summary: workOrder.vehicle ? 
                            `${workOrder.vehicle.make} ${workOrder.vehicle.model} (${workOrder.vehicle.plate})` : 
                            'Vehículo no especificado',
                        issue_date: issueDate.toISOString().split('T')[0],
                        due_date: dueDate.toISOString().split('T')[0],
                        subtotal: Number(subtotal) || 0,
                        tax_amount: Number(taxAmount) || 0,
                        total: Number(subtotal + taxAmount) || 0,
                        status: 'PENDIENTE',
                        location_id: workOrder.locationId || ui.selectedLocationId, // Fallback al selectedLocationId
                        items: allItems,
                        notes: quotesToInvoice.map(q => q.notes).filter(Boolean).join('\n---\n'),
                        payment_terms: client.paymentTerms || '30 días',
                        vat_included: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    };

                    console.debug('🔍 New invoice location_id:', {
                        location_id: newInvoice.location_id,
                        workOrderLocationId: workOrder.locationId,
                        selectedLocationId: ui.selectedLocationId,
                    });

                    // Insertar factura usando el servicio existente
                    console.debug('🔍 Final newInvoice object before insertion:', {
                        id: newInvoice.id,
                        client_name: newInvoice.client_name,
                        vehicle_summary: newInvoice.vehicle_summary,
                        issue_date: newInvoice.issue_date,
                        due_date: newInvoice.due_date,
                        subtotal: newInvoice.subtotal,
                        tax_amount: newInvoice.tax_amount,
                        total: newInvoice.total,
                        location_id: newInvoice.location_id,
                        items_count: newInvoice.items?.length || 0,
                        first_item: newInvoice.items?.[0],
                    });
                    
                    console.debug('🔍 Invoice subtotal type and value:', {
                        subtotal: newInvoice.subtotal,
                        subtotalType: typeof newInvoice.subtotal,
                        tax_amount: newInvoice.tax_amount,
                        tax_amountType: typeof newInvoice.tax_amount,
                        total: newInvoice.total,
                        totalType: typeof newInvoice.total,
                    });
                    
                    try {
                        await data.handleCreateInvoice(newInvoice);
                        console.debug('✅ Invoice created successfully in database');
                    } catch (dbError) {
                        console.error('❌ Database error details:', {
                            message: dbError.message,
                            code: dbError.code,
                            details: dbError.details,
                            hint: dbError.hint,
                            fullError: dbError,
                        });
                        throw dbError; // Re-throw to be caught by outer catch
                    }
                    
                    // Actualizar cotizaciones a FACTURADO
                    for (const quote of quotesToInvoice) {
                        await data.handleSaveQuote(quote.id, {
                            status: 'FACTURADO',
                            linkedInvoiceId: newInvoice.id,
                        });
                    }

                    // Actualizar orden de trabajo (simplificado para evitar errores de array)
                    try {
                        // Crear una copia local del workOrderId para evitar modificaciones
                        const localWorkOrderId = String(workOrderId);
                        
                        console.debug('🔍 About to update work order:', { 
                            originalWorkOrderId: workOrderId,
                            localWorkOrderId,
                            workOrderIdType: typeof workOrderId,
                            localWorkOrderIdType: typeof localWorkOrderId,
                            workOrderExists: !!workOrder,
                            workOrderIdFromWorkOrder: workOrder?.id,
                        });
                        
                        if (!localWorkOrderId || localWorkOrderId === 'undefined' || localWorkOrderId === 'null') {
                            console.warn('⚠️ localWorkOrderId is undefined or invalid, skipping work order update');
                            throw new Error(`localWorkOrderId is invalid: ${localWorkOrderId}`);
                        }
                        
                        await data.handleSaveWorkOrder(localWorkOrderId, {
                            status: 'FACTURADO',
                            stage: 'ENTREGADO',
                        });
                        console.debug('✅ Work order updated successfully');
                    } catch (workOrderError) {
                        console.error('❌ Error updating work order (non-critical):', workOrderError);
                        // No lanzar error aquí, la factura ya se creó exitosamente
                    }

                    console.warn(`¡Factura ${newInvoice.id} creada exitosamente!`);
                    
                } catch (error) {
                    console.error('Error creating invoice:', error);
                    console.warn('Error al crear la factura. Por favor intente nuevamente.');
                }
            }}
            onViewQuote={(id) => setView('quote', id)}
            onEditQuote={(quote) => openModal('EDIT_QUOTE', quote)}
            onRegisterCosts={(workOrderId, costs) => {
                console.debug('🔍 App.tsx - onRegisterCosts called with:', { workOrderId, costs });
                console.debug('🔍 App.tsx - data.handleRegisterItemCosts:', data.handleRegisterItemCosts);
                return data.handleRegisterItemCosts(workOrderId, costs);
            }}
            suppliers={suppliers}
            appSettings={appSettings}
            onReportUnforeseenIssue={() => openModal('REPORT_UNFORESEEN_ISSUE', viewingWorkOrder)}
            staffMembers={staffMembers}
            onUpdateDiagnosticType={handleUpdateWorkOrderDiagnosticType}
            onStartDiagnostic={handleStartDiagnostic}
        /></Suspense>;

        if (viewingQuote) {
            const workOrderForQuote = workOrders.find(wo => wo.id === viewingQuote.workOrderId);
            const clientForQuote = workOrderForQuote ? data.clients.find(c => c.id === workOrderForQuote.clientId) : data.clients.find(c => c.id === viewingQuote.clientId);
            const vehicleForQuote = workOrderForQuote ? data.vehicles.find(v => v.id === workOrderForQuote.vehicleId) : data.vehicles.find(v => v.clientId === clientForQuote?.id && `${v.make} ${v.model} (${v.plate})` === viewingQuote.vehicleSummary);
            
            return <Suspense fallback={<LoadingSpinner />}><QuoteDetailView 
                quote={viewingQuote} 
                workOrder={workOrderForQuote}
                client={clientForQuote}
                vehicle={vehicleForQuote}
                onBack={() => setView(null, null)}
                onApprove={(quoteToApprove) => openModal('APPROVE_QUOTE', quoteToApprove)}
                onReject={data.handleRejectQuote}
                hasPermission={hasPermission}
                inventoryItems={inventoryItems}
                onEditQuote={(quote) => openModal('EDIT_QUOTE', quote)}
                appSettings={appSettings}
                getQuoteWithItems={data.handleGetQuoteWithItems}
            /></Suspense>;
        }
        
        if (viewingInvoice) {
            // Use the enriched invoice from the invoices list, or load it fresh if needed
            const enrichedInvoice = invoices.find(inv => inv.id === viewingInvoice.id) || viewingInvoice;
            const workOrderForInvoice = workOrders.find(wo => wo.id === enrichedInvoice.workOrderId);
            const vehicleForInvoice = workOrderForInvoice?.vehicleId ? vehicles.find(v => v.id === workOrderForInvoice.vehicleId) : undefined;
            const clientForInvoice = data.clients.find(c => c.id === enrichedInvoice.clientId);
            
            console.debug('🔍 Loading InvoiceDetailView with data:', {
                viewingInvoice: {
                    id: viewingInvoice.id,
                    workOrderId: viewingInvoice.workOrderId,
                    clientId: viewingInvoice.clientId,
                },
                workOrderForInvoice: workOrderForInvoice ? {
                    id: workOrderForInvoice.id,
                    vehicleId: workOrderForInvoice.vehicleId,
                    clientId: workOrderForInvoice.clientId,
                } : null,
                vehicleForInvoice: vehicleForInvoice ? {
                    id: vehicleForInvoice.id,
                    make: vehicleForInvoice.make,
                    model: vehicleForInvoice.model,
                } : null,
                clientForInvoice: clientForInvoice ? {
                    id: clientForInvoice.id,
                    name: clientForInvoice.name,
                } : null,
            });
            
            return <Suspense fallback={<LoadingSpinner />}><InvoiceDetailView
                invoice={enrichedInvoice}
                workOrder={workOrderForInvoice}
                client={clientForInvoice}
                vehicle={vehicleForInvoice}
                appSettings={appSettings}
                onBack={() => setView(null, null)}
                openModal={openModal}
                handleToggleInvoiceVat={data.handleToggleInvoiceVat}
            /></Suspense>;
        }

        if (viewingClient) {
            const clientVehicles = vehicles.filter(v => v.clientId === viewingClient.id);
            const clientWorkOrders = workOrders.filter(wo => wo.clientId === viewingClient.id);
            const clientInvoices = invoices.filter(i => i.clientId === viewingClient.id);
            const clientQuotes = quotes.filter(q => q.clientId === viewingClient.id);
            return <Suspense fallback={<LoadingSpinner />}><ClientDetailView 
                client={viewingClient} 
                vehicles={clientVehicles}
                workOrders={clientWorkOrders}
                invoices={clientInvoices}
                quotes={clientQuotes}
                onBack={() => setView(null, null)}
                onEditClient={(client) => openModal('EDIT_CLIENT', client)}
                onAddNewVehicle={(clientId) => openModal('EDIT_VEHICLE', { vehicle: 'new', clientId })}
                onViewWorkOrder={(id) => setView('workOrder', id)}
                onViewQuote={(id) => setView('quote', id)}
                hasPermission={hasPermission}
            /></Suspense>;
        }

        if (viewingVehicle) {
            const vehicleWorkOrders = workOrders.filter(wo => wo.vehicleId === viewingVehicle.id);
            const vehicleInvoices = invoices.filter(i => vehicleWorkOrders.some(wo => wo.id === i.workOrderId));
            const vehicleQuotes = quotes.filter(q => vehicleWorkOrders.some(wo => wo.id === q.workOrderId));
            return <Suspense fallback={<LoadingSpinner />}><VehicleDetailView 
                vehicle={viewingVehicle} 
                client={data.clients.find(c => c.id === viewingVehicle.clientId)}
                workOrders={vehicleWorkOrders}
                invoices={vehicleInvoices}
                quotes={vehicleQuotes}
                onBack={() => setView(null, null)}
                onEditVehicle={(vehicle) => openModal('EDIT_VEHICLE', { vehicle: vehicle, clientId: vehicle.clientId })}
                onViewWorkOrder={(id) => setView('workOrder', id)}
                onViewQuote={(id) => setView('quote', id)}
                hasPermission={hasPermission}
            /></Suspense>;
        }
        
        if (viewingStaffMember) {
            const staffWorkOrders = workOrders.filter(wo => wo.staffMemberId === viewingStaffMember.id);
            const staffTimeEntries = timeClockEntries.filter(tce => tce.staffId === viewingStaffMember.id);
            const staffLoans = loans.filter(l => l.staffId === viewingStaffMember.id);
            
            return <Suspense fallback={<LoadingSpinner />}><StaffDetailView 
                staffMember={viewingStaffMember}
                workOrders={staffWorkOrders}
                timeClockEntries={staffTimeEntries}
                loans={staffLoans}
                loanPayments={loanPayments}
                onBack={() => setView(null, null)}
                onEditStaff={(staff) => openModal('EDIT_STAFF', staff)}
                onViewWorkOrder={(id) => setView('workOrder', id)}
                hasPermission={hasPermission}
            /></Suspense>;
        }

        if (viewingPurchaseOrder) return <Suspense fallback={<LoadingSpinner />}><PurchaseOrderDetailView 
            purchaseOrder={viewingPurchaseOrder}
            onBack={() => setView(null, null)}
            onReceive={data.handleReceivePurchaseOrder}
            hasPermission={hasPermission}
        /></Suspense>;

        const ActiveComponent = viewComponents[ui.activeView];
        if (ActiveComponent) {
            // This is a more dynamic way to handle views but requires careful prop management.
            // For now, let's stick to the explicit switch for type safety.
        }

        switch (ui.activeView) {
            case 'Dashboard': return <Suspense fallback={<LoadingSpinner />}><Dashboard 
                selectedLocationId={ui.selectedLocationId} 
                workOrders={filteredWorkOrders} 
                clients={filteredClients} 
                pettyCashTransactions={filteredPettyCash} 
                staffMembers={filteredStaff} 
                vehicles={filteredVehicles}
                quotes={filteredQuotes}
                invoices={filteredInvoices}
                appointments={appointments}
                handleAssignTechnician={data.handleAssignTechnician}
                handleAdvanceStage={data.handleAdvanceStage}
                handleCancelOrder={data.handleCancelOrder}
                onStartDiagnostic={handleStartDiagnostic}
                onViewDetails={(id) => setView('workOrder', id)}
                onEditWorkOrder={(wo) => openModal('EDIT_WORK_ORDER', wo)}
                hasPermission={hasPermission}
                onRegisterDelivery={(workOrderId) => openModal('REGISTER_DELIVERY', workOrders.find(wo => wo.id === workOrderId))}
                currentUser={ui.currentUser}
             /></Suspense>;
            case 'Órdenes de Trabajo': return <Suspense fallback={<LoadingSpinner />}><WorkOrdersView selectedLocationId={ui.selectedLocationId} workOrders={filteredWorkOrders} quotes={filteredQuotes} staffMembers={staffMembers} handleAssignTechnician={data.handleAssignTechnician} handleAdvanceStage={data.handleAdvanceStage} handleCancelOrder={data.handleCancelOrder} onStartDiagnostic={handleStartDiagnostic} onViewDetails={(id) => setView('workOrder', id)} onEditWorkOrder={(wo) => openModal('EDIT_WORK_ORDER', wo)} currentUser={ui.currentUser} hasPermission={hasPermission} onRegisterDelivery={(workOrderId) => openModal('REGISTER_DELIVERY', workOrders.find(wo => wo.id === workOrderId))} /></Suspense>;
            case 'Citas': return <Suspense fallback={<LoadingSpinner />}><AppointmentsView appointments={appointments} staffMembers={staffMembers} openModal={openModal} hasPermission={hasPermission} handleConfirmAppointment={data.handleConfirmAppointment} handleCancelAppointment={data.handleCancelAppointment} handleCreateWorkOrderFromAppointment={data.handleCreateWorkOrderFromAppointment} handleRescheduleAppointment={data.handleRescheduleAppointment} /></Suspense>;
            case 'Clientes': return <Suspense fallback={<LoadingSpinner />}><ClientsView selectedLocationId={ui.selectedLocationId} clients={filteredClients} setEditingClient={(client) => openModal('EDIT_CLIENT', client)} onViewClientDetails={(clientId) => setView('client', clientId)} hasPermission={hasPermission} /></Suspense>;
            case 'Vehículos': return <Suspense fallback={<LoadingSpinner />}><VehiclesView selectedLocationId={ui.selectedLocationId} vehicles={filteredVehicles} clients={clients} setEditingVehicle={(vehicle) => openModal('EDIT_VEHICLE', { vehicle: vehicle, clientId: vehicle !== 'new' ? vehicle.clientId : null })} onViewVehicleDetails={(vehicleId) => setView('vehicle', vehicleId)} hasPermission={hasPermission} /></Suspense>;
            case 'Inventario': return <Suspense fallback={<LoadingSpinner />}><InventoryView selectedLocationId={ui.selectedLocationId} inventoryItems={filteredInventoryItems} suppliers={suppliers} setEditingInventoryItem={(item) => openModal('EDIT_INVENTORY_ITEM', item)} onDeleteInventoryItem={data.handleDeleteInventoryItem} hasPermission={hasPermission} /></Suspense>;
            case 'Catálogo de Servicios': return <Suspense fallback={<LoadingSpinner />}><ServicesCatalogView selectedLocationId={ui.selectedLocationId} services={filteredServices} setEditingService={(service) => openModal('EDIT_SERVICE', service)} onDeleteService={data.handleDeleteService} hasPermission={hasPermission} locations={locations} /></Suspense>;
            case 'Proveedores': return <Suspense fallback={<LoadingSpinner />}><SuppliersView selectedLocationId={ui.selectedLocationId} suppliers={filteredSuppliers} pettyCashTransactions={filteredPettyCash} setEditingSupplier={(supplier) => openModal('EDIT_SUPPLIER', supplier)} onDeleteSupplier={data.handleDeleteSupplier} hasPermission={hasPermission} /></Suspense>;
            case 'Órdenes de Compra': return <Suspense fallback={<LoadingSpinner />}><PurchaseOrdersView selectedLocationId={ui.selectedLocationId} purchaseOrders={filteredPurchaseOrders} hasPermission={hasPermission} onCreatePurchaseOrder={() => openModal('CREATE_PURCHASE_ORDER')} onViewPurchaseOrderDetails={(id) => setView('purchaseOrder', id)} /></Suspense>;
            case 'Facturación': return <Suspense fallback={<LoadingSpinner />}><BillingView selectedLocationId={ui.selectedLocationId} invoices={filteredInvoices} hasPermission={hasPermission} setPayingInvoice={(invoice) => openModal('REGISTER_PAYMENT', invoice)} onCancelInvoice={data.handleCancelInvoice} onViewInvoiceDetails={(id) => setView('invoice', id)} /></Suspense>;
            case 'Cotizaciones': return <Suspense fallback={<LoadingSpinner />}><QuotesView selectedLocationId={ui.selectedLocationId} quotes={filteredQuotes} hasPermission={hasPermission} onViewQuoteDetails={(id) => setView('quote', id)} onDeleteQuote={data.handleDeleteQuote} onCreateInvoiceFromQuote={data.handleCreateInvoiceFromWorkOrder} onCreateManualQuote={() => openModal('CREATE_MANUAL_QUOTE', {})} /></Suspense>;
            case 'Finanzas': return <Suspense fallback={<LoadingSpinner />}><FinanceView 
                selectedLocationId={ui.selectedLocationId} 
                invoices={invoices} 
                workOrders={workOrders} 
                pettyCashTransactions={pettyCashTransactions} 
                operatingExpenses={operatingExpenses} 
                financialAccounts={financialAccounts} 
                onAddPettyCashTransaction={() => openModal('ADD_TRANSACTION')} 
                onAddOperatingExpense={() => openModal('ADD_OPERATING_EXPENSE')} 
                handleAddOperatingExpense={data.handleAddOperatingExpense} 
                handleAddLoanPayment={data.handleAddLoanPayment} 
                hasPermission={hasPermission} 
                staffMembers={staffMembers} 
                timeClockEntries={timeClockEntries} 
                loans={loans} 
                loanPayments={loanPayments}
                suppliers={suppliers}
                openModal={openModal}
            /></Suspense>;
            case 'Personal': return <Suspense fallback={<LoadingSpinner />}><StaffView 
                selectedLocationId={ui.selectedLocationId} 
                staffMembers={filteredStaff}
                timeClockEntries={timeClockEntries}
                loans={loans}
                loanPayments={loanPayments}
                setEditingStaffMember={(staff) => openModal('EDIT_STAFF', staff)} 
                handleDeleteStaffMember={data.handleDeleteStaffMember}
                hasPermission={hasPermission}
                onAddLoan={() => openModal('ADD_LOAN')}
                onAddLoanPayment={() => openModal('ADD_LOAN_PAYMENT')}
                onViewStaffDetails={(staffId) => setView('staff', staffId)}
            /></Suspense>;
            case 'Reportes': return <Suspense fallback={<LoadingSpinner />}><ReportsView 
                selectedLocationId={ui.selectedLocationId} 
                pettyCashTransactions={pettyCashTransactions}
                operatingExpenses={operatingExpenses}
                workOrders={workOrders}
                quotes={quotes}
                staffMembers={staffMembers}
                services={services}
                invoices={invoices}
                inventoryItems={inventoryItems}
                suppliers={suppliers}
                clients={clients}
                onViewInvoiceDetails={(id) => setView('invoice', id)}
             /></Suspense>;
            case 'Gestión Ambiental': return <Suspense fallback={<LoadingSpinner />}><EnvironmentalView /></Suspense>;
            case 'Ajustes': return <Suspense fallback={<LoadingSpinner />}><SettingsView 
                locations={locations} 
                appSettings={appSettings} 
                staffMembers={staffMembers}
                financialAccounts={financialAccounts}
                workOrders={workOrders}
                quotes={quotes}
                onSaveAppSettings={handleSaveAppSettings}
                onSaveLocation={data.handleCreateLocation}
                onDeleteLocation={handleDeleteLocation}
                onUpdateStaffRole={handleUpdateStaffRole}
                onUpdateStaffPermissions={handleUpdateStaffPermissions}
                onSaveServiceCategory={handleSaveServiceCategory}
                onDeleteServiceCategory={handleDeleteServiceCategory}
                onSaveInventoryCategory={handleSaveInventoryCategory}
                onDeleteInventoryCategory={handleDeleteInventoryCategory}
                onSaveFinancialAccount={handleSaveFinancialAccount}
                onDeleteFinancialAccount={handleDeleteFinancialAccount}
                onAssignAccountsToUser={handleAssignAccountsToUser}
                onAddLocation={() => openModal('EDIT_LOCATION', 'new')}
                onEditLocation={(location) => openModal('EDIT_LOCATION', location)}
                onUpdateHourlyRate={async(locationId: string, hourlyRate: number) => {
                    try {
                        const currentLocation = locations.find(l => l.id === locationId);
                        if (!currentLocation) return;
                        
                        const updatedLocation = { ...currentLocation, hourlyRate };
                        await data.updateLocation(updatedLocation);
                        await data.loadAllData();
                    } catch (error) {
                        // Error silencioso en producción
                    }
                }}
                onEditPermissions={(staff) => openModal('EDIT_PERMISSIONS', staff)}
                onAddServiceCategory={() => openModal('EDIT_SERVICE_CATEGORY', 'new')}
                onEditServiceCategory={(cat) => openModal('EDIT_SERVICE_CATEGORY', cat)}
                onAddInventoryCategory={() => openModal('EDIT_INVENTORY_CATEGORY', 'new')}
                onEditInventoryCategory={(cat) => openModal('EDIT_INVENTORY_CATEGORY', cat)}
                onAddFinancialAccount={() => openModal('EDIT_FINANCIAL_ACCOUNT', 'new')}
                onEditFinancialAccount={(acc) => openModal('EDIT_FINANCIAL_ACCOUNT', acc)}
                onAssignAccounts={(staff) => openModal('ASSIGN_ACCOUNTS', staff)}
                onUpdateAllWorkOrderStages={data.handleUpdateAllWorkOrderStages}
            /></Suspense>;
            default: return <Suspense fallback={<LoadingSpinner />}><Dashboard 
                selectedLocationId={ui.selectedLocationId} 
                workOrders={filteredWorkOrders} 
                clients={filteredClients} 
                pettyCashTransactions={filteredPettyCash} 
                staffMembers={filteredStaff} 
                vehicles={filteredVehicles}
                quotes={filteredQuotes}
                invoices={filteredInvoices}
                appointments={appointments}
                handleAssignTechnician={data.handleAssignTechnician}
                handleAdvanceStage={data.handleAdvanceStage}
                handleRetreatStage={data.handleRetreatStage}
                handleCancelOrder={data.handleCancelOrder}
                onStartDiagnostic={handleStartDiagnostic}
                onViewDetails={(id) => setView('workOrder', id)}
                onEditWorkOrder={(wo) => openModal('EDIT_WORK_ORDER', wo)}
                hasPermission={hasPermission}
                onRegisterDelivery={(workOrderId) => openModal('REGISTER_DELIVERY', workOrders.find(wo => wo.id === workOrderId))}
                currentUser={ui.currentUser}
             /></Suspense>;
        }
    };
    
    if (data.isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-dark text-white">
                Cargando datos...
            </div>
        );
    }

    return (
        <div className="flex h-screen font-sans">
            <Sidebar 
                activeView={ui.activeView}
                setActiveView={(view) => {
                    ui.setActiveView(view);
                    setView(null, null);
                }}
                hasPermission={hasPermission}
                isCollapsed={ui.isSidebarCollapsed}
                setIsCollapsed={ui.setIsSidebarCollapsed}
                isMobileOpen={ui.isMobileSidebarOpen}
                setIsMobileOpen={ui.setIsMobileSidebarOpen}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    isDarkMode={ui.isDarkMode}
                    setIsDarkMode={ui.setIsDarkMode}
                    setIsCreateWorkOrderModalOpen={() => openModal('CREATE_WORK_ORDER')}
                    locations={locations}
                    selectedLocationId={ui.selectedLocationId}
                    setSelectedLocationId={ui.setSelectedLocationId}
                    staffMembers={staffMembers}
                    currentUser={ui.currentUser}
                    setCurrentUser={(user) => ui.setCurrentUserId(user.id)}
                    hasPermission={hasPermission}
                    onMobileMenuClick={() => ui.setIsMobileSidebarOpen(true)}
                    timeClockEntries={timeClockEntries}
                    onClockIn={handleClockIn}
                    onClockOut={handleClockOut}
                    notifications={notifications}
                    onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                    onNotificationClick={handleNotificationClick}
                    onReloadData={async() => {
                        await data.loadAllData();
                    }}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
                    {renderActiveView()}
                </main>
            </div>
            <ModalManager />
        </div>
    );
};


const ModalManager: React.FC = () => {
    const data = useContext(DataContext)!;
    const ui = useContext(UIContext)!;
    const { hasPermission } = usePermissions(ui.currentUser);
    const { modalState, closeModal, openModal, selectedLocationId, currentUser } = ui;
    const { type, data: modalData } = modalState;

    if (!type) return null;
    
    const handleQuickAddItemCancel = () => {
        const { fromModal, fromModalData } = modalState.data || {};
        if (fromModal && fromModalData) {
            openModal(fromModal, fromModalData);
        } else {
            closeModal();
        }
    };

    const handleQuickAddItemSave = (newItem: QuoteItem) => {
        const { fromModal, fromModalData, placeholderId } = modalState.data || {};
        if (fromModal && fromModalData) {
            openModal(fromModal, {
                ...fromModalData,
                justAddedQuoteItem: newItem,
                itemToReplaceId: placeholderId,
            });
        } else {
            closeModal();
        }
    };


    return (
        <>
            <Modal isOpen={type === 'CREATE_WORK_ORDER'} onClose={closeModal} title="Crear Orden de Trabajo" size="7xl">
                <CreateWorkOrderForm 
                    key={modalData?.refreshKey || 'default'} // Fuerza re-montaje cuando se actualiza
                    onSave={async(d) => {
                        await data.handleCreateWorkOrder(d);
                        closeModal();
                    }}
                    onCancel={closeModal}
                    selectedLocationId={selectedLocationId}
                    clients={data.clients}
                    vehicles={data.vehicles}
                    staffMembers={data.staffMembers}
                    services={data.services}
                    locations={data.locations}
                    onAddNewClient={() => {
                        // Store current modal context
                        const currentModalType = type;
                        const currentModalData = modalData;
                        
                        // Open client modal without closing work order modal
                        openModal('EDIT_CLIENT_FROM_WORK_ORDER', { 
                            new: 'new', 
                            parentModal: { type: currentModalType, data: currentModalData }, 
                        });
                    }}
                    onAddNewVehicle={(clientId) => {
                        // Store current modal context
                        const currentModalType = type;
                        const currentModalData = modalData;
                        
                        // Open vehicle modal without closing work order modal
                        openModal('EDIT_VEHICLE_FROM_WORK_ORDER', { 
                            vehicle: 'new', 
                            clientId,
                            parentModal: { type: currentModalType, data: currentModalData }, 
                        });
                    }}
                />
            </Modal>
            
            {/* Modal para crear cliente desde cotización */}
            <Modal isOpen={type === 'EDIT_CLIENT_FROM_QUOTE'} onClose={closeModal} title="Crear Nuevo Cliente">
                <AddClientForm 
                    onSave={async(d) => { 
                        await data.handleCreateClient(d); 
                        // Recargar todos los datos para asegurar sincronización
                        await data.loadAllData();
                        // Volver al modal de crear cotización con timestamp para forzar re-render
                        const parentModal = modalData?.parentModal;
                        if (parentModal) {
                            openModal(parentModal.type, { 
                                ...parentModal.data, 
                                refreshKey: Date.now(), // Fuerza re-render con datos actualizados
                            });
                        } else {
                            closeModal();
                        }
                    }}
                    onCancel={closeModal}
                    locations={data.locations}
                    selectedLocationId={selectedLocationId}
                />
            </Modal>
            
            {/* Modal para crear vehículo desde cotización */}
            <Modal isOpen={type === 'EDIT_VEHICLE_FROM_QUOTE'} onClose={closeModal} title="Crear Nuevo Vehículo">
                <AddVehicleForm 
                    onSave={async(d) => { 
                        await data.handleCreateVehicle(d); 
                        // Recargar todos los datos para asegurar sincronización
                        await data.loadAllData();
                        // Volver al modal de crear cotización con timestamp para forzar re-render
                        const parentModal = modalData?.parentModal;
                        if (parentModal) {
                            openModal(parentModal.type, { 
                                ...parentModal.data, 
                                refreshKey: Date.now(), // Fuerza re-render con datos actualizados
                            });
                        } else {
                            closeModal();
                        }
                    }}
                    onCancel={closeModal}
                    clients={data.clients}
                    initialData={modalData?.clientId ? { clientId: modalData.clientId } : undefined}
                />
            </Modal>
            
            {/* Modal para crear cliente desde orden de trabajo */}
            <Modal isOpen={type === 'EDIT_CLIENT_FROM_WORK_ORDER'} onClose={closeModal} title="Crear Nuevo Cliente">
                <AddClientForm 
                    onSave={async(d) => { 
                        await data.handleCreateClient(d); 
                        // Recargar todos los datos para asegurar sincronización
                        await data.loadAllData();
                        // Volver al modal de crear orden de trabajo con timestamp para forzar re-render
                        const parentModal = modalData?.parentModal;
                        if (parentModal) {
                            openModal(parentModal.type, { 
                                ...parentModal.data, 
                                refreshKey: Date.now(), // Fuerza re-render con datos actualizados
                            });
                        } else {
                            closeModal();
                        }
                    }}
                    onCancel={closeModal}
                    locations={data.locations}
                    selectedLocationId={selectedLocationId}
                />
            </Modal>
            
            {/* Modal para crear vehículo desde orden de trabajo */}
            <Modal isOpen={type === 'EDIT_VEHICLE_FROM_WORK_ORDER'} onClose={closeModal} title="Crear Nuevo Vehículo">
                <AddVehicleForm 
                    onSave={async(d) => { 
                        await data.handleCreateVehicle(d); 
                        // Recargar todos los datos para asegurar sincronización
                        await data.loadAllData();
                        // Volver al modal de crear orden de trabajo con timestamp para forzar re-render
                        const parentModal = modalData?.parentModal;
                        if (parentModal) {
                            openModal(parentModal.type, { 
                                ...parentModal.data, 
                                refreshKey: Date.now(), // Fuerza re-render con datos actualizados
                            });
                        } else {
                            closeModal();
                        }
                    }}
                    onCancel={closeModal}
                    clients={data.clients}
                    initialData={modalData?.clientId ? { clientId: modalData.clientId } : undefined}
                />
            </Modal>
            
            <Modal isOpen={type === 'EDIT_WORK_ORDER'} onClose={closeModal} title={`Editar Orden de Trabajo #${modalData?.id ?? ''}`} size="lg">
                {modalData && <EditWorkOrderForm
                    initialData={modalData}
                    staffMembers={data.staffMembers}
                    onSave={async(d) => {
                        await data.handleSaveWorkOrder(d);
                        closeModal();
                    }}
                    onCancel={closeModal}
                />}
            </Modal>
            <Modal isOpen={type === 'EDIT_CLIENT'} onClose={closeModal} title={modalData === 'new' ? 'Crear Nuevo Cliente' : 'Editar Cliente'}>
                <AddClientForm 
                    onSave={async(d) => { 
                        if (modalData === 'new') {
                            await data.handleCreateClient(d); 
                        } else {
                            await data.handleSaveClient(d); 
                        }
                        closeModal(); 
                    }}
                    onCancel={closeModal}
                    locations={data.locations}
                    selectedLocationId={selectedLocationId}
                    initialData={modalData !== 'new' ? modalData : undefined} />
            </Modal>
            <Modal isOpen={type === 'EDIT_VEHICLE'} onClose={closeModal} title={modalData?.vehicle === 'new' ? 'Añadir Nuevo Vehículo' : 'Editar Vehículo'}>
                 {modalData && (
                    <AddVehicleForm 
                        onSave={async(d) => { 
                            if (modalData.vehicle === 'new') {
                                await data.handleCreateVehicle(d); 
                            } else {
                                await data.handleSaveVehicle(d); 
                            }
                            closeModal(); 
                        }}
                        onCancel={closeModal}
                        clients={data.clients}
                        initialData={modalData.vehicle !== 'new' ? modalData.vehicle : undefined} 
                        preselectedClientId={modalData.clientId} 
                    />
                )}
            </Modal>
            <Modal isOpen={type === 'EDIT_STAFF'} onClose={closeModal} title={modalData === 'new' ? 'Añadir Nuevo Personal' : 'Editar Personal'}>
                <AddStaffForm 
                    onSave={async(d) => { await data.handleSaveStaffMember(d); closeModal(); }}
                    onCancel={closeModal}
                    locations={data.locations}
                    selectedLocationId={selectedLocationId}
                    initialData={modalData !== 'new' ? modalData : undefined} />
            </Modal>
            <Modal isOpen={type === 'EDIT_SERVICE'} onClose={closeModal} title={modalData === 'new' ? 'Añadir Nuevo Servicio' : 'Editar Servicio'} size="lg">
                <AddServiceForm 
                    onSave={async(d) => { 
                        if (modalData === 'new') {
                            await data.handleCreateService(d); 
                        } else {
                            await data.handleSaveService(d); 
                        }
                        closeModal(); 
                    }}
                    onCancel={closeModal}
                    locations={data.locations}
                    selectedLocationId={selectedLocationId}
                    categories={data.appSettings?.operationsSettings.serviceCategories || []}
                    initialData={modalData !== 'new' ? modalData : undefined} />
            </Modal>
            <Modal isOpen={type === 'EDIT_INVENTORY_ITEM'} onClose={closeModal} title={modalData === 'new' ? 'Añadir Artículo' : 'Editar Artículo'} size="lg">
                <AddInventoryItemForm 
                    onSave={async(d) => { 
                        if (modalData === 'new') {
                            await data.handleCreateInventoryItem(d); 
                        } else {
                            await data.handleSaveInventoryItem(d); 
                        }
                        closeModal(); 
                    }}
                    onCancel={closeModal}
                    suppliers={data.suppliers.filter(s => selectedLocationId === 'ALL_LOCATIONS' || s.locationId === selectedLocationId)}
                    selectedLocationId={selectedLocationId}
                    categories={data.appSettings?.operationsSettings.inventoryCategories || []}
                    initialData={modalData !== 'new' ? modalData : undefined} />
            </Modal>
            <Modal isOpen={type === 'EDIT_SUPPLIER'} onClose={closeModal} title={modalData === 'new' ? 'Añadir Proveedor' : 'Editar Proveedor'} size="lg">
                <AddSupplierForm 
                    onSave={async(d) => { 
                        if (modalData === 'new') {
                            await data.handleCreateSupplier(d); 
                        } else {
                            await data.handleSaveSupplier(d); 
                        }
                        closeModal(); 
                    }}
                    onCancel={closeModal}
                    selectedLocationId={selectedLocationId}
                    initialData={modalData !== 'new' ? modalData : undefined} />
            </Modal>
            <Modal isOpen={type === 'ADD_TRANSACTION'} onClose={closeModal} title="Registrar Movimiento de Caja Menor" size="lg">
                <AddTransactionForm 
                    onSave={async(d) => { await data.handleAddTransaction(d); closeModal(); }}
                    onCancel={closeModal}
                    selectedLocationId={selectedLocationId}
                    suppliers={data.suppliers.filter(s => s.hasCredit || s.isPaymentPartner)}
                    accounts={data.financialAccounts}
                    currentUser={currentUser}
                    hasPermission={hasPermission}
                />
            </Modal>
             <Modal isOpen={type === 'ADD_OPERATING_EXPENSE'} onClose={closeModal} title="Registrar Gasto Operativo" size="lg">
                <AddOperatingExpenseForm 
                    onSave={async(d) => { await data.handleAddOperatingExpense(d); closeModal(); }}
                    onCancel={closeModal}
                    selectedLocationId={selectedLocationId}
                    accounts={data.financialAccounts}
                    currentUser={currentUser}
                    hasPermission={hasPermission}
                />
            </Modal>
            <Modal isOpen={type === 'REGISTER_PAYMENT'} onClose={closeModal} title={`Registrar Pago para Factura #${modalData?.id ?? ''}`} size="lg">
                {modalData && <RegisterPaymentForm 
                    invoice={modalData} 
                    onSave={async(invoiceId, paymentData) => { await data.handleRegisterPayment(invoiceId, paymentData); closeModal(); }} 
                    onCancel={closeModal} 
                />}
            </Modal>
            <Modal isOpen={type === 'CREATE_QUOTE'} onClose={closeModal} title={modalData?.isAdditional ? `Añadir Cotización Adicional a OT #${modalData?.workOrder?.id}` : `Crear Cotización para OT #${modalData?.workOrder?.id ?? ''}`} size="7xl">
                {modalData?.workOrder && <CreateQuoteForm 
                    key={modalData?.refreshKey || 'default'} // Fuerza re-montaje cuando se actualiza
                    workOrder={modalData.workOrder} 
                    client={data.clients.find(c => c.id === modalData.workOrder.clientId)}
                    vehicle={data.vehicles.find(v => v.id === modalData.workOrder.vehicleId)}
                    locations={data.locations}
                    appSettings={data.appSettings}
                    initialItems={modalData.itemsState || modalData.initialItems}
                    justAddedQuoteItem={modalData.justAddedQuoteItem}
                    itemToReplaceId={modalData.itemToReplaceId}
                    services={data.services}
                    inventoryItems={data.inventoryItems}
                    onSave={async(quoteData) => { 
                        if (modalData?.id) {
                            await data.handleSaveQuote(modalData.id, quoteData); 
                        } else {
                            await data.handleCreateQuote(quoteData);
                        }
                        // Forzar recarga de datos para sincronizar el estado
                        await data.loadAllData();
                        closeModal();
                        // Redirigir a la vista de cotizaciones para mostrar la cotización creada
                        ui.setActiveView('Cotizaciones'); 
                    }}
                    onCancel={closeModal}
                    onQuickAddItem={(name, placeholderId, currentItems) => openModal('QUICK_ADD_ITEM', { itemName: name, placeholderId, fromModal: type, fromModalData: { ...modalData, itemsState: currentItems } })}
                    onClearJustAddedItem={() => openModal(type, { ...modalData, justAddedQuoteItem: null, itemToReplaceId: null })}
                />}
            </Modal>
            <Modal isOpen={type === 'EDIT_QUOTE'} onClose={closeModal} title={`Editar Cotización #${modalData?.id ?? ''}`} size="7xl">
                {modalData && <CreateQuoteForm 
                    workOrder={data.workOrders.find(wo => wo.id === (modalData as Quote).workOrderId)!} 
                    client={data.clients.find(c => c.id === (modalData as Quote).clientId)}
                    vehicle={data.vehicles.find(v => v.clientId === (modalData as Quote).clientId)}
                    locations={data.locations}
                    appSettings={data.appSettings}
                    initialData={{ ...modalData, items: modalData.itemsState || modalData.items }}
                    justAddedQuoteItem={modalData.justAddedQuoteItem}
                    itemToReplaceId={modalData.itemToReplaceId}
                    services={data.services}
                    inventoryItems={data.inventoryItems}
                    onSave={async(quoteData) => { 
                        if (modalData?.id) {
                            await data.handleSaveQuote(modalData.id, quoteData); 
                        } else {
                            await data.handleCreateQuote(quoteData);
                        }
                        // Forzar recarga de datos para sincronizar el estado
                        await data.loadAllData();
                        closeModal();
                        // Redirigir a la vista de cotizaciones para mostrar la cotización creada
                        ui.setActiveView('Cotizaciones'); 
                    }}
                    onCancel={closeModal}
                    onQuickAddItem={(name, placeholderId, currentItems) => openModal('QUICK_ADD_ITEM', { itemName: name, placeholderId, fromModal: type, fromModalData: { ...modalData, itemsState: currentItems } })}
                    onClearJustAddedItem={() => openModal(type, { ...modalData, justAddedQuoteItem: null, itemToReplaceId: null })}
                />}
            </Modal>
             <Modal isOpen={type === 'APPROVE_QUOTE'} onClose={closeModal} title={`Revisar y Aprobar Cotización #${modalData?.id ? getQuoteDisplayId(modalData.id, modalData.issueDate, true, modalData.sequentialId) : ''}`} size="7xl">
                {modalData && (() => {
                    console.debug('🚨 App.tsx - modalData para ApproveQuoteForm:', modalData);
                    console.debug('🚨 App.tsx - modalData.items:', modalData.items);
                    return null;
                })()}
                {modalData && <ApproveQuoteForm 
                    quote={modalData}
                    onSave={async(quoteData) => { 
                        if (modalData?.id) {
                            await data.handleSaveQuote(modalData.id, quoteData); 
                        } else {
                            await data.handleCreateQuote(quoteData);
                        }
                        // Forzar recarga de datos para sincronizar el estado
                        await data.loadAllData();
                        closeModal();
                        // Redirigir a la vista de cotizaciones para mostrar la cotización creada
                        ui.setActiveView('Cotizaciones'); 
                    }}
                    onCancel={closeModal}
                    services={data.services}
                    inventoryItems={data.inventoryItems}
                    locations={data.locations}
                    justAddedQuoteItem={modalData.justAddedQuoteItem}
                    itemToReplaceId={modalData.itemToReplaceId}
                    onQuickAddItem={(name, placeholderId, currentItems) => openModal('QUICK_ADD_ITEM', { itemName: name, placeholderId, fromModal: type, fromModalData: { ...modalData, itemsState: currentItems } })}
                    onClearJustAddedItem={() => openModal(type, { ...modalData, justAddedQuoteItem: null, itemToReplaceId: null })}
                />}
            </Modal>
            <Modal isOpen={type === 'CREATE_MANUAL_QUOTE'} onClose={closeModal} title="Crear Cotización Manual" size="7xl">
                {modalData && <CreateManualQuoteForm
                    onSave={async(quoteData) => { 
                        if (modalData?.id) {
                            await data.handleSaveQuote(modalData.id, quoteData); 
                        } else {
                            await data.handleCreateQuote(quoteData);
                        }
                        // Forzar recarga de datos para sincronizar el estado
                        await data.loadAllData();
                        closeModal();
                        // Redirigir a la vista de cotizaciones para mostrar la cotización creada
                        ui.setActiveView('Cotizaciones'); 
                    }}
                    onCancel={closeModal}
                    selectedLocationId={selectedLocationId}
                    clients={data.clients}
                    vehicles={data.vehicles}
                    services={data.services}
                    inventoryItems={data.inventoryItems}
                    locations={data.locations}
                    appSettings={data.appSettings}
                    onAddNewClient={() => {
                        // Store current modal context
                        const currentModalType = type;
                        const currentModalData = modalData;
                        
                        // Open client modal without closing quote modal
                        openModal('EDIT_CLIENT_FROM_QUOTE', { 
                            new: 'new', 
                            parentModal: { type: currentModalType, data: currentModalData }, 
                        });
                    }}
                    onAddNewVehicle={(clientId) => {
                        // Store current modal context
                        const currentModalType = type;
                        const currentModalData = modalData;
                        
                        // Open vehicle modal without closing quote modal
                        openModal('EDIT_VEHICLE_FROM_QUOTE', { 
                            vehicle: 'new', 
                            clientId,
                            parentModal: { type: currentModalType, data: currentModalData }, 
                        });
                    }}
                    justAddedQuoteItem={modalData.justAddedQuoteItem}
                    itemToReplaceId={modalData.itemToReplaceId}
                    onQuickAddItem={(name, placeholderId, currentItems) => openModal('QUICK_ADD_ITEM', { itemName: name, placeholderId, fromModal: type, fromModalData: { ...modalData, itemsState: currentItems } })}
                    onClearJustAddedItem={() => openModal(type, { ...modalData, justAddedQuoteItem: null, itemToReplaceId: null })}
                />}
            </Modal>
            <Modal isOpen={type === 'CREATE_PURCHASE_ORDER'} onClose={closeModal} title="Crear Orden de Compra" size="7xl">
                <CreatePurchaseOrderForm 
                    onSave={async(d) => { await data.handleSavePurchaseOrder(d); closeModal(); }}
                    onCancel={closeModal}
                    suppliers={data.suppliers.filter(s => s.locationId === selectedLocationId)}
                    inventoryItems={data.inventoryItems.filter(i => i.locationId === selectedLocationId)}
                    selectedLocationId={selectedLocationId}
                />
            </Modal>
            <Modal isOpen={type === 'QUICK_ADD_ITEM'} onClose={handleQuickAddItemCancel} title={`Crear Rápido: ${modalData?.itemName ?? ''}`} size="5xl">
                {modalData?.itemName && <QuickAddItemFlow
                    itemName={modalData.itemName}
                    onSave={handleQuickAddItemSave}
                    onCancel={handleQuickAddItemCancel}
                />}
            </Modal>
            <Modal isOpen={type === 'REGISTER_DELIVERY'} onClose={closeModal} title={`Registrar Entrega de OT #${modalData?.id ?? ''}`} size="4xl">
                {modalData && <RegisterDeliveryForm
                    workOrder={modalData}
                    onSave={async(workOrderId, deliveryData) => { await data.handleRegisterDelivery(workOrderId, deliveryData); closeModal(); }}
                    onCancel={closeModal}
                />}
            </Modal>
            <Modal isOpen={type === 'EDIT_LOCATION'} onClose={closeModal} title={modalData === 'new' ? 'Añadir Nueva Sede' : 'Editar Sede'}>
                <AddLocationForm
                    onSave={async(d) => { 
                        if (modalData === 'new') {
                            await data.handleCreateLocation(d); 
                        } else {
                            await data.handleSaveLocation(d); 
                        }
                        closeModal(); 
                    }}
                    onCancel={closeModal}
                    initialData={modalData !== 'new' ? modalData : undefined}
                />
            </Modal>
            <Modal isOpen={type === 'EDIT_PERMISSIONS'} onClose={closeModal} title={`Permisos para ${modalData?.name ?? ''}`} size="4xl">
                {modalData && <PermissionsModal
                    staffMember={modalData}
                    onSave={async(staffId, permissions) => { await data.handleUpdateStaffPermissions(staffId, permissions); closeModal(); }}
                    onCancel={closeModal}
                />}
            </Modal>
            <Modal isOpen={type === 'EDIT_SERVICE_CATEGORY'} onClose={closeModal} title={modalData === 'new' ? 'Añadir Categoría de Servicio' : 'Editar Categoría de Servicio'} size="sm">
                <CategoryForm
                    onSave={async(d) => { await data.handleSaveServiceCategory(d); closeModal(); }}
                    onCancel={closeModal}
                    initialData={modalData !== 'new' ? modalData : undefined}
                    itemTypeLabel="de Servicio"
                />
            </Modal>
             <Modal isOpen={type === 'EDIT_INVENTORY_CATEGORY'} onClose={closeModal} title={modalData === 'new' ? 'Añadir Categoría de Inventario' : 'Editar Categoría de Inventario'} size="sm">
                <CategoryForm
                    onSave={async(d) => { await data.handleSaveInventoryCategory(d); closeModal(); }}
                    onCancel={closeModal}
                    initialData={modalData !== 'new' ? modalData : undefined}
                    itemTypeLabel="de Inventario"
                />
            </Modal>
            <Modal isOpen={type === 'EDIT_FINANCIAL_ACCOUNT'} onClose={closeModal} title={modalData === 'new' ? 'Añadir Cuenta Financiera' : 'Editar Cuenta Financiera'} size="lg">
                <AddFinancialAccountForm
                    onSave={async(d) => { await data.handleSaveFinancialAccount(d); closeModal(); }}
                    onCancel={closeModal}
                    initialData={modalData !== 'new' ? modalData : undefined}
                    staffMembers={data.staffMembers.filter(s => selectedLocationId === 'ALL_LOCATIONS' || s.locationId === selectedLocationId)}
                    selectedLocationId={selectedLocationId}
                />
            </Modal>
            <Modal isOpen={type === 'ASSIGN_ACCOUNTS'} onClose={closeModal} title={`Asignar Cuentas a ${modalData?.name ?? ''}`} size="lg">
                {modalData && <AssignAccountsModal
                    staffMember={modalData}
                    allAccounts={data.financialAccounts}
                    onSave={async(staffId, accountIds) => { await data.handleAssignAccountsToUser(staffId, accountIds); closeModal(); }}
                    onCancel={closeModal}
                />}
            </Modal>
            <Modal isOpen={type === 'MANAGE_COMMISSIONS'} onClose={closeModal} title={`Gestionar Comisiones para Factura #${modalData?.invoice?.id ?? ''}`} size="lg">
                {modalData?.invoice && modalData?.client && <ManageCommissionsModal
                    invoice={modalData.invoice}
                    client={modalData.client}
                    onSave={async(invoiceId, commissions) => { await data.handleSaveInvoiceCommissions(invoiceId, commissions); closeModal(); }}
                    onCancel={closeModal}
                />}
            </Modal>
            <Modal isOpen={type === 'FACTOR_INVOICE'} onClose={closeModal} title={`Vender Factura (Factoring) #${modalData?.id ?? ''}`} size="lg">
                {modalData && <FactorInvoiceForm
                    invoice={modalData}
                    accounts={data.financialAccounts}
                    onSave={async(invoiceId, factoringData) => { await data.handleFactorInvoice(invoiceId, factoringData); closeModal(); }}
                    onCancel={closeModal}
                />}
            </Modal>
            <Modal isOpen={type === 'RELEASE_RETENTION'} onClose={closeModal} title={`Liberar Retención para Factura #${modalData?.id ?? ''}`} size="lg">
                {modalData && <ReleaseRetentionModal
                    invoice={modalData}
                    accounts={data.financialAccounts}
                    onSave={async(invoiceId, releaseData) => { await data.handleReleaseRetention(invoiceId, releaseData); closeModal(); }}
                    onCancel={closeModal}
                />}
            </Modal>
            <Modal isOpen={type === 'SELECT_DIAGNOSTIC_TYPE'} onClose={closeModal} title="Seleccionar Tipo de Diagnóstico" size="xl">
                {modalData && <SelectDiagnosticTypeModal
                    onSelect={(diagnosticType: DiagnosticType) => {
                        openModal('DIAGNOSTIC_CHECKLIST', { ...modalData, diagnosticType });
                    }}
                />}
            </Modal>
            <Modal 
                isOpen={type === 'DIAGNOSTIC_CHECKLIST'} 
                onClose={closeModal} 
                title={`Diagnóstico para OT #${modalData?.id ?? ''} - ${modalData?.diagnosticType}`} 
                size="7xl"
            >
                {modalData && modalData.diagnosticType && <DiagnosticChecklistModal
                    onCancel={closeModal}
                    workOrder={modalData}
                    diagnosticType={modalData.diagnosticType}
                    onSave={async(workOrderId, diagnosticData, staffIds, recommendedItems, diagnosticType) => {
                        await data.handleSaveDiagnostic(workOrderId, diagnosticData, staffIds, recommendedItems, diagnosticType);
                        closeModal();
                    }}
                    clients={data.clients}
                    vehicles={data.vehicles}
                    staffMembers={data.staffMembers}
                    services={data.services}
                    inventoryItems={data.inventoryItems}
                />}
            </Modal>
            <Modal isOpen={type === 'REPORT_UNFORESEEN_ISSUE'} onClose={closeModal} title={`Reportar Imprevisto en OT #${modalData?.id ?? ''}`} size="lg">
                {modalData && <ReportUnforeseenIssueModal
                    workOrder={modalData}
                    onSave={async(workOrderId: string, description: string) => {
                        await data.handleReportUnforeseenIssue(workOrderId, description);
                        closeModal();
                    }}
                    onCancel={closeModal}
                />}
            </Modal>
            <Modal isOpen={type === 'TRANSACTION_DETAIL'} onClose={closeModal} title="Detalle de Transacción" size="lg">
                {modalData && <TransactionDetailModal
                    transaction={modalData}
                    staffMembers={data.staffMembers}
                    financialAccounts={data.financialAccounts}
                    suppliers={data.suppliers}
                />}
            </Modal>
            <Modal isOpen={type === 'SHARE_CLIENT_PORTAL'} onClose={closeModal} title={`Compartir Portal con Cliente para OT #${modalData?.workOrder?.id ?? ''}`} size="lg">
                {modalData?.workOrder && modalData?.client && <ShareClientPortalModal
                    workOrder={modalData.workOrder}
                    client={modalData.client}
                    onClose={closeModal}
                />}
            </Modal>
            <Modal isOpen={type === 'CREATE_APPOINTMENT'} onClose={closeModal} title="Agendar Nueva Cita" size="xl">
                <AddAppointmentForm
                    onSave={async(d) => { await data.handleSaveAppointment(d); closeModal(); }}
                    onCancel={closeModal}
                    clients={data.clients.filter(c => selectedLocationId === 'ALL_LOCATIONS' || c.locationId === selectedLocationId)}
                    vehicles={data.vehicles}
                    staffMembers={data.staffMembers.filter(s => selectedLocationId === 'ALL_LOCATIONS' || s.locationId === selectedLocationId)}
                    locations={data.locations}
                    selectedLocationId={selectedLocationId}
                    onAddNewClient={() => openModal('EDIT_CLIENT', 'new')}
                    onAddNewVehicle={(clientId) => openModal('EDIT_VEHICLE', { vehicle: 'new', clientId })}
                />
            </Modal>
             <Modal isOpen={type === 'EDIT_APPOINTMENT'} onClose={closeModal} title={`Editar Cita #${modalData?.id ?? ''}`} size="xl">
                {modalData && <AddAppointmentForm
                    onSave={async(d) => { await data.handleSaveAppointment(d); closeModal(); }}
                    onCancel={closeModal}
                    clients={data.clients.filter(c => selectedLocationId === 'ALL_LOCATIONS' || c.locationId === selectedLocationId)}
                    vehicles={data.vehicles}
                    staffMembers={data.staffMembers.filter(s => selectedLocationId === 'ALL_LOCATIONS' || s.locationId === selectedLocationId)}
                    locations={data.locations}
                    selectedLocationId={selectedLocationId}
                    initialData={modalData}
                    onAddNewClient={() => openModal('EDIT_CLIENT', 'new')}
                    onAddNewVehicle={(clientId) => openModal('EDIT_VEHICLE', { vehicle: 'new', clientId })}
                />}
            </Modal>
        </>
    );
};

// FIX: Added a root App component and exported it as default to resolve the module import error in index.tsx.
const App: React.FC = () => {
  return <AppContent />;
};

export default App;