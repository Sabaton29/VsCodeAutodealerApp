import { WorkOrderStatus, KanbanStage, WorkOrder, KanbanTask, Client, Location, Vehicle, UserRole, Permission, StaffMember, Service, InventoryItem, Supplier, PettyCashTransaction, Invoice, InvoiceStatus, QuoteStatus, Quote, PurchaseOrderStatus, PurchaseOrder, OperatingExpense, FinancialAccount, ServiceCategory, InventoryCategory, DiagnosticType, TimeClockEntry, Loan, LoanPayment, Notification, Appointment, AppointmentStatus } from './types';
import type { IconName } from './components/Icon';

export const SIDEBAR_LINKS: { name: string; icon: IconName; href: string; permission?: Permission }[] = [
    { name: 'Dashboard', icon: 'dashboard', href: '#', permission: 'view:dashboard' },
    { name: 'Órdenes de Trabajo', icon: 'clipboard', href: '#', permission: 'view:work_orders' },
    { name: 'Citas', icon: 'calendar', href: '#', permission: 'view:appointments' },
    { name: 'Clientes', icon: 'users', href: '#', permission: 'view:clients' },
    { name: 'Vehículos', icon: 'car', href: '#', permission: 'view:vehicles' },
    { name: 'Inventario', icon: 'inventory', href: '#', permission: 'view:inventory' },
    { name: 'Catálogo de Servicios', icon: 'services', href: '#', permission: 'view:services' },
    { name: 'Proveedores', icon: 'truck', href: '#', permission: 'view:suppliers' },
    { name: 'Órdenes de Compra', icon: 'list-bullet', href: '#', permission: 'view:purchase_orders' },
    { name: 'Facturación', icon: 'invoice', href: '#', permission: 'view:billing' },
    { name: 'Cotizaciones', icon: 'document-text', href: '#', permission: 'view:quotes' },
    { name: 'Finanzas', icon: 'wallet', href: '#', permission: 'view:finance' },
    { name: 'Personal', icon: 'staff', href: '#', permission: 'view:staff' },
    { name: 'Reportes', icon: 'chart', href: '#', permission: 'view:reports' },
    { name: 'Gestión Ambiental', icon: 'leaf', href: '#', permission: 'view:environmental' },
    { name: 'Ajustes', icon: 'settings', href: '#', permission: 'view:settings' },
];

export const LOCATIONS_DATA: Location[] = [
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Sede Bogotá', city: 'Bogotá D.C.', address: 'Avenida El Dorado # 68C-61', phone: '(601) 555-1010', hourlyRate: 108000 },
    { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Sede Cali', city: 'Cali, Valle', address: 'Calle 5 # 66B-15', phone: '(602) 555-2020', hourlyRate: 95000 },
];

export const FINANCIAL_ACCOUNTS_DATA: FinancialAccount[] = [
    { id: 'ACC-BOG-CASH', name: 'Caja Menor Bogotá', type: 'Caja Menor', locationId: '550e8400-e29b-41d4-a716-446655440001', assignedUserIds: ['S1', 'S2'] },
    { id: 'ACC-CAL-CASH', name: 'Caja Menor Cali', type: 'Caja Menor', locationId: '550e8400-e29b-41d4-a716-446655440002', assignedUserIds: [] },
    { id: 'ACC-BOG-BANK', name: 'Banco Bogotá', type: 'Banco', locationId: '550e8400-e29b-41d4-a716-446655440001', assignedUserIds: ['S1'] },
    { id: 'ACC-CAL-BANK', name: 'Banco Cali', type: 'Banco', locationId: '550e8400-e29b-41d4-a716-446655440002', assignedUserIds: [] },
];

export const STAFF_DATA: StaffMember[] = [
    { id: 'S1', name: 'Admin Taller', email: 'admin@autodealer.com', role: UserRole.ADMINISTRADOR, avatarUrl: 'https://i.pravatar.cc/48?u=S1', locationId: '550e8400-e29b-41d4-a716-446655440001', documentType: 'Cédula de Ciudadanía', documentNumber: '1000000001', salaryType: 'Mensual', salaryAmount: 6000000, isProLabore: true, requiresTimeClock: false },
    { id: 'S2', name: 'Asesor Juan', email: 'juan.asesor@autodealer.com', role: UserRole.ASESOR_SERVICIO, avatarUrl: 'https://i.pravatar.cc/48?u=S2', locationId: '550e8400-e29b-41d4-a716-446655440001', documentType: 'Cédula de Ciudadanía', documentNumber: '1000000002', salaryType: 'Mensual', salaryAmount: 2500000, requiresTimeClock: false },
    { id: 'S3', name: 'Alex Ray', email: 'alex.ray@autodealer.com', role: UserRole.MECANICO, avatarUrl: 'https://i.pravatar.cc/48?u=S3', specialty: 'Motor y Transmisión', locationId: '550e8400-e29b-41d4-a716-446655440001', documentType: 'Cédula de Ciudadanía', documentNumber: '1000000003', salaryType: 'Por Hora', salaryAmount: 20000, requiresTimeClock: true },
    { id: 'S4', name: 'Sam Wilson', email: 'sam.wilson@autodealer.com', role: UserRole.MECANICO, avatarUrl: 'https://i.pravatar.cc/48?u=S4', specialty: 'Frenos y Suspensión', locationId: '550e8400-e29b-41d4-a716-446655440001', documentType: 'Cédula de Ciudadanía', documentNumber: '1000000004', salaryType: 'Por Hora', salaryAmount: 18000, requiresTimeClock: true },
    { id: 'S5', name: 'Maria Garcia', email: 'maria.garcia@autodealer.com', role: UserRole.MECANICO, avatarUrl: 'https://i.pravatar.cc/48?u=S5', specialty: 'Diagnóstico Electrónico', locationId: '550e8400-e29b-41d4-a716-446655440002', documentType: 'Cédula de Ciudadanía', documentNumber: '2000000001', salaryType: 'Por Hora', salaryAmount: 22000, requiresTimeClock: true },
    { id: 'S6', name: 'Pedro Ramos', email: 'pedro.ramos@autodealer.com', role: UserRole.MECANICO, avatarUrl: 'https://i.pravatar.cc/48?u=S6', specialty: 'General', locationId: '550e8400-e29b-41d4-a716-446655440002', documentType: 'Cédula de Ciudadanía', documentNumber: '2000000002', salaryType: 'Quincenal', salaryAmount: 1000000, requiresTimeClock: true },
    { id: 'S7', name: 'Luis Vega', email: 'luis.vega@autodealer.com', role: UserRole.MECANICO, avatarUrl: 'https://i.pravatar.cc/48?u=S7', specialty: 'Aire Acondicionado', locationId: '550e8400-e29b-41d4-a716-446655440001', documentType: 'Cédula de Ciudadanía', documentNumber: '1000000005', customPermissions: ['manage:quotes'], salaryType: 'Por Hora', salaryAmount: 19000, requiresTimeClock: true },
];

export const TIME_CLOCK_DATA: TimeClockEntry[] = [
  { id: 'TC1', staffId: 'S3', locationId: '550e8400-e29b-41d4-a716-446655440001', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), type: 'in' },
  { id: 'TC2', staffId: 'S3', locationId: '550e8400-e29b-41d4-a716-446655440001', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), type: 'out' },
  { id: 'TC3', staffId: 'S3', locationId: '550e8400-e29b-41d4-a716-446655440001', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), type: 'in' },
];

