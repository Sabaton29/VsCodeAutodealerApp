-- Script completo para asegurar que la tabla invoices tenga toda la estructura necesaria
-- Ejecutar este script en el SQL Editor de Supabase

-- Verificar si la tabla existe y crear si es necesario
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID,
    client_id UUID,
    client_name TEXT NOT NULL,
    vehicle_summary TEXT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pendiente',
    location_id UUID,
    items JSONB NOT NULL DEFAULT '[]',
    notes TEXT,
    payment_terms JSONB,
    vat_included BOOLEAN DEFAULT false,
    sequential_id INTEGER,
    factoring_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar columnas que podrían faltar
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS work_order_id UUID,
ADD COLUMN IF NOT EXISTS client_id UUID,
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS vehicle_summary TEXT,
ADD COLUMN IF NOT EXISTS issue_date DATE,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS total DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS status TEXT,
ADD COLUMN IF NOT EXISTS location_id UUID,
ADD COLUMN IF NOT EXISTS items JSONB,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS payment_terms JSONB,
ADD COLUMN IF NOT EXISTS vat_included BOOLEAN,
ADD COLUMN IF NOT EXISTS sequential_id INTEGER,
ADD COLUMN IF NOT EXISTS factoring_info JSONB,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Establecer valores por defecto
ALTER TABLE invoices 
ALTER COLUMN subtotal SET DEFAULT 0,
ALTER COLUMN tax_amount SET DEFAULT 0,
ALTER COLUMN total SET DEFAULT 0,
ALTER COLUMN status SET DEFAULT 'Pendiente',
ALTER COLUMN items SET DEFAULT '[]',
ALTER COLUMN vat_included SET DEFAULT false,
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN updated_at SET DEFAULT NOW();

-- Crear secuencia para sequential_id
CREATE SEQUENCE IF NOT EXISTS invoices_sequential_id_seq;
ALTER TABLE invoices 
ALTER COLUMN sequential_id SET DEFAULT nextval('invoices_sequential_id_seq');

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_work_order_id ON invoices(work_order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_location_id ON invoices(location_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_sequential_id ON invoices(sequential_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir todas las operaciones (ajustar según necesidades de seguridad)
DROP POLICY IF EXISTS "Allow all operations on invoices" ON invoices;
CREATE POLICY "Allow all operations on invoices" ON invoices
    FOR ALL USING (true);

-- Actualizar facturas existentes con IDs secuenciales si no los tienen
UPDATE invoices 
SET sequential_id = nextval('invoices_sequential_id_seq')
WHERE sequential_id IS NULL;

-- Verificar la estructura final de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'invoices' 
ORDER BY ordinal_position;
