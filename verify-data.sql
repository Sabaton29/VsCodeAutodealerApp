-- Script para verificar el estado de los datos en tiempo real

-- 1. Verificar ubicaciones
SELECT 'Ubicaciones' as tabla, COUNT(*) as total FROM locations;

-- 2. Verificar clientes con sus ubicaciones
SELECT 
    'Clientes' as tabla,
    COUNT(*) as total,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440001' THEN 1 END) as bogota,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440002' THEN 1 END) as cali,
    COUNT(CASE WHEN location_id IS NULL OR location_id = '' THEN 1 END) as sin_location
FROM clients;

-- 3. Verificar vehículos con sus clientes
SELECT 
    'Vehículos' as tabla,
    COUNT(*) as total,
    COUNT(CASE WHEN client_id IS NOT NULL THEN 1 END) as con_client,
    COUNT(CASE WHEN client_id IS NULL OR client_id = '' THEN 1 END) as sin_client
FROM vehicles;

-- 4. Verificar proveedores con sus ubicaciones
SELECT 
    'Proveedores' as tabla,
    COUNT(*) as total,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440001' THEN 1 END) as bogota,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440002' THEN 1 END) as cali,
    COUNT(CASE WHEN location_id IS NULL OR location_id = '' THEN 1 END) as sin_location
FROM suppliers;

-- 5. Verificar inventario con sus ubicaciones y proveedores
SELECT 
    'Inventario' as tabla,
    COUNT(*) as total,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440001' THEN 1 END) as bogota,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440002' THEN 1 END) as cali,
    COUNT(CASE WHEN supplier_id IS NOT NULL THEN 1 END) as con_supplier,
    COUNT(CASE WHEN supplier_id IS NULL OR supplier_id = '' THEN 1 END) as sin_supplier
FROM inventory_items;

-- 6. Verificar servicios con sus ubicaciones
SELECT 
    'Servicios' as tabla,
    COUNT(*) as total,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440001' THEN 1 END) as bogota,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440002' THEN 1 END) as cali,
    COUNT(CASE WHEN location_id IS NULL OR location_id = '' THEN 1 END) as sin_location
FROM services;

-- 7. Verificar personal con sus ubicaciones
SELECT 
    'Personal' as tabla,
    COUNT(*) as total,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440001' THEN 1 END) as bogota,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440002' THEN 1 END) as cali,
    COUNT(CASE WHEN location_id IS NULL OR location_id = '' THEN 1 END) as sin_location
FROM staff_members;