export const LOANS_DATA: Loan[] = [
  { id: 'L-001', staffId: 'S4', locationId: '550e8400-e29b-41d4-a716-446655440001', amount: 500000, reason: 'Adelanto de nómina', issueDate: '2024-07-10', deductionPerPayPeriod: 100000 },
];

export const LOAN_PAYMENTS_DATA: LoanPayment[] = [
  { id: 'LP-001', loanId: 'L-001', amount: 100000, paymentDate: '2024-07-15', isPayrollDeduction: true },
];

export const NOTIFICATIONS_DATA: Notification[] = [
    { id: 'N1', userId: 'S2', type: 'WELCOME', message: '¡Bienvenido a Autodealer Cloud!', isRead: false, timestamp: new Date().toISOString() },
];

export const APPOINTMENTS_DATA: Appointment[] = [
    { id: 'APP-1', clientId: 'C1', clientName: 'Juan Pérez', vehicleId: 'V1', vehicleSummary: 'Chevrolet Spark GT (ABC-123)', serviceRequested: 'Revisión de frenos', appointmentDateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), status: AppointmentStatus.PROGRAMADA, locationId: '550e8400-e29b-41d4-a716-446655440001', advisorId: 'S2' },
    { id: 'APP-2', clientId: 'C2', clientName: 'Ana Gómez', vehicleId: 'V2', vehicleSummary: 'Renault Duster (DEF-456)', serviceRequested: 'Cambio de aceite', appointmentDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), status: AppointmentStatus.CONFIRMADA, locationId: '550e8400-e29b-41d4-a716-446655440002' },
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    [UserRole.ADMINISTRADOR]: [
        'view:dashboard', 'view:work_orders', 'create:work_order', 'edit:work_order', 'cancel:work_order', 'assign:technician', 'advance:work_order_stage', 'start:diagnostic',
        'view:clients', 'manage:clients', 'view:vehicles', 'manage:vehicles', 'view:inventory', 'manage:inventory', 'view:services', 'manage:services',
        'view:suppliers', 'manage:suppliers', 'view:billing', 'manage:billing', 'view:finance', 'manage:finance', 'view:staff', 'manage:staff',
        'view:reports', 'view:environmental', 'manage:environmental', 'view:settings', 'manage:settings', 'view:quotes', 'manage:quotes', 'approve:quote',
        'view:purchase_orders', 'manage:purchase_orders', 'receive:purchase_order',
        'manage:payroll', 'manage:time_clock', 'manage:loans', 'post:progress_update', 'toggle:task_completed', 'report:unforeseen_issue',
        'view:appointments', 'manage:appointments',
    ],
    [UserRole.JEFE_TALLER]: [
        'view:dashboard', 'view:work_orders', 'edit:work_order', 'assign:technician', 'advance:work_order_stage', 'start:diagnostic', 'view:staff', 'view:reports',
        'view:payroll', 'view:time_clock', 'view:loans', 'post:progress_update', 'toggle:task_completed', 'report:unforeseen_issue',
        'view:appointments', 'manage:appointments',
    ],
    [UserRole.ASESOR_SERVICIO]: [
        'view:dashboard', 'view:work_orders', 'create:work_order', 'edit:work_order', 'view:clients', 'manage:clients', 'view:vehicles', 'manage:vehicles', 'view:services', 'view:quotes', 'manage:quotes', 'approve:quote', 'manage:finance',
        'post:progress_update',
        'view:appointments', 'manage:appointments',
    ],
    [UserRole.MECANICO]: [
        'view:dashboard', 'view:own_work_orders', 'view:work_orders', 'start:diagnostic',
        'post:progress_update', 'toggle:task_completed', 'report:unforeseen_issue',
    ],
    [UserRole.ALMACEN]: [
        'view:inventory', 'manage:inventory', 'view:suppliers', 'view:finance', 'view:purchase_orders', 'manage:purchase_orders', 'receive:purchase_order',
    ],
    [UserRole.FACTURACION]: [
        'view:billing', 'manage:billing', 'view:finance', 'view:payroll',
    ],
};

export const DEFAULT_SERVICE_CATEGORIES: ServiceCategory[] = [
    { id: 'cat-svc-1', name: 'Mantenimiento' },
    { id: 'cat-svc-2', name: 'Diagnóstico' },
    { id: 'cat-svc-3', name: 'Frenos' },
    { id: 'cat-svc-4', name: 'Suspensión' },
    { id: 'cat-svc-5', name: 'Motor' },
    { id: 'cat-svc-6', name: 'Llantas' },
    { id: 'cat-svc-7', name: 'Estética' },
    { id: 'cat-svc-8', name: 'Eléctrico' },
    { id: 'cat-svc-9', name: 'Otro' },
];

export const DEFAULT_INVENTORY_CATEGORIES: InventoryCategory[] = [
    { id: 'cat-inv-1', name: 'Repuestos' },
    { id: 'cat-inv-2', name: 'Filtros' },
    { id: 'cat-inv-3', name: 'Lubricantes' },
    { id: 'cat-inv-4', name: 'Encendido' },
    { id: 'cat-inv-5', name: 'Frenos' },
    { id: 'cat-inv-6', name: 'Suspensión' },
    { id: 'cat-inv-7', name: 'Llantas' },
    { id: 'cat-inv-8', name: 'Aceites' },
    { id: 'cat-inv-9', name: 'Baterías' },
    { id: 'cat-inv-10', name: 'Fluidos' },
    { id: 'cat-inv-11', name: 'Eléctrico' },
    { id: 'cat-inv-12', name: 'Otro' },
];

