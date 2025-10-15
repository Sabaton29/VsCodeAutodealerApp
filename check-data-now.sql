-- Script para verificar el estado de los datos en tiempo real

-- 1. Verificar ubicaciones
SELECT 'Ubicaciones' as tabla, COUNT(*) as total FROM locations;

-- 2. Verificar clientes con detalles
SELECT 
    'Clientes' as tabla,
    COUNT(*) as total,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440001' THEN 1 END) as bogota,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440002' THEN 1 END) as cali,
    COUNT(CASE WHEN location_id IS NULL OR location_id = '' THEN 1 END) as sin_location
FROM clients;

-- 3. Verificar vehículos con detalles
SELECT 
    'Vehículos' as tabla,
    COUNT(*) as total,
    COUNT(CASE WHEN client_id IS NOT NULL THEN 1 END) as con_client,
    COUNT(CASE WHEN client_id IS NULL OR client_id = '' THEN 1 END) as sin_client
FROM vehicles;

-- 4. Verificar proveedores con detalles
SELECT 
    'Proveedores' as tabla,
    COUNT(*) as total,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440001' THEN 1 END) as bogota,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440002' THEN 1 END) as cali,
    COUNT(CASE WHEN location_id IS NULL OR location_id = '' THEN 1 END) as sin_location
FROM suppliers;

-- 5. Verificar inventario con detalles
SELECT 
    'Inventario' as tabla,
    COUNT(*) as total,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440001' THEN 1 END) as bogota,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440002' THEN 1 END) as cali,
    COUNT(CASE WHEN supplier_id IS NOT NULL THEN 1 END) as con_supplier,
    COUNT(CASE WHEN supplier_id IS NULL OR supplier_id = '' THEN 1 END) as sin_supplier
FROM inventory_items;

-- 6. Verificar servicios con detalles
SELECT 
    'Servicios' as tabla,
    COUNT(*) as total,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440001' THEN 1 END) as bogota,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440002' THEN 1 END) as cali,
    COUNT(CASE WHEN location_id IS NULL OR location_id = '' THEN 1 END) as sin_location
FROM services;

-- 7. Verificar personal con detalles
SELECT 
    'Personal' as tabla,
    COUNT(*) as total,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440001' THEN 1 END) as bogota,
    COUNT(CASE WHEN location_id = '550e8400-e29b-41d4-a716-446655440002' THEN 1 END) as cali,
    COUNT(CASE WHEN location_id IS NULL OR location_id = '' THEN 1 END) as sin_location
FROM staff_members;

-- 8. Verificar relaciones client-vehicle
SELECT 
    'Relaciones Cliente-Vehículo' as descripcion,
    COUNT(*) as total_relaciones
FROM vehicles v
INNER JOIN clients c ON v.client_id = c.id;

-- 9. Verificar relaciones inventario-proveedor
SELECT 
    'Relaciones Inventario-Proveedor' as descripcion,
    COUNT(*) as total_relaciones
FROM inventory_items i
INNER JOIN suppliers s ON i.supplier_id = s.id;

-- 10. Verificar relaciones inventario-ubicación
SELECT 
    'Relaciones Inventario-Ubicación' as descripcion,
    COUNT(*) as total_relaciones
FROM inventory_items i
INNER JOIN locations l ON i.location_id = l.id;