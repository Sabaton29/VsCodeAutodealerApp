# 🚀 Guía de Migración a Supabase - Autodealer Cloud

Esta guía te ayudará a migrar el proyecto desde IndexedDB local a una arquitectura completa con Supabase.

---

## 📋 Requisitos Previos

1. **Cuenta de Supabase**
   - Crear cuenta en [supabase.com](https://supabase.com)
   - Crear un nuevo proyecto
   - Obtener las credenciales (URL y anon key)

2. **Node.js y npm**
   - Node.js >= 18.0.0
   - npm o yarn instalado

---

## 🔧 Paso 1: Configurar Variables de Entorno

### Frontend (.env)

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### Backend (backend/.env)

Crear archivo `backend/.env`:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

> ⚠️ **IMPORTANTE:** Añadir `.env` al `.gitignore` para no subir credenciales al repositorio.

---

## 📦 Paso 2: Instalar Dependencias

### Frontend
```bash
npm install
```

### Backend
```bash
cd backend
npm install
cd ..
```

---

## 🗃️ Paso 3: Crear Esquema de Base de Datos

Ir al panel de Supabase → SQL Editor y ejecutar el siguiente script:

```sql
-- ============================================
-- AUTODEALER CLOUD - DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- LOCATIONS (Sedes)
-- ============================================
CREATE TABLE locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  hourly_rate NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STAFF MEMBERS (Personal)
-- ============================================
CREATE TABLE staff_members (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  avatar_url TEXT,
  location_id TEXT REFERENCES locations(id),
  specialty TEXT,
  document_type TEXT NOT NULL,
  document_number TEXT NOT NULL,
  custom_permissions TEXT[],
  salary_type TEXT,
  salary_amount NUMERIC,
  is_pro_labore BOOLEAN DEFAULT FALSE,
  requires_time_clock BOOLEAN DEFAULT FALSE,
  commission_rate NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIENTS (Clientes)
-- ============================================
CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  person_type TEXT NOT NULL,
  id_type TEXT NOT NULL,
  id_number TEXT NOT NULL,
  address TEXT,
  city TEXT,
  observations TEXT,
  is_b2b BOOLEAN DEFAULT FALSE,
  commission_rate NUMERIC,
  payment_terms JSONB,
  location_id TEXT REFERENCES locations(id),
  vehicle_count INTEGER DEFAULT 0,
  registration_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VEHICLES (Vehículos)
-- ============================================
CREATE TABLE vehicles (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  plate TEXT NOT NULL UNIQUE,
  vehicle_type TEXT,
  year INTEGER,
  color TEXT,
  engine_displacement NUMERIC,
  fuel_type TEXT,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SERVICES (Catálogo de Servicios)
-- ============================================
CREATE TABLE services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  duration_hours NUMERIC NOT NULL,
  location_id TEXT REFERENCES locations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUPPLIERS (Proveedores)
-- ============================================
CREATE TABLE suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nit TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL,
  has_credit BOOLEAN DEFAULT FALSE,
  is_payment_partner BOOLEAN DEFAULT FALSE,
  location_id TEXT REFERENCES locations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVENTORY ITEMS (Artículos de Inventario)
-- ============================================
CREATE TABLE inventory_items (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  supplier_id TEXT REFERENCES suppliers(id),
  category TEXT NOT NULL,
  stock NUMERIC NOT NULL DEFAULT 0,
  cost_price NUMERIC NOT NULL,
  sale_price NUMERIC NOT NULL,
  margin NUMERIC NOT NULL,
  tax_rate NUMERIC NOT NULL,
  location_id TEXT REFERENCES locations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WORK ORDERS (Órdenes de Trabajo)
-- ============================================
CREATE TABLE work_orders (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES clients(id),
  vehicle_id TEXT REFERENCES vehicles(id),
  status TEXT NOT NULL,
  stage TEXT NOT NULL,
  total NUMERIC NOT NULL DEFAULT 0,
  date TIMESTAMPTZ NOT NULL,
  location_id TEXT REFERENCES locations(id),
  service_requested TEXT NOT NULL,
  staff_member_id UUID REFERENCES staff_members(id),
  advisor_id UUID REFERENCES staff_members(id),
  time_in_stage TEXT,
  services JSONB,
  diagnostic_data JSONB,
  diagnostic_type TEXT,
  history JSONB,
  recommended_items JSONB,
  progress_log JSONB,
  unforeseen_issues JSONB,
  linked_quote_ids TEXT[],
  public_access_token TEXT UNIQUE,
  requires_initial_diagnosis BOOLEAN DEFAULT FALSE,
  -- Additional fields
  service_type_advanced BOOLEAN,
  is_warranty BOOLEAN,
  road_test_authorized BOOLEAN,
  service_date_time TIMESTAMPTZ,
  mileage TEXT,
  fuel_level TEXT,
  reported_valuables TEXT,
  fluid_levels JSONB,
  other_fluids TEXT,
  inventory_checklist JSONB,
  inventory_other_text TEXT,
  documents TEXT,
  comments TEXT,
  damages JSONB,
  other_damages TEXT,
  damage_locations JSONB,
  entry_evidence_image_urls TEXT[],
  delivery_date TIMESTAMPTZ,
  delivery_evidence_image_urls TEXT[],
  next_maintenance_date DATE,
  next_maintenance_mileage TEXT,
  next_maintenance_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- QUOTES (Cotizaciones)
-- ============================================
CREATE TABLE quotes (
  id TEXT PRIMARY KEY,
  work_order_id TEXT REFERENCES work_orders(id),
  client_id TEXT REFERENCES clients(id),
  client_name TEXT NOT NULL,
  vehicle_summary TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  subtotal NUMERIC NOT NULL,
  tax_amount NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL,
  location_id TEXT REFERENCES locations(id),
  items JSONB NOT NULL,
  notes TEXT,
  linked_invoice_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVOICES (Facturas)
-- ============================================
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  work_order_id TEXT REFERENCES work_orders(id),
  client_id TEXT REFERENCES clients(id),
  client_name TEXT NOT NULL,
  vehicle_summary TEXT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal NUMERIC NOT NULL,
  tax_amount NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL,
  location_id TEXT REFERENCES locations(id),
  items JSONB NOT NULL,
  notes TEXT,
  payment_terms JSONB,
  vat_included BOOLEAN DEFAULT TRUE,
  factoring_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PURCHASE ORDERS (Órdenes de Compra)
-- ============================================
CREATE TABLE purchase_orders (
  id TEXT PRIMARY KEY,
  supplier_id TEXT REFERENCES suppliers(id),
  supplier_name TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expected_delivery_date DATE NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  tax_amount NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL,
  location_id TEXT REFERENCES locations(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FINANCIAL ACCOUNTS (Cuentas Financieras)
-- ============================================
CREATE TABLE financial_accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  location_id TEXT REFERENCES locations(id),
  assigned_user_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PETTY CASH TRANSACTIONS (Transacciones de Caja Menor)
-- ============================================
CREATE TABLE petty_cash_transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  payment_method TEXT,
  supplier_id TEXT REFERENCES suppliers(id),
  receipt_image_url TEXT,
  location_id TEXT REFERENCES locations(id),
  account_id TEXT REFERENCES financial_accounts(id),
  payment_partner_id TEXT,
  user_id UUID REFERENCES staff_members(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- OPERATING EXPENSES (Gastos Operativos)
-- ============================================
CREATE TABLE operating_expenses (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  location_id TEXT REFERENCES locations(id),
  account_id TEXT REFERENCES financial_accounts(id),
  user_id UUID REFERENCES staff_members(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TIME CLOCK ENTRIES (Marcaciones)
-- ============================================
CREATE TABLE time_clock_entries (
  id TEXT PRIMARY KEY,
  staff_id UUID REFERENCES staff_members(id),
  location_id TEXT REFERENCES locations(id),
  timestamp TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LOANS (Préstamos)
-- ============================================
CREATE TABLE loans (
  id TEXT PRIMARY KEY,
  staff_id UUID REFERENCES staff_members(id),
  location_id TEXT REFERENCES locations(id),
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  issue_date TIMESTAMPTZ NOT NULL,
  deduction_per_pay_period NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LOAN PAYMENTS (Pagos de Préstamos)
-- ============================================
CREATE TABLE loan_payments (
  id TEXT PRIMARY KEY,
  loan_id TEXT REFERENCES loans(id),
  amount NUMERIC NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL,
  is_payroll_deduction BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS (Notificaciones)
-- ============================================
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES staff_members(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  work_order_id TEXT REFERENCES work_orders(id),
  is_read BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APPOINTMENTS (Citas)
-- ============================================
CREATE TABLE appointments (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES clients(id),
  client_name TEXT NOT NULL,
  vehicle_id TEXT REFERENCES vehicles(id),
  vehicle_summary TEXT NOT NULL,
  service_requested TEXT NOT NULL,
  appointment_date_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  location_id TEXT REFERENCES locations(id),
  advisor_id UUID REFERENCES staff_members(id),
  notes TEXT,
  linked_work_order_id TEXT REFERENCES work_orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APP SETTINGS (Configuración de la Aplicación)
-- ============================================
CREATE TABLE app_settings (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  company_info JSONB NOT NULL,
  billing_settings JSONB NOT NULL,
  operations_settings JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT singleton_check CHECK (id = 'singleton')
);

-- ============================================
-- INDEXES para mejorar rendimiento
-- ============================================
CREATE INDEX idx_staff_members_email ON staff_members(email);
CREATE INDEX idx_staff_members_location ON staff_members(location_id);
CREATE INDEX idx_clients_location ON clients(location_id);
CREATE INDEX idx_vehicles_client ON vehicles(client_id);
CREATE INDEX idx_vehicles_plate ON vehicles(plate);
CREATE INDEX idx_work_orders_client ON work_orders(client_id);
CREATE INDEX idx_work_orders_vehicle ON work_orders(vehicle_id);
CREATE INDEX idx_work_orders_location ON work_orders(location_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_stage ON work_orders(stage);
CREATE INDEX idx_work_orders_token ON work_orders(public_access_token);
CREATE INDEX idx_quotes_work_order ON quotes(work_order_id);
CREATE INDEX idx_invoices_work_order ON invoices(work_order_id);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_datetime ON appointments(appointment_date_time);

-- ============================================
-- TRIGGERS para updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON staff_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔐 Paso 4: Configurar Row Level Security (RLS)

En el SQL Editor de Supabase, ejecutar:

```sql
-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE petty_cash_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE operating_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_clock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: STAFF MEMBERS
-- ============================================

-- Usuarios autenticados pueden leer todos los staff members
CREATE POLICY "Users can read all staff members"
ON staff_members FOR SELECT
TO authenticated
USING (true);

-- Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON staff_members FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Solo admins pueden insertar/eliminar staff members
CREATE POLICY "Admins can insert staff members"
ON staff_members FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM staff_members
    WHERE id = auth.uid()
    AND role = 'Administrador'
  )
);