export const CLIENTS_DATA: Client[] = [
    { id: 'C1', name: 'Juan Pérez', email: 'juan.perez@email.com', phone: '3001234567', vehicleCount: 2, registrationDate: '2023-01-15', locationId: '550e8400-e29b-41d4-a716-446655440001', personType: 'Persona Natural', idType: 'Cédula de Ciudadanía', idNumber: '12345678' },
    { id: 'C2', name: 'Ana Gómez', email: 'ana.gomez@email.com', phone: '3109876543', vehicleCount: 1, registrationDate: '2023-03-22', locationId: '550e8400-e29b-41d4-a716-446655440002', personType: 'Persona Natural', idType: 'Cédula de Ciudadanía', idNumber: '87654321' },
    { id: 'C3', name: 'Carlos Ruiz', email: 'carlos.ruiz@email.com', phone: '3215558899', vehicleCount: 3, registrationDate: '2023-05-10', locationId: '550e8400-e29b-41d4-a716-446655440001', personType: 'Persona Natural', idType: 'Cédula de Ciudadanía', idNumber: '11223344' },
    { id: 'C4', name: 'Lucía Fernández', email: 'lucia.fernandez@email.com', phone: '3156781234', vehicleCount: 1, registrationDate: '2023-06-01', locationId: '550e8400-e29b-41d4-a716-446655440002', personType: 'Persona Natural', idType: 'Cédula de Ciudadanía', idNumber: '44332211' },
    { id: 'C5', name: 'Miguel Castro', email: 'miguel.castro@email.com', phone: '3012345678', vehicleCount: 1, registrationDate: '2024-02-28', locationId: '550e8400-e29b-41d4-a716-446655440001', personType: 'Persona Natural', idType: 'Cédula de Ciudadanía', idNumber: '55667788' },
    { id: 'C6', name: 'Sofía Martínez', email: 'sofia.martinez@email.com', phone: '3128765432', vehicleCount: 2, registrationDate: '2024-04-12', locationId: '550e8400-e29b-41d4-a716-446655440002', personType: 'Persona Natural', idType: 'Cédula de Ciudadanía', idNumber: '88776655' },
    { id: 'C7', name: 'camilo marroquin', email: 'camilo.marroquin@email.com', phone: '3128765432', vehicleCount: 1, registrationDate: '2024-05-12', locationId: '550e8400-e29b-41d4-a716-446655440001', personType: 'Persona Natural', idType: 'Cédula de Ciudadanía', idNumber: '88776656' },
    { id: 'C8', name: 'Bob Johnson', email: 'bob.johnson@email.com', phone: '3128765433', vehicleCount: 1, registrationDate: '2024-06-12', locationId: '550e8400-e29b-41d4-a716-446655440001', personType: 'Persona Natural', idType: 'Cédula de Ciudadanía', idNumber: '88776657' },
    { id: 'C9', name: 'Constructora XYZ', email: 'constructora.xyz@email.com', phone: '3128765434', vehicleCount: 1, registrationDate: '2024-06-15', locationId: '550e8400-e29b-41d4-a716-446655440002', personType: 'Persona Jurídica', idType: 'NIT', idNumber: '900123456-7' },
    { id: 'C10', name: 'Sarah Williams', email: 'sarah.williams@email.com', phone: '3128765435', vehicleCount: 1, registrationDate: '2024-06-18', locationId: '550e8400-e29b-41d4-a716-446655440001', personType: 'Persona Natural', idType: 'Cédula de Ciudadanía', idNumber: '88776658' },
    { id: 'C11', name: 'Emily Davis', email: 'emily.davis@email.com', phone: '3128765436', vehicleCount: 1, registrationDate: '2024-06-20', locationId: '550e8400-e29b-41d4-a716-446655440002', personType: 'Persona Natural', idType: 'Cédula de Ciudadanía', idNumber: '88776659' },
];

export const VEHICLES_DATA: Vehicle[] = [
  { id: 'V1', clientId: 'C1', make: 'Chevrolet', model: 'Spark GT', plate: 'ABC-123', year: 2020, color: 'Rojo' },
  { id: 'V1-2', clientId: 'C1', make: 'Ford', model: 'Raptor', plate: 'RAP-456', year: 2022, color: 'Negro' },
  { id: 'V2', clientId: 'C2', make: 'Renault', model: 'Duster', plate: 'DEF-456', year: 2021, color: 'Gris' },
  { id: 'V3', clientId: 'C3', make: 'Mazda', model: '3', plate: 'GHI-789', year: 2023, color: 'Blanco' },
  { id: 'V4', clientId: 'C4', make: 'Kia', model: 'Picanto', plate: 'JKL-012', year: 2019, color: 'Azul' },
  { id: 'V5', clientId: 'C5', make: 'Nissan', model: 'Versa', plate: 'MNO-345', year: 2022, color: 'Plata' },
  { id: 'V6', clientId: 'C6', make: 'Ford', model: 'Fiesta', plate: 'PQR-678', year: 2018, color: 'Rojo' },
  { id: 'V7', clientId: 'C7', make: 'Suzuki', model: 'S-Cross', plate: 'LMS275', year: 2023, color: 'Gris' },
  { id: 'V8', clientId: 'C8', make: 'Toyota', model: 'Camry', plate: 'HJK789', year: 2022, color: 'Negro' },
  { id: 'V9', clientId: 'C9', make: 'Jeep', model: 'Wrangler', plate: 'PQS345', year: 2024, color: 'Verde' },
  { id: 'V10', clientId: 'C10', make: 'Chevrolet', model: 'Equinox', plate: 'LMN012', year: 2021, color: 'Azul' },
  { id: 'V11', clientId: 'C11', make: 'Nissan', model: 'Altima', plate: 'TUV678', year: 2020, color: 'Blanco' },
];

export const SERVICES_DATA: Service[] = [
    { id: 'SVC-001', name: 'Cambio de Aceite y Filtro', category: 'Mantenimiento Preventivo', durationHours: 1, locationId: '550e8400-e29b-41d4-a716-446655440001' },
    { id: 'SVC-002', name: 'Alineación y Balanceo', category: 'Llantas y Suspensión', durationHours: 1.5, locationId: '550e8400-e29b-41d4-a716-446655440001' },
    { id: 'SVC-003', name: 'Diagnóstico con Escáner', category: 'Diagnóstico', durationHours: 0.75, locationId: '550e8400-e29b-41d4-a716-446655440001' },
    { id: 'SVC-004', name: 'Revisión de Frenos', category: 'Mantenimiento Preventivo', durationHours: 2, locationId: '550e8400-e29b-41d4-a716-446655440001' },
    { id: 'SVC-005', name: 'Sincronización de Motor', category: 'Motor', durationHours: 4, locationId: '550e8400-e29b-41d4-a716-446655440002' },
    { id: 'SVC-006', name: 'Lavado General', category: 'Estética', durationHours: 1, locationId: '550e8400-e29b-41d4-a716-446655440002' },
];

export const SUPPLIERS_DATA: Supplier[] = [
    { id: 'SUP-001', name: 'Autopartes El Motor S.A.S', nit: '900.123.456-1', contactPerson: 'Carlos Ramirez', phone: '3101112233', email: 'ventas@elmotor.com', category: 'Repuestos y Motor', locationId: '550e8400-e29b-41d4-a716-446655440001', hasCredit: true },
    { id: 'SUP-002', name: 'Importadora de Llantas del Pacífico', nit: '800.987.654-2', contactPerson: 'Lucia Mendoza', phone: '3204445566', email: 'contacto@llantaspacifico.com', category: 'Llantas', locationId: '550e8400-e29b-41d4-a716-446655440002', hasCredit: false },
    { id: 'SUP-003', name: 'Lubricantes y Filtros de Colombia', nit: '901.555.888-3', contactPerson: 'Sofia Giraldo', phone: '3007778899', email: 'pedidos@lubrifiltros.co', category: 'Aceites y Filtros', locationId: '550e8400-e29b-41d4-a716-446655440001', hasCredit: true, isPaymentPartner: true },
];

