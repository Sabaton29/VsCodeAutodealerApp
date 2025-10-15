



export enum WorkOrderStatus {
  PROGRAMADO = 'Programado',
  EN_PROCESO = 'En Proceso',
  ESPERA_REPUESTOS = 'Espera Repuestos',
  LISTO_ENTREGA = 'Listo para Entrega',
  FACTURADO = 'Facturado',
  CANCELADO = 'Cancelado',
}

export enum KanbanStage {
  RECEPCION = 'Recepción',
  DIAGNOSTICO = 'Diagnóstico',
  PENDIENTE_COTIZACION = 'Pendiente Cotización',
  ESPERA_APROBACION = 'Esperando Aprobación',
  ATENCION_REQUERIDA = 'Atención Requerida',
  EN_REPARACION = 'En Reparación',
  CONTROL_CALIDAD = 'Control de Calidad',
  LISTO_ENTREGA = 'Listo para Entrega',
  ENTREGADO = 'Entregado',
  CANCELADO = 'Cancelado',
}

export enum UserRole {
  ADMINISTRADOR = 'Administrador',
  JEFE_TALLER = 'Jefe de Taller',
  ASESOR_SERVICIO = 'Asesor de Servicio',
  MECANICO = 'Mecánico',
  ALMACEN = 'Almacén',
  FACTURACION = 'Facturación',
}

export enum AppointmentStatus {
  PROGRAMADA = 'Programada',
  CONFIRMADA = 'Confirmada',
  CANCELADA = 'Cancelada',
  COMPLETADA = 'Completada',
}

export type CalendarView = 'month' | 'week' | 'day';

export type Permission =
  | 'view:dashboard'
  | 'view:work_orders'
  | 'view:own_work_orders'
  | 'create:work_order'
  | 'edit:work_order'
  | 'cancel:work_order'
  | 'assign:technician'
  | 'advance:work_order_stage'
  | 'start:diagnostic'
  | 'view:clients'
  | 'manage:clients'
  | 'view:vehicles'
  | 'manage:vehicles'
  | 'view:inventory'
  | 'manage:inventory'
  | 'view:services'
  | 'manage:services'
  | 'view:suppliers'
  | 'manage:suppliers'
  | 'view:billing'
  | 'manage:billing'
  | 'view:finance'
  | 'manage:finance'
  | 'view:staff'
  | 'manage:staff'
  | 'view:reports'
  | 'view:environmental'
  | 'manage:environmental'
  | 'view:settings'
  | 'manage:settings'
  | 'view:quotes'
  | 'manage:quotes'
  | 'review:quote'
  | 'approve:quote'
  | 'view:purchase_orders'
  | 'manage:purchase_orders'
  | 'receive:purchase_order'
  | 'view:payroll'
  | 'manage:payroll'
  | 'view:time_clock'
  | 'manage:time_clock'
  | 'view:loans'
  | 'manage:loans'
  | 'post:progress_update'
  | 'toggle:task_completed'
  | 'report:unforeseen_issue'
  | 'view:appointments'
  | 'manage:appointments';

export interface KanbanTask {
  id: string;
  vehicle: Pick<Vehicle, 'id' | 'make' | 'model' | 'plate'>;
  stage: KanbanStage;
  mechanic: string;
  locationId: string;
}

export interface Location {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  hourlyRate: number;
}

export type DayOfWeek = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';

export type PaymentTerms = 
    | { type: 'ON_DELIVERY' }
    | { type: 'NET_DAYS', days: number }
    | { type: 'DAY_OF_WEEK', day: DayOfWeek };


export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleCount: number;
  registrationDate: string;
  locationId: string;
  personType: 'Persona Natural' | 'Persona Jurídica';
  idType: string;
  idNumber: string;
  address?: string;
  city?: string;
  observations?: string;
  isB2B?: boolean;
  commissionRate?: number;
  paymentTerms?: PaymentTerms;
}