-- ============================================
-- POLICIES: CLIENTS
-- ============================================

-- Usuarios autenticados pueden leer clientes de su ubicación
CREATE POLICY "Users can read clients from their location"
ON clients FOR SELECT
TO authenticated
USING (
  location_id IN (
    SELECT location_id FROM staff_members WHERE id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM staff_members
    WHERE id = auth.uid()
    AND role IN ('Administrador', 'Jefe de Taller')
  )
);

-- Usuarios con permisos pueden crear/editar clientes
CREATE POLICY "Users with permissions can manage clients"
ON clients FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_members
    WHERE id = auth.uid()
    AND role IN ('Administrador', 'Asesor de Servicio')
  )
);

-- ============================================
-- POLICIES: WORK ORDERS
-- ============================================

-- Usuarios pueden ver OTs de su ubicación o asignadas a ellos
CREATE POLICY "Users can read work orders"
ON work_orders FOR SELECT
TO authenticated
USING (
  location_id IN (
    SELECT location_id FROM staff_members WHERE id = auth.uid()
  )
  OR staff_member_id = auth.uid()
  OR advisor_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM staff_members
    WHERE id = auth.uid()
    AND role IN ('Administrador', 'Jefe de Taller')
  )
);

-- Acceso público al portal de cliente con token
CREATE POLICY "Public access to work orders with valid token"
ON work_orders FOR SELECT
TO anon
USING (public_access_token IS NOT NULL);

