-- Script para corregir la tabla clients en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- Agregar columna commissionRate a la tabla clients
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 0;

-- Agregar otras columnas que puedan estar faltando
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS is_b2b BOOLEAN DEFAULT false;

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS payment_terms JSONB;

-- Verificar la estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;