export interface Vehicle {
  id: string;
  clientId: string;
  make: string;
  model: string;
  plate: string;
  vehicleType?: string;
  year?: number;
  color?: string;
  engineDisplacement?: number;
  fuelType?: string;
  observations?: string;
}

export type SalaryType = 'Mensual' | 'Quincenal' | 'Por Hora' | 'Mixto (Base + Comisión)' | 'Comisión Pura';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  locationId: string;
  specialty?: string;
  documentType: string;
  documentNumber: string;
  customPermissions?: Permission[];
  // New Payroll Fields
  salaryType?: SalaryType;
  salaryAmount?: number;
  isProLabore?: boolean;
  requiresTimeClock?: boolean;
  commissionRate?: number;
}

export interface TimeClockEntry {
  id: string;
  staffId: string;
  locationId: string;
  timestamp: string; // ISO date string
  type: 'in' | 'out';
}

export interface Loan {
  id: string;
  staffId: string;
  locationId: string;
  amount: number;
  reason: string;
  issueDate: string; // ISO date string
  deductionPerPayPeriod: number;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: string; // ISO date string
  isPayrollDeduction: boolean;
}


export interface Service {
  id: string;
  name: string;
  category: string;
  durationHours: number;
  locationId: string;
  hourlyRate?: number;
  isHourlyRate?: boolean; // true = precio por hora, false = precio fijo
}

export interface Supplier {
  id: string;
  name: string;
  nit: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: string;
  locationId: string;
  hasCredit: boolean;
  isPaymentPartner?: boolean;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  supplierId?: string;
  category: string;
  stock: number;
  costPrice: number;
  salePrice: number; // Price before tax
  margin: number; // Stored as percentage, e.g., 50 for 50%
  taxRate: number; // Stored as percentage, e.g., 19 for 19%
  locationId: string;
}

export type PaymentMethod = 'Efectivo' | 'Tarjeta de Crédito' | 'Tarjeta de Crédito (Socio)' | 'Crédito' | 'Transferencia';

export type FinancialAccountType = 'Caja Menor' | 'Banco';

export interface FinancialAccount {
    id: string;
    name: string;
    type: FinancialAccountType;
    locationId: string;
    assignedUserIds?: string[];
}

export interface PettyCashTransaction {
    id: string;
    type: 'income' | 'expense';
    description: string;
    amount: number;
    date: string;
    paymentMethod?: PaymentMethod;
    supplierId?: string;
    receiptImageUrl?: string;
    locationId: string;
    accountId?: string; // Made optional
    paymentPartnerId?: string; // New field for commercial partner
    userId: string;
}

export enum ChecklistStatus {
    OK = 'OK',
    MAL = 'MAL',
    MANTEN = 'MANTEN',
    CAMBIO = 'CAMBIO',
    NA = 'N/A',
}

export interface DiagnosticData {
    [section: string]: {
        items: { [item: string]: ChecklistStatus };
        components?: { [component: string]: ChecklistStatus };
        customItems?: { id: string; name: string; status: ChecklistStatus }[];
        observations: string;
        imageUrls?: string[];
// Added optional imageFiles property to DiagnosticData to support file handling in the UI before conversion/upload.
        imageFiles?: File[];
        isEnabled?: boolean; // Control de alcance: true = incluir en reporte, false = excluir del reporte
    };
}

export interface WorkOrderHistoryEntry {
    stage: string;
    date: string;
    user: string;
    notes?: string;
}

export type DiagnosticType = 'Básico' | 'Intermedio' | 'Avanzado';

export interface ProgressLogEntry {
  id: string;
  timestamp: string; // ISO date string
  userId: string;
  userName: string;
  userRole: UserRole;
  notes: string;
  imageUrls?: string[];
}