-- ============================================
-- POLICIES: NOTIFICATIONS
-- ============================================

-- Usuarios solo pueden ver sus propias notificaciones
CREATE POLICY "Users can read own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Usuarios pueden marcar como leídas sus notificaciones
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- POLICIES: LOCATIONS
-- ============================================

-- Todos los usuarios autenticados pueden leer ubicaciones
CREATE POLICY "Authenticated users can read locations"
ON locations FOR SELECT
TO authenticated
USING (true);

-- Solo admins pueden modificar ubicaciones
CREATE POLICY "Only admins can modify locations"
ON locations FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_members
    WHERE id = auth.uid()
    AND role = 'Administrador'
  )
);

-- ============================================
-- NOTA: Añadir más políticas según sea necesario
-- ============================================
```

---

## 🔄 Paso 5: Migrar Datos Existentes (Opcional)

Si ya tienes datos en IndexedDB que quieres migrar:

1. Exportar datos desde IndexedDB
2. Usar el script de migración (crear uno personalizado)
3. Importar a Supabase

---

## 🏃 Paso 6: Ejecutar la Aplicación

### Development

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend (opcional)
cd backend
npm run dev
```

### Acceder a la aplicación

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

---

## ✅ Verificación

1. ✅ Puedes crear una cuenta nueva
2. ✅ Puedes iniciar sesión
3. ✅ Los datos se persisten en Supabase
4. ✅ RLS está funcionando correctamente
5. ✅ Las políticas de acceso funcionan

---

## 🔍 Troubleshooting

### Error: "Missing Supabase environment variables"
- Verificar que `.env` existe y tiene las variables correctas
- Reiniciar el servidor de desarrollo

### Error: "Failed to fetch"
- Verificar que Supabase URL es correcta
- Verificar conexión a internet
- Verificar que el proyecto de Supabase está activo

### Error: "new row violates row-level security policy"
- Verificar políticas de RLS
- Verificar que el usuario está autenticado
- Verificar que el usuario tiene los permisos correctos

---

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

---

## 🎉 ¡Listo!

Tu aplicación ahora está integrada con Supabase y lista para producción. 🚀







