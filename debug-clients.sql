-- Script para depurar y corregir datos de clientes en Supabase

-- 1. Verificar la estructura de la tabla clients
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- 2. Verificar los datos actuales de clientes
SELECT id, name, location_id, person_type, id_type, id_number
FROM clients
ORDER BY created_at DESC;

-- 3. Verificar si hay clientes sin location_id
SELECT COUNT(*) as clientes_sin_location
FROM clients 
WHERE location_id IS NULL OR location_id = '';

-- 4. Verificar las ubicaciones disponibles
SELECT id, name, city 
FROM locations;

-- 5. Actualizar clientes sin location_id (asignar a Bogotá por defecto)
UPDATE clients 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL OR location_id = '';

-- 6. Verificar el resultado
SELECT id, name, location_id
FROM clients
WHERE location_id = '550e8400-e29b-41d4-a716-446655440001';