export interface UnforeseenIssue {
    id: string;
    reportedById: string;
    timestamp: string; // ISO date string
    description: string;
    imageUrls?: string[];
    requiredServices?: {
        serviceId: string;
        serviceName: string;
        quantity: number;
        estimatedPrice: number;
        notes?: string;
    }[];
    requiredParts?: {
        partId: string;
        partName: string;
        quantity: number;
        estimatedPrice: number;
        supplierId?: string;
        notes?: string;
    }[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'approved' | 'rejected' | 'resolved';
    estimatedCost?: number;
    estimatedTime?: number; // in hours
    notes?: string;
}


export interface WorkOrder {
  id: string;
  client: { id: string, name: string };
  vehicle: Pick<Vehicle, 'id' | 'make' | 'model' | 'plate'>;
  status: WorkOrderStatus;
  stage: KanbanStage;
  total: number;
  date: string;
  locationId: string;
  serviceRequested: string;
  staffMemberId?: string;
  timeInStage: string;
  services: { serviceId: string; serviceName: string; price: number; }[];
  diagnosticData?: DiagnosticData;
  diagnosticType?: DiagnosticType;
  history: WorkOrderHistoryEntry[];
  recommendedItems?: QuoteItem[];
  progressLog?: ProgressLogEntry[];
  unforeseenIssues?: UnforeseenIssue[];

  // New detailed fields from the form
  serviceTypeAdvanced?: boolean;
  isWarranty?: boolean;
  roadTestAuthorized?: boolean;
  serviceDateTime?: string;
  advisorId?: string;
  
  requiresInitialDiagnosis?: boolean;
  linkedQuoteIds: string[];
  publicAccessToken?: string;

  mileage?: string;
  fuelLevel?: string;
  reportedValuables?: string;
  
  fluidLevels?: {
    engineOil: boolean;
    brakeFluid: boolean;
    clutchFluid: boolean;
    coolant: boolean;
    hydraulicFluid: boolean;
    windshieldWiper: boolean;
  };
  otherFluids?: string;

  inventoryChecklist?: {
    spareTire: boolean;
    jackKit: boolean;
    tools: boolean;
    fireExtinguisher: boolean;
    firstAidKit: boolean;
    other: boolean;
  };
  inventoryOtherText?: string;
  documents?: string;
  comments?: string;

  damages?: {
    scratched: boolean;
    fogged: boolean;
    dented: boolean;
    chipped: boolean;
    noDamage: boolean;
  };
  otherDamages?: string;
  damageLocations?: { [key: string]: string[] };

  entryEvidenceImageUrls?: string[];