export const INVENTORY_DATA: InventoryItem[] = [
    { id: 'INV-001', sku: 'FIL-ACI-001', name: 'Filtro de Aceite', brand: 'ACDelco', supplierId: 'SUP-003', category: 'Filtros', stock: 25, costPrice: 15000, salePrice: 25000, margin: 66.67, taxRate: 19, locationId: '550e8400-e29b-41d4-a716-446655440001' },
    { id: 'INV-002', sku: 'ACE-SNT-5W30', name: 'Aceite Sintético 5W30 Mobil 1 (Litro)', brand: 'Mobil', supplierId: 'SUP-003', category: 'Aceites', stock: 50, costPrice: 35000, salePrice: 55000, margin: 57.14, taxRate: 19, locationId: '550e8400-e29b-41d4-a716-446655440001' },
    { id: 'INV-003', sku: 'PST-FRN-CER', name: 'Pastillas de Freno Cerámicas', brand: 'Brembo', supplierId: 'SUP-001', category: 'Frenos', stock: 8, costPrice: 90000, salePrice: 150000, margin: 66.67, taxRate: 19, locationId: '550e8400-e29b-41d4-a716-446655440001' },
    { id: 'INV-004', sku: 'BJA-SPK-NGK', name: 'Bujía de Iridio', brand: 'NGK', supplierId: 'SUP-001', category: 'Motor', stock: 100, costPrice: 20000, salePrice: 35000, margin: 75, taxRate: 19, locationId: '550e8400-e29b-41d4-a716-446655440001' },
    { id: 'INV-005', sku: 'LLN-205-55R16', name: 'Llanta Primacy 4 205/55R16', brand: 'Michelin', supplierId: 'SUP-002', category: 'Llantas', stock: 12, costPrice: 350000, salePrice: 480000, margin: 37.14, taxRate: 19, locationId: '550e8400-e29b-41d4-a716-446655440002' },
    { id: 'INV-006', sku: 'BTR-12V-750A', name: 'Batería 12V 750A', brand: 'MAC', supplierId: 'SUP-001', category: 'Eléctrico', stock: 5, costPrice: 280000, salePrice: 400000, margin: 42.86, taxRate: 19, locationId: '550e8400-e29b-41d4-a716-446655440002' },
    { id: 'INV-007', sku: 'REF-50-50', name: 'Refrigerante 50/50 (Galón)', brand: 'Prestone', supplierId: 'SUP-003', category: 'Fluidos', stock: 0, costPrice: 45000, salePrice: 65000, margin: 44.44, taxRate: 19, locationId: '550e8400-e29b-41d4-a716-446655440002' },
];

export const PETTY_CASH_DATA: PettyCashTransaction[] = [
    { id: 'TR-001', type: 'income', description: 'Base de caja inicial', amount: 500000, date: '2024-07-01', paymentMethod: 'Efectivo', locationId: '550e8400-e29b-41d4-a716-446655440001', accountId: 'ACC-BOG-CASH', userId: 'S1' },
    { id: 'TR-002', type: 'expense', description: 'Compra de 10 Filtros de Aceite', amount: 150000, date: '2024-07-02', paymentMethod: 'Crédito', supplierId: 'SUP-003', locationId: '550e8400-e29b-41d4-a716-446655440001', accountId: 'ACC-BOG-CASH', userId: 'S2' },
    { id: 'TR-003', type: 'expense', description: 'Pago de servicio de agua', amount: 85000, date: '2024-07-03', paymentMethod: 'Efectivo', locationId: '550e8400-e29b-41d4-a716-446655440001', receiptImageUrl: '/receipt-placeholder.png', accountId: 'ACC-BOG-CASH', userId: 'S2' },
    { id: 'TR-004', type: 'expense', description: 'Compra de refrigerios', amount: 25000, date: '2024-07-04', paymentMethod: 'Tarjeta de Crédito', locationId: '550e8400-e29b-41d4-a716-446655440001', accountId: 'ACC-BOG-BANK', userId: 'S1' },
    { id: 'TR-005', type: 'income', description: 'Base de caja inicial', amount: 400000, date: '2024-07-01', paymentMethod: 'Efectivo', locationId: '550e8400-e29b-41d4-a716-446655440002', accountId: 'ACC-CAL-CASH', userId: 'S1' },
    { id: 'TR-006', type: 'expense', description: 'Compra de 5 Baterías', amount: 1400000, date: '2024-07-05', paymentMethod: 'Crédito', supplierId: 'SUP-001', locationId: '550e8400-e29b-41d4-a716-446655440001', accountId: 'ACC-BOG-CASH', userId: 'S2' },
];

export const OPERATING_EXPENSES_DATA: OperatingExpense[] = [
    { id: 'OE-001', description: 'Nómina - Primera Quincena', category: 'Nómina', amount: 8500000, date: '2024-07-15', locationId: '550e8400-e29b-41d4-a716-446655440001', accountId: 'ACC-BOG-BANK', userId: 'S1' },
    { id: 'OE-002', description: 'Arriendo Bodega Principal', category: 'Arriendo', amount: 4500000, date: '2024-07-05', locationId: '550e8400-e29b-41d4-a716-446655440001', accountId: 'ACC-BOG-BANK', userId: 'S1' },
    { id: 'OE-003', description: 'Servicios Públicos (Agua, Luz, Internet)', category: 'Servicios Públicos', amount: 1250000, date: '2024-07-10', locationId: '550e8400-e29b-41d4-a716-446655440001', accountId: 'ACC-BOG-BANK', userId: 'S1' },
];


