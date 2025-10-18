-- Script para agregar la columna sequential_id a la tabla invoices existente
-- Ejecutar este script en el SQL Editor de Supabase

-- Agregar la columna sequential_id si no existe
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS sequential_id INTEGER;

-- Crear secuencia para sequential_id si no existe
CREATE SEQUENCE IF NOT EXISTS invoices_sequential_id_seq;

-- Establecer el valor por defecto para la columna
ALTER TABLE invoices 
ALTER COLUMN sequential_id SET DEFAULT nextval('invoices_sequential_id_seq');

-- Crear índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_invoices_sequential_id ON invoices(sequential_id);

-- Actualizar facturas existentes con IDs secuenciales
-- (solo si no tienen sequential_id asignado)
UPDATE invoices 
SET sequential_id = nextval('invoices_sequential_id_seq')
WHERE sequential_id IS NULL;

-- Verificar que la columna se creó correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'invoices' 
AND column_name = 'sequential_id';