  deliveryDate?: string;
  deliveryEvidenceImageUrls?: string[];
  nextMaintenanceDate?: string;
  nextMaintenanceMileage?: string;
  nextMaintenanceNotes?: string;
}

export enum InvoiceStatus {
    PENDIENTE = 'Pendiente',
    PAGADA = 'Pagada',
    VENCIDA = 'Vencida',
    CANCELADA = 'Cancelada',
    PAGADA_FACTORING = 'Pagada (Factoring)',
}

export interface Invoice {
    id: string;
    workOrderId: string;
    clientId: string;
    clientName: string;
    vehicleSummary: string;
    issueDate: string;
    dueDate: string;
    subtotal: number;
    taxAmount: number;
    total: number;
    status: InvoiceStatus;
    locationId: string;
    items: QuoteItem[];
    notes?: string;
    paymentTerms?: PaymentTerms;
    vatIncluded?: boolean;
    factoringInfo?: {
        company: string;
        commission: number;
        retentionAmount: number;
        date: string;
        accountId: string;
        retentionReleased?: {
            date: string;
            accountId: string;
        }
    };
}

export interface QuoteItem {
    id: string; // Can be serviceId or inventoryItemId, or a temporary ID for placeholders
    type: 'service' | 'inventory' | 'placeholder';
    description: string;
    quantity: number;
    unitPrice: number; // Price before tax
    taxRate: number; // e.g., 19 for 19%
    discount?: number; // Optional discount amount per item (monetary value)
    commission?: number; // Optional commission amount for B2B clients
    costPrice?: number; // Real cost paid to supplier
    supplierId?: string; // Supplier for this item
    isCompleted?: boolean;
    suppliedByClient?: boolean;
    imageUrls?: string[]; // URLs of images attached to this item
}

export enum QuoteStatus {
    BORRADOR = 'Borrador',
    ENVIADO = 'Enviado',
    REVISADO = 'Revisado',
    APROBADO = 'Aprobado',
    RECHAZADO = 'Rechazado',
    FACTURADO = 'Facturado',
}

export interface Quote {
    id: string;
    workOrderId?: string; // Optional if created standalone
    clientId: string;
    clientName: string;
    vehicleSummary: string;
    issueDate: string;
    expiryDate: string;
    subtotal: number;
    totalDiscount?: number; // Descuento general en porcentaje
    discountAmount?: number; // Monto del descuento general
    taxAmount: number;
    total: number;
    status: QuoteStatus;
    locationId: string;
    items: QuoteItem[];
    notes?: string;
    linkedInvoiceId?: string;
    sequentialId?: number; // ID secuencial para mostrar (COT-039, COT-040, etc.)
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  vehicleId: string;
  vehicleSummary: string;
  serviceRequested: string;
  appointmentDateTime: string; // ISO date string
  status: AppointmentStatus;
  locationId: string;
  advisorId?: string;
  notes?: string;
  linkedWorkOrderId?: string;
}

export enum PurchaseOrderStatus {
    BORRADOR = 'Borrador',
    PEDIDO = 'Pedido',
    RECIBIDO_PARCIAL = 'Recibido Parcial',
    RECIBIDO_COMPLETO = 'Recibido Completo',
    CANCELADO = 'Cancelado',
}

export interface PurchaseOrderItem {
    inventoryItemId: string;
    description: string;
    quantity: number;
    cost: number; // Cost per unit
}

export interface PurchaseOrder {
    id: string;
    supplierId: string;
    supplierName: string;
    issueDate: string;
    expectedDeliveryDate: string;
    items: PurchaseOrderItem[];
    subtotal: number;
    taxAmount: number;
    total: number;
    status: PurchaseOrderStatus;
    locationId: string;
    notes?: string;
}

export type MetricCardVariant = 'default' | 'success' | 'danger';

export type OperatingExpenseCategory = 'Nómina' | 'Arriendo' | 'Servicios Públicos' | 'Marketing' | 'Administrativos' | 'Otro';

export interface OperatingExpense {
    id: string;
    description: string;
    category: OperatingExpenseCategory;
    amount: number;
    date: string;
    locationId: string;
    accountId: string;
    userId: string;
}

export interface CompanyInfo {
    name: string;
    nit: string;
    logoUrl: string;
}

export interface BillingSettings {
    vatRate: number; // Stored as percentage, e.g., 19 for 19%
    currencySymbol: string;
    defaultTerms: string;
    bankInfo: string;
}

export type ServiceCategory = { id: string; name: string; };
export type InventoryCategory = { id: string; name: string; };

export interface OperationsSettings {
    serviceCategories: ServiceCategory[];
    inventoryCategories: InventoryCategory[];
}

export interface DiagnosticSettings {
    basic: DiagnosticItem[];
    intermediate: DiagnosticItem[];
    advanced: DiagnosticItem[];
}

export interface DiagnosticItem {
    id: string;
    name: string;
    description: string;
    category: string;
    required: boolean;
    components: DiagnosticComponent[];
}

export interface DiagnosticComponent {
    id: string;
    name: string;
    required: boolean;
}

export interface AppSettings {
    id?: string;
    companyInfo: CompanyInfo;
    billingSettings: BillingSettings;
    operationsSettings: OperationsSettings;
    diagnosticSettings: DiagnosticSettings;
}

export type NotificationType = 
    | 'NEW_ASSIGNMENT' 
    | 'DIAGNOSTIC_COMPLETED' 
    | 'QUOTE_APPROVED' 
    | 'QUOTE_REJECTED' 
    | 'QUOTE_UPDATED'
    | 'UNFORESEEN_ISSUE_REPORTED' 
    | 'WORK_ORDER_CREATED' 
    | 'WORK_ORDER_CANCELED' 
    | 'WORK_ORDER_ASSIGNED'
    | 'WORK_ORDER_CANCELLED'
    | 'UNFORESEEN_ISSUE'
    | 'WELCOME';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    message: string;
    workOrderId?: string;
    isRead: boolean;
    timestamp: string;
}