export const WORK_ORDERS_DATA: WorkOrder[] = [
    { id: 'SO-1079', client: { id: 'C7', name: 'camilo marroquin' }, vehicle: { id: 'V7', make: 'Suzuki', model: 'S-Cross', plate: 'LMS275' }, date: '2025-07-27', stage: KanbanStage.RECEPCION, status: WorkOrderStatus.EN_PROCESO, total: 0, locationId: '550e8400-e29b-41d4-a716-446655440001', serviceRequested: 'ruido suspensión delantera', staffMemberId: 'S3', timeInStage: '6d 2h 17m', services: [], history: [{ stage: 'Recepción', date: '2025-07-27T23:31:00Z', user: 'Admin Taller', notes: 'Vehículo ingresa por ruido en suspensión.' }], linkedQuoteIds: [], publicAccessToken: 'tok-so1079-abcdef123456' },
    { id: 'SO-1003', client: { id: 'C8', name: 'Bob Johnson' }, vehicle: { id: 'V8', make: 'Toyota', model: 'Camry', plate: 'HJK789' }, date: '2024-07-20', stage: KanbanStage.EN_REPARACION, status: WorkOrderStatus.EN_PROCESO, total: 350000, locationId: '550e8400-e29b-41d4-a716-446655440001', serviceRequested: 'Cambio de Aceite', staffMemberId: 'S4', timeInStage: '127d 18h 17m', services: [{ serviceId: 'SVC-001', serviceName: 'Cambio de Aceite y Filtro', price: 108000 }], history: [{ stage: 'Recepción', date: '2024-07-20T10:00:00Z', user: 'Asesor Juan' }], linkedQuoteIds: ['COT-001'], publicAccessToken: 'tok-so1003-abcdef123457' },
    { id: 'SO-1005', client: { id: 'C9', name: 'Constructora XYZ' }, vehicle: { id: 'V9', make: 'Jeep', model: 'Wrangler', plate: 'PQS345' }, date: '2024-07-19', stage: KanbanStage.DIAGNOSTICO, status: WorkOrderStatus.EN_PROCESO, total: 1200000, locationId: '550e8400-e29b-41d4-a716-446655440002', serviceRequested: 'Diagnóstico Luz "Check Engine"', staffMemberId: 'S5', timeInStage: '128d 4h 17m', services: [], history: [{ stage: 'Recepción', date: '2024-07-19T09:30:00Z', user: 'Admin Taller' }], linkedQuoteIds: [], publicAccessToken: 'tok-so1005-abcdef123458' },
    { id: 'SO-1004', client: { id: 'C10', name: 'Sarah Williams' }, vehicle: { id: 'V10', make: 'Chevrolet', model: 'Equinox', plate: 'LMN012' }, date: '2024-07-18', stage: KanbanStage.DIAGNOSTICO, status: WorkOrderStatus.EN_PROCESO, total: 150000, locationId: '550e8400-e29b-41d4-a716-446655440001', serviceRequested: 'Rotación de Llantas', timeInStage: '6d 2h 17m', staffMemberId: 'S3', services: [], history: [{ stage: 'Recepción', date: '2024-07-18T14:00:00Z', user: 'Asesor Juan' }], linkedQuoteIds: [], publicAccessToken: 'tok-so1004-abcdef123459' },
    { id: 'SO-1006', client: { id: 'C11', name: 'Emily Davis' }, vehicle: { id: 'V11', make: 'Nissan', model: 'Altima', plate: 'TUV678' }, date: '2024-07-17', stage: KanbanStage.LISTO_ENTREGA, status: WorkOrderStatus.LISTO_ENTREGA, total: 500000, locationId: '550e8400-e29b-41d4-a716-446655440002', serviceRequested: 'Prueba de Batería', staffMemberId: 'S4', timeInStage: '129d 17h 17m', services: [], history: [{ stage: 'Recepción', date: '2024-07-17T11:00:00Z', user: 'Admin Taller' }], linkedQuoteIds: [], publicAccessToken: 'tok-so1006-abcdef123450' },
    { id: 'OT-002', client: { id: 'C2', name: 'Ana Gómez' }, vehicle: { id: 'V2', make: 'Renault', model: 'Duster', plate: 'DEF-456' }, date: '2024-07-21', stage: KanbanStage.LISTO_ENTREGA, status: WorkOrderStatus.LISTO_ENTREGA, total: 780000, locationId: '550e8400-e29b-41d4-a716-446655440002', serviceRequested: 'Revisión General', staffMemberId: 'S6', timeInStage: '2d 4h 10m', services: [], history: [{ stage: 'Recepción', date: '2024-07-21T12:00:00Z', user: 'Admin Taller' }], linkedQuoteIds: [], publicAccessToken: 'tok-ot002-bcdefg234561' },
    { id: 'OT-003', client: { id: 'C3', name: 'Carlos Ruiz' }, vehicle: { id: 'V3', make: 'Mazda', model: '3', plate: 'GHI-789' }, date: '2024-07-18', stage: KanbanStage.CONTROL_CALIDAD, status: WorkOrderStatus.ESPERA_REPUESTOS, total: 1200000, locationId: '550e8400-e29b-41d4-a716-446655440001', serviceRequested: 'Alineación y Balanceo', staffMemberId: 'S7', timeInStage: '1d 1h 5m', services: [{ serviceId: 'SVC-002', serviceName: 'Alineación y Balanceo', price: 162000 }], history: [{ stage: 'Recepción', date: '2024-07-18T16:00:00Z', user: 'Asesor Juan' }], linkedQuoteIds: [], publicAccessToken: 'tok-ot003-cdefgh345672' },
];

export const INVOICES_DATA: Invoice[] = [
    { id: 'INV-001', workOrderId: 'OT-002', clientId: 'C2', clientName: 'Ana Gómez', vehicleSummary: 'Renault Duster (DEF-456)', issueDate: '2024-07-22', dueDate: '2024-08-21', subtotal: 655462, taxAmount: 124538, total: 780000, status: InvoiceStatus.PAGADA, locationId: '550e8400-e29b-41d4-a716-446655440002', items: [{ id: 'SVC-006', type: 'service', description: 'Revisión General', quantity: 1, unitPrice: 655462, taxRate: 19 }] },
    { id: 'INV-002', workOrderId: 'OT-003', clientId: 'C3', clientName: 'Carlos Ruiz', vehicleSummary: 'Mazda 3 (GHI-789)', issueDate: '2024-07-19', dueDate: '2024-08-18', subtotal: 1008403, taxAmount: 191597, total: 1200000, status: InvoiceStatus.PENDIENTE, locationId: '550e8400-e29b-41d4-a716-446655440001', items: [{ id: 'SVC-002', type: 'service', description: 'Alineación y Balanceo', quantity: 1, unitPrice: 1008403, taxRate: 19 }] },
    { id: 'INV-003', workOrderId: 'SO-1006', clientId: 'C11', clientName: 'Emily Davis', vehicleSummary: 'Nissan Altima (TUV678)', issueDate: '2024-07-18', dueDate: '2024-07-25', subtotal: 420168, taxAmount: 79832, total: 500000, status: InvoiceStatus.VENCIDA, locationId: '550e8400-e29b-41d4-a716-446655440002', items: [{ id: 'INV-006', type: 'inventory', description: 'Batería 12V 750A', quantity: 1, unitPrice: 420168, taxRate: 19 }] },
];

