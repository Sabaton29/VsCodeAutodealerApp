



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

// PaymentTerms may come from different shapes in DB/legacy code. Use a
// permissive type here and narrow later if needed.
export type PaymentTerms = any;


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
  locationId?: string;
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
  // Optional runtime fields used by the UI
  permissions?: Permission[];
  assignedAccounts?: string[];
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
  timestamp: string | Date; // ISO date string or Date object
  type: 'in' | 'out';
  notes?: string;
}

export interface Loan {
  id: string;
  staffId: string;
  locationId: string;
  amount: number;
  reason: string;
  issueDate: string | Date; // ISO date string or Date
  deductionPerPayPeriod: number;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: string | Date; // ISO date string or Date
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
  // runtime/DB optional fields sometimes present
  price?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
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
  // optional aliases used in UI/business logic
  currentStock?: number;
  minStockLevel?: number;
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
    date: string | Date;
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
  date: string | Date;
    user: string;
    notes?: string;
    imageUrls?: string[];
    staffMemberId?: string;
    // Información del control de calidad
    qualityChecksData?: Array<{
        id: string;
        description: string;
        category: 'exterior' | 'funcionalidad' | 'verificacion' | 'documentacion';
        status: 'ok' | 'no-ok' | 'na' | 'unset';
        notes?: string;
    }>;
    checklistSummary?: string;
    assignedTechnicianId?: string; // New optional field
}

export type DiagnosticType = 'Básico' | 'Intermedio' | 'Avanzado';

export interface ProgressLogEntry {
  id: string;
    timestamp: string | Date; // ISO date string or Date object
  userId: string;
  userName: string;
  userRole: UserRole;
  notes: string;
  imageUrls?: string[];
}

export interface UnforeseenIssue {
    id: string;
    reportedById: string;
    timestamp: string | Date; // ISO date string or Date object
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
  // allow non-enum literals when data contains different string constants
  status: WorkOrderStatus | string;
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
  cancellationReason?: string;
  // Common DB/API convenience fields
  createdAt?: string | Date;
  updatedAt?: string | Date;
  // Some parts of the code expect flattened ids instead of nested objects
  clientId?: string;
  vehicleId?: string;
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
    quoteId?: string; // ID de la cotización de la que proviene esta factura
    clientId: string;
    clientName: string;
    vehicleSummary: string;
    issueDate: string;
    dueDate: string;
    subtotal: number;
    taxAmount: number;
    total: number;
  // allow non-enum literals from DB or legacy code
  status: InvoiceStatus | string;
    locationId: string;
    items: QuoteItem[];
    notes?: string;
    paymentTerms?: PaymentTerms;
    vatIncluded?: boolean;
    sequentialId?: number; // ID secuencial para mostrar (FAC-001, FAC-002, etc.)
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
  // optional timestamps from DB
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
    deliveryDate?: string; // Fecha de entrega prometida al cliente
    subtotal: number;
    totalDiscount?: number; // Descuento general en porcentaje
    discountAmount?: number; // Monto del descuento general
    taxAmount: number;
  rejectionReason?: string;
    total: number;
  // allow non-enum literals from DB or legacy code
  status: QuoteStatus | string;
    locationId: string;
    items: QuoteItem[];
    notes?: string;
    linkedInvoiceId?: string;
  // optional timestamps
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
  date: string | Date;
    locationId: string;
    accountId: string;
    userId: string;
}

export interface CompanyInfo {
    name: string;
    nit: string;
    logoUrl?: string;
    address?: string;
    phone?: string;
}

export interface BillingSettings {
    vatRate: number; // Stored as percentage, e.g., 19 for 19%
    currencySymbol: string;
    defaultTerms: string;
    bankInfo: string;
  // optional currency code used in some seed data
  currency?: string;
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
  timestamp?: string | Date; // ISO date string or Date object
  components?: DiagnosticComponent[];
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
  timestamp?: string | Date;
  // some code assigns Date objects here
  createdAt?: string | Date;
  updatedAt?: string | Date;
  // short title used in UI lists
  title?: string;
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
    | 'EDIT_APPOINTMENT'
    // Backwards-compatible modal variants used in App
    | 'EDIT_CLIENT_FROM_WORK_ORDER'
    | 'EDIT_VEHICLE_FROM_WORK_ORDER'
    | 'EDIT_CLIENT_FROM_QUOTE'
    | 'EDIT_VEHICLE_FROM_QUOTE';

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
  // Data
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