// --- Context Types ---

export type ModalType = 
    | 'CREATE_WORK_ORDER'
    | 'EDIT_WORK_ORDER'
    | 'EDIT_CLIENT'
    | 'EDIT_VEHICLE'
    | 'EDIT_STAFF'
    | 'EDIT_SERVICE'
    | 'EDIT_INVENTORY_ITEM'
    | 'EDIT_SUPPLIER'
    | 'ADD_TRANSACTION'
    | 'ADD_OPERATING_EXPENSE'
    | 'REGISTER_PAYMENT'
    | 'CREATE_QUOTE'
    | 'EDIT_QUOTE'
    | 'APPROVE_QUOTE'
    | 'CREATE_PURCHASE_ORDER'
    | 'QUICK_ADD_ITEM'
    | 'SELECT_DIAGNOSTIC_TYPE'
    | 'DIAGNOSTIC_CHECKLIST'
    | 'REGISTER_DELIVERY'
    | 'EDIT_LOCATION'
    | 'EDIT_PERMISSIONS'
    | 'EDIT_SERVICE_CATEGORY'
    | 'EDIT_INVENTORY_CATEGORY'
    | 'EDIT_FINANCIAL_ACCOUNT'
    | 'ASSIGN_ACCOUNTS'
    | 'MANAGE_COMMISSIONS'
    | 'FACTOR_INVOICE'
    | 'RELEASE_RETENTION'
    | 'CREATE_MANUAL_QUOTE'
    | 'ADD_LOAN'
    | 'ADD_LOAN_PAYMENT'
    | 'PROGRESS_UPDATE'
    | 'REPORT_UNFORESEEN_ISSUE'
    | 'ENHANCED_REPORT_UNFORESEEN_ISSUE'
    | 'TRANSACTION_DETAIL'
    | 'SHARE_CLIENT_PORTAL'
    | 'CREATE_APPOINTMENT'
    | 'EDIT_APPOINTMENT';

export interface ModalState {
    type: ModalType | null;
    data?: any;
}

export interface UIContextType {
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
    activeView: string;
    setActiveView: (view: string) => void;
    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (collapsed: boolean) => void;
    isMobileSidebarOpen: boolean,
    setIsMobileSidebarOpen: (open: boolean) => void;
    
    selectedLocationId: string;
    setSelectedLocationId: (id: string) => void;
    
    currentUserId: string | null;
    setCurrentUserId: (id: string) => void;
    currentUser: StaffMember | null;

    modalState: ModalState;
    openModal: (type: ModalType, data?: any) => void;
    closeModal: () => void;
    
    calendarView: CalendarView;
    setCalendarView: (view: CalendarView) => void;

    viewingWorkOrderId: string | null;
    viewingQuoteId: string | null;
    viewingClientId: string | null;
    viewingVehicleId: string | null;
    viewingPurchaseOrderId: string | null;
    viewingInvoiceId: string | null;
    viewingStaffId: string | null;

    setView: (type: 'workOrder' | 'quote' | 'client' | 'vehicle' | 'purchaseOrder' | 'invoice' | 'staff' | null, id: string | null) => void;
}

