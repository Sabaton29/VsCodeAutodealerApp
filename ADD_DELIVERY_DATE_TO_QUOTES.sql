-- Script para agregar la columna delivery_date a la tabla quotes
-- Esta columna almacenará la fecha de entrega prometida al cliente

-- Paso 1: Agregar la columna delivery_date
ALTER TABLE quotes 
ADD COLUMN delivery_date DATE;

-- Paso 2: Verificar que la columna se creó correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'quotes' 
AND column_name = 'delivery_date';

-- Paso 3: Verificar la estructura completa de la tabla quotes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'quotes' 
ORDER BY ordinal_position;