  // Computed values (optional, many components read these)
  activeWorkOrders?: WorkOrder[];
  completedWorkOrders?: WorkOrder[];
  pendingQuotes?: Quote[];
  approvedQuotes?: Quote[];
  rejectedQuotes?: Quote[];
  unpaidInvoices?: Invoice[];
  paidInvoices?: Invoice[];
  lowStockItems?: InventoryItem[];
  outOfStockItems?: InventoryItem[];

  // Loading / error
  error?: string | null;

  // Basic CRUD handlers (relaxed signatures to match current implementations)
  handleCreateLocation: (...args: any[]) => Promise<any>;
  handleSaveLocation: (...args: any[]) => Promise<any>;
  handleDeleteLocation: (...args: any[]) => Promise<any>;

  handleCreateWorkOrder: (...args: any[]) => Promise<any>;
  handleSaveWorkOrder: (...args: any[]) => Promise<any>;
  handleUpdateWorkOrderDiagnosticType: (...args: any[]) => Promise<any>;
  handleUpdateWorkOrderHistory: (...args: any[]) => Promise<any>;
  handleDeleteWorkOrder: (...args: any[]) => Promise<any>;
  handleRegisterDelivery: (...args: any[]) => Promise<any>;
  handlePostProgressUpdate: (...args: any[]) => Promise<any>;
  handleToggleTaskCompleted: (...args: any[]) => Promise<any>;

  handleCreateClient: (...args: any[]) => Promise<any>;
  handleSaveClient: (...args: any[]) => Promise<any>;
  handleDeleteClient: (...args: any[]) => Promise<any>;
  migrateClientsRegistrationDate: (...args: any[]) => Promise<any>;

  handleCreateVehicle: (...args: any[]) => Promise<any>;
  handleSaveVehicle: (...args: any[]) => Promise<any>;
  handleDeleteVehicle: (...args: any[]) => Promise<any>;

  handleCreateStaffMember: (...args: any[]) => Promise<any>;
  handleSaveStaffMember: (...args: any[]) => Promise<any>;
  handleDeleteStaffMember: (...args: any[]) => Promise<any>;

  // App settings and operations
  handleSaveAppSettings: (...args: any[]) => Promise<any>;
  handleSaveServiceCategory: (...args: any[]) => Promise<any>;
  handleDeleteServiceCategory: (...args: any[]) => Promise<any>;
  handleSaveInventoryCategory: (...args: any[]) => Promise<any>;
  handleDeleteInventoryCategory: (...args: any[]) => Promise<any>;
  handleUpdateStaffRole: (...args: any[]) => Promise<any>;
  handleUpdateStaffPermissions: (...args: any[]) => Promise<any>;
  handleAssignAccountsToUser: (...args: any[]) => Promise<any>;

  // Data loading helpers
  loadAllData: (...args: any[]) => Promise<any>;
  refreshWorkOrders: (...args: any[]) => Promise<any>;
  forceFullRefresh: (...args: any[]) => Promise<any>;

  // Services / Inventory / Suppliers
  handleCreateService: (...args: any[]) => Promise<any>;
  handleSaveService: (...args: any[]) => Promise<any>;
  handleDeleteService: (...args: any[]) => Promise<any>;

  handleCreateInventoryItem: (...args: any[]) => Promise<any>;
  handleSaveInventoryItem: (...args: any[]) => Promise<any>;
  handleDeleteInventoryItem: (...args: any[]) => Promise<any>;

  handleCreateSupplier: (...args: any[]) => Promise<any>;
  handleSaveSupplier: (...args: any[]) => Promise<any>;
  handleDeleteSupplier: (...args: any[]) => Promise<any>;

  // Petty cash
  handleCreatePettyCashTransaction: (...args: any[]) => Promise<any>;
  handleSavePettyCashTransaction: (...args: any[]) => Promise<any>;
  handleDeletePettyCashTransaction: (...args: any[]) => Promise<any>;