export interface DataContextType {
    isLoading: boolean;
    locations: Location[];
    workOrders: WorkOrder[];
    clients: Client[];
    vehicles: Vehicle[];
    staffMembers: StaffMember[];
    services: Service[];
    inventoryItems: InventoryItem[];
    suppliers: Supplier[];
    pettyCashTransactions: PettyCashTransaction[];
    operatingExpenses: OperatingExpense[];
    invoices: Invoice[];
    quotes: Quote[];
    purchaseOrders: PurchaseOrder[];
    financialAccounts: FinancialAccount[];
    appSettings: AppSettings | null;
    timeClockEntries: TimeClockEntry[];
    loans: Loan[];
    loanPayments: LoanPayment[];
    notifications: Notification[];
    appointments: Appointment[];
    
    handleMarkNotificationAsRead: (notificationId: string) => Promise<void>;
    handleMarkAllNotificationsAsRead: () => Promise<void>;

    handleSaveLocation: (locationData: Location | Omit<Location, 'id'>) => Promise<void>;
    handleDeleteLocation: (locationId: string) => Promise<void>;
    handleSaveAppSettings: (settings: AppSettings) => Promise<void>;
    handleUpdateStaffRole: (staffId: string, newRole: UserRole) => Promise<void>;
    handleUpdateStaffPermissions: (staffId: string, permissions: Permission[]) => Promise<void>;
    loadAllData: () => Promise<void>;
    refreshWorkOrders: () => Promise<void>;
    forceFullRefresh: () => Promise<void>;
    handleSaveServiceCategory: (category: ServiceCategory | Omit<ServiceCategory, 'id'>) => Promise<void>;
    handleDeleteServiceCategory: (categoryId: string) => Promise<void>;
    handleSaveInventoryCategory: (category: InventoryCategory | Omit<InventoryCategory, 'id'>) => Promise<void>;
    handleDeleteInventoryCategory: (categoryId: string) => Promise<void>;
    handleSaveFinancialAccount: (account: FinancialAccount | Omit<FinancialAccount, 'id'>) => Promise<void>;
    handleDeleteFinancialAccount: (accountId: string) => Promise<void>;
    handleAssignAccountsToUser: (staffId: string, accountIds: string[]) => Promise<void>;


