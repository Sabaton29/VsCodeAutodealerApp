-- Script para depurar y corregir datos de proveedores en Supabase

-- 1. Verificar la estructura de la tabla suppliers
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'suppliers' 
ORDER BY ordinal_position;

-- 2. Verificar los datos actuales de proveedores
SELECT id, name, location_id, category, has_credit
FROM suppliers
ORDER BY created_at DESC;

-- 3. Verificar si hay proveedores sin location_id
SELECT COUNT(*) as proveedores_sin_location
FROM suppliers 
WHERE location_id IS NULL OR location_id = '';

-- 4. Actualizar proveedores sin location_id (asignar a Bogotá por defecto)
UPDATE suppliers 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL OR location_id = '';

-- 5. Verificar el resultado
SELECT id, name, location_id
FROM suppliers
WHERE location_id = '550e8400-e29b-41d4-a716-446655440001';