  // Invoices
  handleCreateInvoice: (...args: any[]) => Promise<any>;
  handleSaveInvoice: (...args: any[]) => Promise<any>;
  handleDeleteInvoice: (...args: any[]) => Promise<any>;
  handleCreateInvoiceFromWorkOrder: (...args: any[]) => Promise<any>;
  handleToggleInvoiceVat: (...args: any[]) => Promise<any>;

  // Quotes
  handleCreateQuote: (...args: any[]) => Promise<any>;
  handleSaveQuote: (...args: any[]) => Promise<any>;
  handleApproveQuote: (...args: any[]) => Promise<any>;
  handleDeleteQuote: (...args: any[]) => Promise<any>;
  handleGetQuoteWithItems: (...args: any[]) => Promise<any>;

  // Purchase orders
  handleCreatePurchaseOrder: (...args: any[]) => Promise<any>;
  handleSavePurchaseOrder: (...args: any[]) => Promise<any>;
  handleDeletePurchaseOrder: (...args: any[]) => Promise<any>;

  // Operating expenses
  handleCreateOperatingExpense: (...args: any[]) => Promise<any>;
  handleSaveOperatingExpense: (...args: any[]) => Promise<any>;
  handleDeleteOperatingExpense: (...args: any[]) => Promise<any>;

  // Financial accounts
  handleCreateFinancialAccount: (...args: any[]) => Promise<any>;
  handleSaveFinancialAccount: (...args: any[]) => Promise<any>;
  handleDeleteFinancialAccount: (...args: any[]) => Promise<any>;

  // Time clock entries
  handleCreateTimeClockEntry: (...args: any[]) => Promise<any>;
  handleSaveTimeClockEntry: (...args: any[]) => Promise<any>;
  handleDeleteTimeClockEntry: (...args: any[]) => Promise<any>;

  // Loans
  handleCreateLoan: (...args: any[]) => Promise<any>;
  handleSaveLoan: (...args: any[]) => Promise<any>;
  handleDeleteLoan: (...args: any[]) => Promise<any>;

  // Loan payments
  handleCreateLoanPayment: (...args: any[]) => Promise<any>;
  handleSaveLoanPayment: (...args: any[]) => Promise<any>;
  handleDeleteLoanPayment: (...args: any[]) => Promise<any>;

  // Appointments
  handleCreateAppointment: (...args: any[]) => Promise<any>;
  handleSaveAppointment: (...args: any[]) => Promise<any>;
  handleDeleteAppointment: (...args: any[]) => Promise<any>;
  handleConfirmAppointment: (...args: any[]) => Promise<any>;
  handleCancelAppointment: (...args: any[]) => Promise<any>;
  handleRescheduleAppointment: (...args: any[]) => Promise<any>;

  // Complex operations
  handleAssignTechnician: (...args: any[]) => Promise<any>;
  handleCancelOrder: (...args: any[]) => Promise<any>;
  handleSaveDiagnostic: (...args: any[]) => Promise<any>;
  handleAdvanceStage: (...args: any[]) => Promise<any>;
  handleRetreatStage: (...args: any[]) => Promise<any>;
  handleRejectQuote: (...args: any[]) => Promise<any>;
  handleReportUnforeseenIssue: (...args: any[]) => Promise<any>;
  handleUpdateAllWorkOrderStages: (...args: any[]) => Promise<any>;
  handleRestoreIncorrectlyCompletedOrders: (...args: any[]) => Promise<any>;
  handleFixOrdersWithQuoteStageMismatch: (...args: any[]) => Promise<any>;
  handleFixSpecificOrder: (...args: any[]) => Promise<any>;
  handleRegisterItemCosts: (...args: any[]) => Promise<any>;
  fixLinkedQuoteIds: (...args: any[]) => Promise<any>;

  // Utility
  calculateDueDate: (...args: any[]) => any;
  createNotification: (...args: any[]) => Promise<any>;

  // Temporary placeholders implemented inline in DataContext
  handleMarkNotificationAsRead: (...args: any[]) => Promise<any>;
  handleMarkAllNotificationsAsRead: (...args: any[]) => Promise<any>;
  handleCreateWorkOrderFromAppointment: (...args: any[]) => Promise<any>;
  handleAddTransaction: (...args: any[]) => Promise<any>;

  // Misc
  updateLocation: (...args: any[]) => Promise<any>;
}