export const QUOTES_DATA: Quote[] = [
    {
        id: 'COT-001',
        workOrderId: 'SO-1003',
        clientId: 'C8',
        clientName: 'Bob Johnson',
        vehicleSummary: 'Toyota Camry (HJK789)',
        issueDate: '2024-07-20',
        expiryDate: '2024-08-04',
        subtotal: 220000,
        taxAmount: 41800,
        total: 261800,
        status: QuoteStatus.APROBADO,
        locationId: '550e8400-e29b-41d4-a716-446655440001',
        items: [
            { id: 'SVC-003', type: 'service', description: 'Diagnóstico con Escáner', quantity: 1, unitPrice: 80000, taxRate: 19 },
            { id: 'INV-004', type: 'inventory', description: 'Bujía de Iridio', quantity: 4, unitPrice: 35000, taxRate: 19 },
        ],
        notes: 'Se requiere cambio de bujías según diagnóstico. Se recomienda realizar alineación.',
    },
];

export const PURCHASE_ORDERS_DATA: PurchaseOrder[] = [
    {
        id: 'OC-001',
        supplierId: 'SUP-001',
        supplierName: 'Autopartes El Motor S.A.S',
        issueDate: '2024-07-25',
        expectedDeliveryDate: '2024-08-01',
        items: [
            { inventoryItemId: 'INV-003', description: 'Pastillas de Freno Cerámicas', quantity: 10, cost: 85000 },
            { inventoryItemId: 'INV-004', description: 'Bujía de Iridio', quantity: 50, cost: 18000 },
        ],
        subtotal: 1750000,
        taxAmount: 332500,
        total: 2082500,
        status: PurchaseOrderStatus.PEDIDO,
        locationId: '550e8400-e29b-41d4-a716-446655440001',
        notes: 'Pedido urgente para stock de alta rotación.',
    },
    {
        id: 'OC-002',
        supplierId: 'SUP-003',
        supplierName: 'Lubricantes y Filtros de Colombia',
        issueDate: '2024-07-28',
        expectedDeliveryDate: '2024-08-05',
        items: [
            { inventoryItemId: 'INV-001', description: 'Filtro de Aceite', quantity: 20, cost: 14500 },
            { inventoryItemId: 'INV-002', description: 'Aceite Sintético 5W30 Mobil 1 (Litro)', quantity: 30, cost: 34000 },
        ],
        subtotal: 1310000,
        taxAmount: 248900,
        total: 1558900,
        status: PurchaseOrderStatus.RECIBIDO_COMPLETO,
        locationId: '550e8400-e29b-41d4-a716-446655440001',
    },
];


export const KANBAN_TASKS_DATA: KanbanTask[] = [
    { id: 'K1', vehicle: { id: 'V6', make: 'Ford', model: 'Fiesta', plate: 'PQR-678' }, stage: KanbanStage.RECEPCION, mechanic: 'Sin Asignar', locationId: '550e8400-e29b-41d4-a716-446655440001' },
    { id: 'K2', vehicle: { id: 'V7', make: 'VW', model: 'Jetta', plate: 'STU-901' }, stage: KanbanStage.DIAGNOSTICO, mechanic: 'Luis Vega', locationId: '550e8400-e29b-41d4-a716-446655440001' },
    { id: 'K3', vehicle: { id: 'V8', make: 'Toyota', model: 'Corolla', plate: 'VWX-234' }, stage: KanbanStage.EN_REPARACION, mechanic: 'Pedro Ramos', locationId: '550e8400-e29b-41d4-a716-446655440002' },
    { id: 'K4', vehicle: { id: 'V9', make: 'Hyundai', model: 'Accent', plate: 'YZA-567' }, stage: KanbanStage.CONTROL_CALIDAD, mechanic: 'Luis Vega', locationId: '550e8400-e29b-41d4-a716-446655440001' },
    { id: 'K5', vehicle: { id: 'V10', make: 'Chevrolet', model: 'Onix', plate: 'BCD-890' }, stage: KanbanStage.EN_REPARACION, mechanic: 'Pedro Ramos', locationId: '550e8400-e29b-41d4-a716-446655440002' },
    { id: 'K6', vehicle: { id: 'V2', make: 'Renault', model: 'Duster', plate: 'DEF-456' }, stage: KanbanStage.LISTO_ENTREGA, mechanic: 'Pedro Ramos', locationId: '550e8400-e29b-41d4-a716-446655440002' },
    { id: 'K7', vehicle: { id: 'V3', make: 'Mazda', model: '3', plate: 'GHI-789' }, stage: KanbanStage.ESPERA_APROBACION, mechanic: 'Luis Vega', locationId: '550e8400-e29b-41d4-a716-446655440001' },
];

export const KANBAN_STAGES_ORDER: KanbanStage[] = [
    KanbanStage.RECEPCION,
    KanbanStage.DIAGNOSTICO,
    KanbanStage.PENDIENTE_COTIZACION,
    KanbanStage.ESPERA_APROBACION,
    KanbanStage.ATENCION_REQUERIDA,
    KanbanStage.EN_REPARACION,
    KanbanStage.CONTROL_CALIDAD,
    KanbanStage.LISTO_ENTREGA,
    KanbanStage.ENTREGADO,
];

export const STATUS_DISPLAY_CONFIG: Record<WorkOrderStatus, { text: string; bg: string; }> = {
    [WorkOrderStatus.PROGRAMADO]: { text: 'text-blue-800 dark:text-blue-200', bg: 'bg-blue-200 dark:bg-blue-800/50' },
    [WorkOrderStatus.EN_PROCESO]: { text: 'text-orange-800 dark:text-orange-200', bg: 'bg-orange-200 dark:bg-orange-800/50' },
    [WorkOrderStatus.ESPERA_REPUESTOS]: { text: 'text-yellow-800 dark:text-yellow-200', bg: 'bg-yellow-200 dark:bg-yellow-800/50' },
    [WorkOrderStatus.LISTO_ENTREGA]: { text: 'text-green-800 dark:text-green-200', bg: 'bg-green-200 dark:bg-green-800/50' },
    [WorkOrderStatus.FACTURADO]: { text: 'text-purple-800 dark:text-purple-200', bg: 'bg-purple-200 dark:bg-purple-800/50' },
    [WorkOrderStatus.CANCELADO]: { text: 'text-gray-800 dark:text-gray-200', bg: 'bg-gray-200 dark:bg-gray-700' },
};

export const INVOICE_STATUS_DISPLAY_CONFIG: Record<InvoiceStatus, { text: string; bg: string; }> = {
    [InvoiceStatus.PENDIENTE]: { text: 'text-yellow-800 dark:text-yellow-200', bg: 'bg-yellow-200 dark:bg-yellow-800/50' },
    [InvoiceStatus.PAGADA]: { text: 'text-green-800 dark:text-green-200', bg: 'bg-green-200 dark:bg-green-800/50' },
    [InvoiceStatus.VENCIDA]: { text: 'text-red-800 dark:text-red-200', bg: 'bg-red-200 dark:bg-red-800/50' },
    [InvoiceStatus.CANCELADA]: { text: 'text-gray-800 dark:text-gray-200', bg: 'bg-gray-200 dark:bg-gray-700' },
    [InvoiceStatus.PAGADA_FACTORING]: { text: 'text-purple-800 dark:text-purple-200', bg: 'bg-purple-200 dark:bg-purple-800/50' },
};