    handleCreateWorkOrder: (data: any) => Promise<WorkOrder | undefined>;
    handleSaveWorkOrder: (data: { id: string; serviceRequested: string; advisorId?: string; staffMemberId?: string; comments?: string; }) => Promise<void>;
    handleCreateWorkOrderFromAppointment: (appointmentId: string) => Promise<void>;
    handleUpdateWorkOrderDiagnosticType: (workOrderId: string, newType: DiagnosticType) => Promise<void>;
    handleSaveClient: (clientData: Client | Omit<Client, 'id' | 'vehicleCount' | 'registrationDate'>) => Promise<void>;
    handleSaveVehicle: (vehicleData: Vehicle | Omit<Vehicle, 'id'>) => Promise<void>;
    handleSaveStaffMember: (staffData: StaffMember | Omit<StaffMember, 'id' | 'avatarUrl'>) => Promise<void>;
    handleDeleteStaffMember: (staffId: string) => Promise<void>;
    handleSaveService: (serviceData: Service | Omit<Service, 'id'>) => Promise<Service>;
    handleDeleteService: (serviceId: string) => Promise<void>;
    handleSaveInventoryItem: (itemData: InventoryItem | Omit<InventoryItem, 'id'>) => Promise<InventoryItem>;
    handleDeleteInventoryItem: (itemId: string) => Promise<void>;
    handleSaveSupplier: (supplierData: Supplier | Omit<Supplier, 'id'>) => Promise<void>;
    handleDeleteSupplier: (supplierId: string) => Promise<void>;
    handleAddTransaction: (transactionData: Omit<PettyCashTransaction, 'id' | 'date'> & { receiptFile?: File | null }) => Promise<void>;
    handleAddOperatingExpense: (expenseData: Omit<OperatingExpense, 'id' | 'date'>) => Promise<void>;
    handleAssignTechnician: (workOrderId: string, staffMemberId: string) => Promise<void>;
    handleAdvanceStage: (workOrderId: string, currentStage: KanbanStage) => Promise<void>;
    handleRetreatStage: (workOrderId: string, currentStage: KanbanStage) => Promise<void>;
    handleCancelOrder: (workOrderId: string, reason: string) => Promise<void>;
    handleCreateInvoiceFromWorkOrder: (workOrderId: string) => Promise<void>;
    handleSaveInvoiceCommissions: (invoiceId: string, commissions: { itemId: string; commission: number }[]) => Promise<void>;
    handleRegisterPayment: (invoiceId: string, paymentData: { amount: number; paymentMethod: PaymentMethod; date: string }) => Promise<void>;
    handleCancelInvoice: (invoiceId: string) => Promise<void>;
    handleSaveDiagnostic: (workOrderId: string, data: any, staffIds: { advisorId?: string; mechanicId?: string; }, recommendedItems: QuoteItem[], diagnosticType: DiagnosticType) => Promise<void>;
    handleSaveQuote: (quoteData: Quote | Omit<Quote, 'id'>, actor?: string) => Promise<void>;
    handleRejectQuote: (quoteId: string, actor?: string) => Promise<void>;
    handleDeleteQuote: (quoteId: string) => Promise<void>;
    handleSavePurchaseOrder: (poData: Omit<PurchaseOrder, 'id'>) => Promise<void>;
    handleReceivePurchaseOrder: (poId: string) => Promise<void>;
    handleRegisterItemCosts: (workOrderId: string, costs: { itemId: string; costPrice: number; supplierId: string }[]) => Promise<void>;
    fixLinkedQuoteIds: (workOrderId: string) => Promise<string[]>;
    handleRegisterDelivery: (workOrderId: string, deliveryData: { deliveryEvidenceFiles: File[]; nextMaintenanceDate: string; nextMaintenanceMileage: string; nextMaintenanceNotes: string; customerConfirmed: boolean; }) => Promise<void>;
    handleFactorInvoice: (invoiceId: string, factoringData: Omit<Invoice['factoringInfo'], 'retentionReleased'>) => Promise<void>;
    handleReleaseRetention: (invoiceId: string, releaseData: { date: string; accountId: string; }) => Promise<void>;
    handleToggleInvoiceVat: (invoiceId: string) => Promise<void>;
    handleClockIn: () => Promise<void>;
    handleClockOut: () => Promise<void>;
    handleAddLoan: (loanData: Omit<Loan, 'id' | 'issueDate'>) => Promise<void>;
    handleAddLoanPayment: (paymentData: Omit<LoanPayment, 'id' | 'paymentDate'>) => Promise<void>;
    handlePostProgressUpdate: (workOrderId: string, notes: string, files: File[]) => Promise<void>;
    handleToggleTaskCompleted: (workOrderId: string, quoteItemId: string, isCompleted: boolean, itemImageFiles?: File[]) => Promise<void>;
    handleReportUnforeseenIssue: (workOrderId: string, issue: UnforeseenIssue) => Promise<void>;
    handleUpdateAllWorkOrderStages: () => Promise<{ updated: number; skipped: number; errors: string[] }>;
    handleRestoreIncorrectlyCompletedOrders: () => Promise<{ restored: number; errors: string[] }>;
    handleFixOrdersWithQuoteStageMismatch: () => Promise<{ fixed: number; errors: string[] }>;
    handleFixSpecificOrder: (workOrderId: string) => Promise<{ success: boolean; message: string }>;
    handleSaveAppointment: (appointmentData: Appointment | Omit<Appointment, 'id'>) => Promise<void>;
    handleConfirmAppointment: (appointmentId: string) => Promise<void>;
    handleCancelAppointment: (appointmentId: string) => Promise<void>;
    handleRescheduleAppointment: (appointmentId: string, newDateTime: string) => Promise<void>;
}