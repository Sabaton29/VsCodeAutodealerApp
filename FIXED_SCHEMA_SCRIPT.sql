-- =====================================================
-- SCRIPT CORREGIDO PARA SUPABASE
-- =====================================================
-- Este script maneja correctamente la conversión de 'L1'/'L2' a UUIDs

-- 1. CREAR TABLA LOCATIONS SI NO EXISTE
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

-- 2. INSERTAR UBICACIONES CON UUIDs FIJOS
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

-- 3. AGREGAR COLUMNAS FALTANTES A CLIENTS
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 0;

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS is_b2b BOOLEAN DEFAULT false;

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS payment_terms JSONB;

-- 4. AGREGAR COLUMNAS FALTANTES A VEHICLES
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS category VARCHAR(255);

ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS make VARCHAR(255);

ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS model VARCHAR(255);

ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS year INTEGER;

ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS color VARCHAR(100);

ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS mileage INTEGER;

-- 5. AGREGAR COLUMNAS FALTANTES A SERVICES
ALTER TABLE services
ADD COLUMN IF NOT EXISTS category VARCHAR(255);

ALTER TABLE services
ADD COLUMN IF NOT EXISTS duration_hours DECIMAL(4,2);

ALTER TABLE services
ADD COLUMN IF NOT EXISTS description TEXT;

-- 6. AGREGAR COLUMNAS FALTANTES A SUPPLIERS
ALTER TABLE suppliers
ADD COLUMN IF NOT EXISTS has_credit BOOLEAN DEFAULT false;

ALTER TABLE suppliers
ADD COLUMN IF NOT EXISTS is_payment_partner BOOLEAN DEFAULT false;

ALTER TABLE suppliers
ADD COLUMN IF NOT EXISTS category VARCHAR(255);

ALTER TABLE suppliers
ADD COLUMN IF NOT EXISTS nit VARCHAR(50);

ALTER TABLE suppliers
ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255);

-- 7. AGREGAR COLUMNAS FALTANTES A INVENTORY_ITEMS
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS supplier_id UUID;

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

-- 8. AGREGAR COLUMNAS FALTANTES A STAFF_MEMBERS
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

-- 9. AGREGAR COLUMNAS FALTANTES A WORK_ORDERS
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS client_id UUID;

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS vehicle_id UUID;

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS advisor_id UUID;

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

-- 10. AGREGAR COLUMNAS FALTANTES A QUOTES
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS work_order_id UUID;

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS client_id UUID;

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS vehicle_id UUID;

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS vehicle_summary TEXT;

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS issue_date DATE;

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS valid_until DATE;

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS created_by UUID;

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS items JSONB;

-- 11. CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_clients_location_id ON clients(location_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_client_id ON vehicles(client_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_location_id ON vehicles(location_id);
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

-- 12. HABILITAR ROW LEVEL SECURITY
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- 13. CREAR POLÍTICAS RLS (PERMITIR TODO TEMPORALMENTE)
-- Locations
DROP POLICY IF EXISTS "Allow all operations on locations" ON locations;
CREATE POLICY "Allow all operations on locations" ON locations FOR ALL USING (true) WITH CHECK (true);

-- Clients
DROP POLICY IF EXISTS "Allow all operations on clients" ON clients;
CREATE POLICY "Allow all operations on clients" ON clients FOR ALL USING (true) WITH CHECK (true);

-- Vehicles
DROP POLICY IF EXISTS "Allow all operations on vehicles" ON vehicles;
CREATE POLICY "Allow all operations on vehicles" ON vehicles FOR ALL USING (true) WITH CHECK (true);

-- Services
DROP POLICY IF EXISTS "Allow all operations on services" ON services;
CREATE POLICY "Allow all operations on services" ON services FOR ALL USING (true) WITH CHECK (true);

-- Suppliers
DROP POLICY IF EXISTS "Allow all operations on suppliers" ON suppliers;
CREATE POLICY "Allow all operations on suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);

-- Inventory Items
DROP POLICY IF EXISTS "Allow all operations on inventory_items" ON inventory_items;
CREATE POLICY "Allow all operations on inventory_items" ON inventory_items FOR ALL USING (true) WITH CHECK (true);

-- Staff Members
DROP POLICY IF EXISTS "Allow all operations on staff_members" ON staff_members;
CREATE POLICY "Allow all operations on staff_members" ON staff_members FOR ALL USING (true) WITH CHECK (true);

-- Work Orders
DROP POLICY IF EXISTS "Allow all operations on work_orders" ON work_orders;
CREATE POLICY "Allow all operations on work_orders" ON work_orders FOR ALL USING (true) WITH CHECK (true);

-- Quotes
DROP POLICY IF EXISTS "Allow all operations on quotes" ON quotes;
CREATE POLICY "Allow all operations on quotes" ON quotes FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- FIN DEL SCRIPT CORREGIDO
-- =====================================================
-- Este script NO intenta actualizar registros existentes con 'L1'/'L2'
-- Solo agrega las columnas faltantes y configura RLS