export const QUOTE_STATUS_DISPLAY_CONFIG: Record<QuoteStatus | string, { text: string; bg: string; }> = {
    [QuoteStatus.BORRADOR]: { text: 'text-gray-800 dark:text-gray-200', bg: 'bg-gray-200 dark:bg-gray-700' },
    [QuoteStatus.ENVIADO]: { text: 'text-blue-800 dark:text-blue-200', bg: 'bg-blue-200 dark:bg-blue-800/50' },
    [QuoteStatus.REVISADO]: { text: 'text-yellow-800 dark:text-yellow-200', bg: 'bg-yellow-200 dark:bg-yellow-800/50' },
    [QuoteStatus.APROBADO]: { text: 'text-green-800 dark:text-green-200', bg: 'bg-green-200 dark:bg-green-800/50' },
    [QuoteStatus.RECHAZADO]: { text: 'text-red-800 dark:text-red-200', bg: 'bg-red-200 dark:bg-red-800/50' },
    [QuoteStatus.FACTURADO]: { text: 'text-purple-800 dark:text-purple-200', bg: 'bg-purple-200 dark:bg-purple-800/50' },
    // Entradas adicionales para valores de la base de datos
    'FACTURADO': { text: 'text-purple-800 dark:text-purple-200', bg: 'bg-purple-200 dark:bg-purple-800/50' },
    'Aprobado': { text: 'text-green-800 dark:text-green-200', bg: 'bg-green-200 dark:bg-green-800/50' },
    'Revisado': { text: 'text-yellow-800 dark:text-yellow-200', bg: 'bg-yellow-200 dark:bg-yellow-800/50' },
    'Enviado': { text: 'text-blue-800 dark:text-blue-200', bg: 'bg-blue-200 dark:bg-blue-800/50' },
    'Rechazado': { text: 'text-red-800 dark:text-red-200', bg: 'bg-red-200 dark:bg-red-800/50' },
    'Borrador': { text: 'text-gray-800 dark:text-gray-200', bg: 'bg-gray-200 dark:bg-gray-700' },
};

export const APPOINTMENT_STATUS_DISPLAY_CONFIG: Record<AppointmentStatus, { text: string; bg: string; borderColor: string; }> = {
    [AppointmentStatus.PROGRAMADA]: { text: 'text-blue-800 dark:text-blue-200', bg: 'bg-blue-200 dark:bg-blue-800/50', borderColor: 'border-blue-500' },
    [AppointmentStatus.CONFIRMADA]: { text: 'text-green-800 dark:text-green-200', bg: 'bg-green-200 dark:bg-green-800/50', borderColor: 'border-green-500' },
    [AppointmentStatus.CANCELADA]: { text: 'text-red-800 dark:text-red-200', bg: 'bg-red-200 dark:bg-red-800/50', borderColor: 'border-red-500' },
    [AppointmentStatus.COMPLETADA]: { text: 'text-gray-800 dark:text-gray-200', bg: 'bg-gray-200 dark:bg-gray-700', borderColor: 'border-gray-500' },
};

export const PURCHASE_ORDER_STATUS_DISPLAY_CONFIG: Record<PurchaseOrderStatus, { text: string; bg: string; }> = {
    [PurchaseOrderStatus.BORRADOR]: { text: 'text-gray-800 dark:text-gray-200', bg: 'bg-gray-200 dark:bg-gray-700' },
    [PurchaseOrderStatus.PEDIDO]: { text: 'text-blue-800 dark:text-blue-200', bg: 'bg-blue-200 dark:bg-blue-800/50' },
    [PurchaseOrderStatus.RECIBIDO_PARCIAL]: { text: 'text-yellow-800 dark:text-yellow-200', bg: 'bg-yellow-200 dark:bg-yellow-800/50' },
    [PurchaseOrderStatus.RECIBIDO_COMPLETO]: { text: 'text-green-800 dark:text-green-200', bg: 'bg-green-200 dark:bg-green-800/50' },
    [PurchaseOrderStatus.CANCELADO]: { text: 'text-red-800 dark:text-red-200', bg: 'bg-red-200 dark:bg-red-800/50' },
};


export const STAGE_DISPLAY_CONFIG: Record<KanbanStage, { text: string; bg: string; }> = {
    [KanbanStage.RECEPCION]: { text: 'text-gray-800 dark:text-gray-200', bg: 'bg-gray-200 dark:bg-gray-700' },
    [KanbanStage.DIAGNOSTICO]: { text: 'text-yellow-800 dark:text-yellow-200', bg: 'bg-yellow-200 dark:bg-yellow-800/50' },
    [KanbanStage.PENDIENTE_COTIZACION]: { text: 'text-purple-800 dark:text-purple-200', bg: 'bg-purple-200 dark:bg-purple-800/50' },
    [KanbanStage.ESPERA_APROBACION]: { text: 'text-red-800 dark:text-red-200', bg: 'bg-red-200 dark:bg-red-800/50' },
    [KanbanStage.ATENCION_REQUERIDA]: { text: 'text-orange-800 dark:text-orange-200', bg: 'bg-orange-200 dark:bg-orange-800/50' },
    [KanbanStage.EN_REPARACION]: { text: 'text-orange-800 dark:text-orange-200', bg: 'bg-orange-200 dark:bg-orange-800/50' },
    [KanbanStage.CONTROL_CALIDAD]: { text: 'text-blue-800 dark:text-blue-200', bg: 'bg-blue-200 dark:bg-blue-800/50' },
    [KanbanStage.LISTO_ENTREGA]: { text: 'text-green-800 dark:text-green-200', bg: 'bg-green-200 dark:bg-green-800/50' },
    [KanbanStage.ENTREGADO]: { text: 'text-gray-800 dark:text-gray-200', bg: 'bg-gray-400 dark:bg-gray-900' },
    [KanbanStage.CANCELADO]: { text: 'text-gray-800 dark:text-gray-200', bg: 'bg-gray-200 dark:bg-gray-700' },
};


export const STAGE_COLORS: Record<KanbanStage, string> = {
    [KanbanStage.RECEPCION]: 'border-t-gray-400',
    [KanbanStage.DIAGNOSTICO]: 'border-t-blue-400',
    [KanbanStage.PENDIENTE_COTIZACION]: 'border-t-purple-400',
    [KanbanStage.ESPERA_APROBACION]: 'border-t-red-400',
    [KanbanStage.ATENCION_REQUERIDA]: 'border-t-orange-400',
    [KanbanStage.EN_REPARACION]: 'border-t-yellow-400',
    [KanbanStage.CONTROL_CALIDAD]: 'border-t-orange-400',
    [KanbanStage.LISTO_ENTREGA]: 'border-t-green-400',
    [KanbanStage.ENTREGADO]: 'border-t-gray-600',
    [KanbanStage.CANCELADO]: 'border-t-red-500',
};

