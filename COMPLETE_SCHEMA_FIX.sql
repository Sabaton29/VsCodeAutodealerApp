-- =====================================================
-- SCRIPT COMPLETO PARA CORREGIR TODO EL ESQUEMA DE SUPABASE
-- =====================================================
-- Ejecutar este script completo en el SQL Editor de Supabase
-- Este script corrige TODAS las tablas y agrega TODAS las columnas faltantes

-- 1. CORREGIR TABLA LOCATIONS
-- Crear tabla locations si no existe
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    address TEXT,
    phone VARCHAR(50),
    hourly_rate DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar ubicaciones con UUIDs fijos
INSERT INTO locations (id, name, city, address, phone, hourly_rate)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Sede Bogotá', 'Bogotá D.C.', 'Avenida El Dorado # 68C-61', '(601) 555-1010', 108000),
    ('550e8400-e29b-41d4-a716-446655440002', 'Sede Cali', 'Cali, Valle', 'Calle 5 # 66B-15', '(602) 555-2020', 95000)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    city = EXCLUDED.city,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    hourly_rate = EXCLUDED.hourly_rate;

-- 2. CORREGIR TABLA CLIENTS
-- Agregar todas las columnas faltantes
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 0;

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS is_b2b BOOLEAN DEFAULT false;

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS payment_terms JSONB;

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

-- Actualizar locationId de clientes existentes
UPDATE clients 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL OR location_id = 'L1' OR location_id = 'L2';

-- 3. CORREGIR TABLA VEHICLES
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);

-- Actualizar locationId de vehículos existentes
UPDATE vehicles 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL OR location_id = 'L1' OR location_id = 'L2';

-- 4. CORREGIR TABLA SERVICES
ALTER TABLE services
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

ALTER TABLE services
ADD COLUMN IF NOT EXISTS category VARCHAR(255);

ALTER TABLE services
ADD COLUMN IF NOT EXISTS duration_hours DECIMAL(4,2);

-- Actualizar locationId de servicios existentes
UPDATE services 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL OR location_id = 'L1' OR location_id = 'L2';

-- 5. CORREGIR TABLA SUPPLIERS
ALTER TABLE suppliers
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

ALTER TABLE suppliers
ADD COLUMN IF NOT EXISTS has_credit BOOLEAN DEFAULT false;

ALTER TABLE suppliers
ADD COLUMN IF NOT EXISTS is_payment_partner BOOLEAN DEFAULT false;

-- Actualizar locationId de proveedores existentes
UPDATE suppliers 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL OR location_id = 'L1' OR location_id = 'L2';

-- 6. CORREGIR TABLA INVENTORY_ITEMS
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id);

ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS category VARCHAR(255);

ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2);

ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2);

ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS margin DECIMAL(5,2);

ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 19;

-- Actualizar locationId de artículos existentes
UPDATE inventory_items 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL OR location_id = 'L1' OR location_id = 'L2';

-- 7. CORREGIR TABLA STAFF_MEMBERS
ALTER TABLE staff_members
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

ALTER TABLE staff_members
ADD COLUMN IF NOT EXISTS role VARCHAR(50);

ALTER TABLE staff_members
ADD COLUMN IF NOT EXISTS specialty VARCHAR(255);

ALTER TABLE staff_members
ADD COLUMN IF NOT EXISTS document_type VARCHAR(100);

ALTER TABLE staff_members
ADD COLUMN IF NOT EXISTS document_number VARCHAR(50);

ALTER TABLE staff_members
ADD COLUMN IF NOT EXISTS salary_type VARCHAR(50);

ALTER TABLE staff_members
ADD COLUMN IF NOT EXISTS salary_amount DECIMAL(10,2);

ALTER TABLE staff_members
ADD COLUMN IF NOT EXISTS is_pro_labore BOOLEAN DEFAULT false;

ALTER TABLE staff_members
ADD COLUMN IF NOT EXISTS requires_time_clock BOOLEAN DEFAULT false;

ALTER TABLE staff_members
ADD COLUMN IF NOT EXISTS custom_permissions TEXT[];

-- Actualizar locationId de personal existente
UPDATE staff_members 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL OR location_id = 'L1' OR location_id = 'L2';

-- 8. CORREGIR TABLA WORK_ORDERS
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES vehicles(id);

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS advisor_id UUID REFERENCES staff_members(id);

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS diagnostic_data JSONB;

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS history JSONB;

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS recommended_items JSONB;

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS linked_quote_ids JSONB;

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS unforeseen_issues JSONB;

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS public_access_token VARCHAR(255);

