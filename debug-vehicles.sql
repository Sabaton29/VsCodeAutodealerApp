-- Script para depurar y corregir datos de vehículos en Supabase

-- 1. Verificar la estructura de la tabla vehicles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'vehicles' 
ORDER BY ordinal_position;

-- 2. Verificar los datos actuales de vehículos
SELECT id, client_id, make, model, plate, year
FROM vehicles
ORDER BY created_at DESC;

-- 3. Verificar si hay vehículos sin client_id
SELECT COUNT(*) as vehiculos_sin_client
FROM vehicles 
WHERE client_id IS NULL OR client_id = '';

-- 4. Verificar relaciones client-vehicle
SELECT 
    v.id as vehicle_id,
    v.make,
    v.model,
    v.plate,
    v.client_id,
    c.name as client_name
FROM vehicles v
LEFT JOIN clients c ON v.client_id = c.id
ORDER BY v.created_at DESC;