export const DIAGNOSTIC_CHECKLIST_SECTIONS = [
  {
    title: 'Inspección Visual Rápida (Recepción)',
    items: ['Neumáticos', 'Neumático repuesto', 'Equipo de carretera', 'Accesorios', 'Limpia Parabrisas'],
  },
  {
    title: 'Nivel de Fluidos',
    items: ['Aceite Motor', 'Refrigerante', 'Líquido de frenos', 'Aceite Hidráulico', 'Líquido de Embrague'],
  },
  {
    title: 'Sistema de Luces (Exterior e Interior)',
    items: ['Luces Altas', 'Luces Medias', 'Luces bajas', 'Luces de Parqueo', 'Luces Direccionales', 'Luces Exploradoras', 'Luces de Reversa', 'Luz Interna'],
  },
  {
    title: 'Panel de Instrumentos y Controles',
    items: ['RPM', 'Velocímetro', 'Nivel de Combustible', 'Temperatura', 'Aire Acondicionado'],
  },
  {
    title: 'Sistema de Frenos',
    items: ['Pastillas delanteras', 'Discos Delanteros', 'Mordaza', 'Mangueras de Frenos', 'Pastillas Traseras', 'Bandas de Freno', 'Discos Traseros', 'Tambores', 'Cilindros de Freno'],
  },
  {
    title: 'Suspensión y Dirección',
    columns: [
      ['Terminales externos', 'Axiales (terminales internos)', 'Guardapolvos Axiales', 'Rótulas tijeras', 'Bujes de Tijera', 'Barras Link', 'Amortiguadores Delanteros', 'Espirales delanteros', 'Muelles delanteros'],
      ['Amortiguadores Traseros', 'Soportes de Amort Trasero', 'Espiral Trasero', 'Bujes de Suspensión Trasera', 'Ballestas', 'Rodamientos Delanteros', 'Rodamientos Traseros', 'Barra estabilizadora', 'Caja de dirección'],
    ],
  },
  {
    title: 'Ejes y Rines',
    items: ['Palier de Eje Derecho', 'Palier de Eje Izquierdo', 'G/polvos Puntas de Eje Externa', 'G/polvos Puntas de Eje Interna', 'Rines'],
  },
  {
    title: 'Componentes Externos del Motor',
    items: ['Soporte de Motor P/pal', 'Soporte Inferior de Motor', 'Soporte de Caja P/pal', 'Correa de Accesorios', 'Tensor correa accesorios', 'Correa de aire acondicionado', 'Correa de dirección', 'Alternador'],
  },
  {
    title: 'Sistema de Refrigeración',
    items: ['Manguera Superior Radiador', 'Manguera Inferior Radiador', 'Mangueras Calefacción', 'Manguera Bomba de Agua', 'Tubo de Agua', 'Depósito de Refrigerante', 'Radiador', 'Carcaza de Termostato', 'Electroventilador principal', 'Electroventilador auxiliar', 'Bomba de agua', 'Termostato'],
  },
  {
    title: 'Sellado y Sincronización del Motor',
    items: ['Correa de distribución', 'Empaque tapa válvulas', 'Empaque culata', 'Empaque bomba aceite', 'Carter', 'Empaque carter'],
  },
  {
    title: 'Otros Sistemas (A/C, Hidráulico)',
    items: ['Mangueras Hidráulicas', 'Condensador', 'Compresor', 'Mangueras compresor', 'Bomba hidráulica'],
  },
  {
    title: 'Pruebas Técnicas',
    items: ['Compresión de motor', 'Presión de combustible', 'Presión de aceite de motor', 'Escaneo', 'Prueba de ruta'],
  },
];

export const DIAGNOSTIC_LEVELS: Record<DiagnosticType, string[]> = {
    'Básico': [
        'Inspección Visual Rápida (Recepción)',
        'Nivel de Fluidos',
        'Sistema de Luces (Exterior e Interior)',
    ],
    'Intermedio': [
        'Inspección Visual Rápida (Recepción)',
        'Nivel de Fluidos',
        'Sistema de Luces (Exterior e Interior)',
        'Panel de Instrumentos y Controles',
        'Sistema de Frenos',
        'Suspensión y Dirección',
        'Ejes y Rines',
    ],
    'Avanzado': [
        'Inspección Visual Rápida (Recepción)',
        'Nivel de Fluidos',
        'Sistema de Luces (Exterior e Interior)',
        'Panel de Instrumentos y Controles',
        'Sistema de Frenos',
        'Suspensión y Dirección',
        'Ejes y Rines',
        'Componentes Externos del Motor',
        'Sistema de Refrigeración',
        'Sellado y Sincronización del Motor',
        'Otros Sistemas (A/C, Hidráulico)',
        'Pruebas Técnicas',
    ],
};

export const COLOMBIAN_CAR_MAKES: { [make: string]: string[] } = {
    'Chevrolet': ['Spark', 'Onix', 'Sail', 'Tracker', 'Captiva', 'D-Max', 'Joy', 'Equinox'],
    'Renault': ['Kwid', 'Sandero', 'Logan', 'Stepway', 'Duster', 'Oroch', 'Captur'],
    'Mazda': ['2', '3', 'CX-5', 'CX-30', 'CX-50', 'BT-50'],
    'Nissan': ['March', 'Versa', 'Kicks', 'Frontier', 'X-Trail', 'Qashqai', 'Altima'],
    'Kia': ['Picanto', 'Rio', 'Soluto', 'Sportage', 'Seltos', 'Niro'],
    'Toyota': ['Yaris', 'Corolla', 'Corolla Cross', 'Hilux', 'Fortuner', 'Prado', 'RAV4', 'Camry'],
    'Suzuki': ['Swift', 'S-Cross', 'Vitara', 'Jimny', 'Grand Vitara'],
    'Ford': ['Fiesta', 'EcoSport', 'Ranger', 'Escape', 'Explorer', 'Bronco', 'Raptor'],
    'Volkswagen': ['Gol', 'Voyage', 'Polo', 'Virtus', 'Nivus', 'T-Cross', 'Amarok'],
    'Hyundai': ['Grand i10', 'Accent', 'HB20', 'Creta', 'Tucson', 'Santa Fe'],
    'Foton': ['Tunland'],
    'JAC': ['S2', 'S3'],
    'Changan': ['CS15', 'CS35'],
    'DFSK': ['580'],
    'Peugeot': ['208', '2008', '3008'],
    'Citroën': ['C3', 'C4 Cactus'],
    'Jeep': ['Renegade', 'Compass', 'Wrangler'],
    'Mitsubishi': ['Montero Sport', 'L200'],
    'Honda': ['CR-V', 'HR-V'],
    'Mercedes-Benz': ['Clase A', 'Clase C', 'GLC'],
    'BMW': ['Serie 1', 'Serie 3', 'X1', 'X3'],
    'Audi': ['A3', 'A4', 'Q3', 'Q5'],
};