-- Actualizar locationId de órdenes de trabajo existentes
UPDATE work_orders 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL OR location_id = 'L1' OR location_id = 'L2';

-- 9. CORREGIR TABLA QUOTES
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS work_order_id UUID REFERENCES work_orders(id);

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES vehicles(id);

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS vehicle_summary TEXT;

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS issue_date DATE;

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS valid_until DATE;

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES staff_members(id);

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS items JSONB;

-- Actualizar locationId de cotizaciones existentes
UPDATE quotes 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL OR location_id = 'L1' OR location_id = 'L2';

-- 10. CORREGIR TABLA INVOICES
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS work_order_id UUID REFERENCES work_orders(id);

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES quotes(id);

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

-- Actualizar locationId de facturas existentes
UPDATE invoices 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL OR location_id = 'L1' OR location_id = 'L2';

-- 11. CORREGIR TABLA PURCHASE_ORDERS
ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id);

ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES staff_members(id);

-- Actualizar locationId de órdenes de compra existentes
UPDATE purchase_orders 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL OR location_id = 'L1' OR location_id = 'L2';

-- 12. CORREGIR TABLA APPOINTMENTS
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES vehicles(id);

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS advisor_id UUID REFERENCES staff_members(id);

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

-- Actualizar locationId de citas existentes
UPDATE appointments 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL OR location_id = 'L1' OR location_id = 'L2';

-- 13. CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_clients_location_id ON clients(location_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_location_id ON vehicles(location_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_client_id ON vehicles(client_id);
CREATE INDEX IF NOT EXISTS idx_services_location_id ON services(location_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_location_id ON suppliers(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_location_id ON inventory_items(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier_id ON inventory_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_location_id ON staff_members(location_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_location_id ON work_orders(location_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_client_id ON work_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_vehicle_id ON work_orders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_quotes_location_id ON quotes(location_id);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_work_order_id ON quotes(work_order_id);

-- 14. HABILITAR ROW LEVEL SECURITY (RLS) PARA TODAS LAS TABLAS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 15. CREAR POLÍTICAS RLS BÁSICAS (PERMITIR TODO TEMPORALMENTE)
-- Estas políticas permiten acceso completo. Puedes restringirlas más tarde según tus necesidades.

-- Políticas para locations
DROP POLICY IF EXISTS "Allow all operations on locations" ON locations;
CREATE POLICY "Allow all operations on locations" ON locations
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para clients
DROP POLICY IF EXISTS "Allow all operations on clients" ON clients;
CREATE POLICY "Allow all operations on clients" ON clients
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para vehicles
DROP POLICY IF EXISTS "Allow all operations on vehicles" ON vehicles;
CREATE POLICY "Allow all operations on vehicles" ON vehicles
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para services
DROP POLICY IF EXISTS "Allow all operations on services" ON services;
CREATE POLICY "Allow all operations on services" ON services
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para suppliers
DROP POLICY IF EXISTS "Allow all operations on suppliers" ON suppliers;
CREATE POLICY "Allow all operations on suppliers" ON suppliers
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para inventory_items
DROP POLICY IF EXISTS "Allow all operations on inventory_items" ON inventory_items;
CREATE POLICY "Allow all operations on inventory_items" ON inventory_items
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para staff_members
DROP POLICY IF EXISTS "Allow all operations on staff_members" ON staff_members;
CREATE POLICY "Allow all operations on staff_members" ON staff_members
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para work_orders
DROP POLICY IF EXISTS "Allow all operations on work_orders" ON work_orders;
CREATE POLICY "Allow all operations on work_orders" ON work_orders
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para quotes
DROP POLICY IF EXISTS "Allow all operations on quotes" ON quotes;
CREATE POLICY "Allow all operations on quotes" ON quotes
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para invoices
DROP POLICY IF EXISTS "Allow all operations on invoices" ON invoices;
CREATE POLICY "Allow all operations on invoices" ON invoices
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para purchase_orders
DROP POLICY IF EXISTS "Allow all operations on purchase_orders" ON purchase_orders;
CREATE POLICY "Allow all operations on purchase_orders" ON purchase_orders
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para appointments
DROP POLICY IF EXISTS "Allow all operations on appointments" ON appointments;
CREATE POLICY "Allow all operations on appointments" ON appointments
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
-- Después de ejecutar este script, todas las tablas deberían estar
-- completamente configuradas y compatibles con tu aplicación React.



