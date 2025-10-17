-- Script para añadir la columna registration_date a la tabla clients
-- Ejecutar este script en Supabase SQL Editor

-- Añadir la columna registration_date si no existe
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS registration_date DATE DEFAULT CURRENT_DATE;

-- Verificar que la columna se añadió correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND column_name = 'registration_date';

-- Actualizar registros existentes que no tengan registration_date
UPDATE clients 
SET registration_date = CURRENT_DATE 
WHERE registration_date IS NULL;

-- Verificar los datos actualizados
SELECT id, name, registration_date 
FROM clients 
ORDER BY registration_date DESC 
LIMIT 10;
