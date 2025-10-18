-- Script para crear la tabla de facturas en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id),
    client_id UUID REFERENCES clients(id),
    client_name TEXT NOT NULL,
    vehicle_summary TEXT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pendiente',
    location_id UUID REFERENCES locations(id),
    items JSONB NOT NULL DEFAULT '[]',
    notes TEXT,
    payment_terms JSONB,
    vat_included BOOLEAN DEFAULT false,
    sequential_id INTEGER,
    factoring_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_work_order_id ON invoices(work_order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_location_id ON invoices(location_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_sequential_id ON invoices(sequential_id);

-- Crear secuencia para sequential_id
CREATE SEQUENCE IF NOT EXISTS invoices_sequential_id_seq;
ALTER TABLE invoices ALTER COLUMN sequential_id SET DEFAULT nextval('invoices_sequential_id_seq');

-- Habilitar RLS (Row Level Security)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir todas las operaciones (ajustar según necesidades de seguridad)
CREATE POLICY "Allow all operations on invoices" ON invoices
    FOR ALL USING (true);

-- Comentarios para documentación
COMMENT ON TABLE invoices IS 'Tabla de facturas del sistema de gestión de talleres';
COMMENT ON COLUMN invoices.sequential_id IS 'ID secuencial para mostrar (FAC-001, FAC-002, etc.)';
COMMENT ON COLUMN invoices.items IS 'Array de ítems de la factura en formato JSON';
COMMENT ON COLUMN invoices.factoring_info IS 'Información de factoring si aplica';
