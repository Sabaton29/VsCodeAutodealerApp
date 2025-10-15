-- FIX WORK ORDERS LOCATION ID
-- Asignar locationId a las órdenes de trabajo que tienen locationId NULL o undefined

-- 1. Verificar el estado actual
SELECT 
    id,
    client_id,
    location_id,
    created_at
FROM work_orders 
WHERE location_id IS NULL 
ORDER BY created_at DESC;

-- 2. Asignar Bogotá como ubicación por defecto para órdenes sin locationId
-- (Asumiendo que la mayoría de órdenes son de Bogotá)
UPDATE work_orders 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'  -- Sede Bogotá
WHERE location_id IS NULL;

-- 3. Verificar los cambios
SELECT 
    COUNT(*) as total_work_orders,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440001' THEN 1 END) as bogota_orders,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440002' THEN 1 END) as cali_orders,
    COUNT(CASE WHEN location_id IS NULL THEN 1 END) as null_orders
FROM work_orders;

-- 4. Mostrar algunas órdenes actualizadas
SELECT 
    id,
    client_id,
    location_id,
    created_at
FROM work_orders 
ORDER BY created_at DESC
LIMIT 10;

