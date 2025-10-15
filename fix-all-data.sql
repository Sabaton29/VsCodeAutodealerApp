-- Script unificado para corregir todos los problemas de datos en Supabase

-- 1. Verificar y corregir clientes sin location_id
UPDATE clients 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL OR location_id = '';

-- 2. Verificar y corregir proveedores sin location_id
UPDATE suppliers 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL OR location_id = '';

-- 3. Verificar y corregir artículos de inventario sin location_id
UPDATE inventory_items 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL OR location_id = '';

-- 4. Verificar y corregir servicios sin location_id
UPDATE services 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL OR location_id = '';

-- 5. Verificar y corregir personal sin location_id
UPDATE staff_members 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL OR location_id = '';

-- 6. Verificar el resultado final
SELECT 'Clientes' as tabla, COUNT(*) as total, COUNT(CASE WHEN location_id IS NOT NULL THEN 1 END) as con_location
FROM clients
UNION ALL
SELECT 'Proveedores' as tabla, COUNT(*) as total, COUNT(CASE WHEN location_id IS NOT NULL THEN 1 END) as con_location
FROM suppliers
UNION ALL
SELECT 'Inventario' as tabla, COUNT(*) as total, COUNT(CASE WHEN location_id IS NOT NULL THEN 1 END) as con_location
FROM inventory_items
UNION ALL
SELECT 'Servicios' as tabla, COUNT(*) as total, COUNT(CASE WHEN location_id IS NOT NULL THEN 1 END) as con_location
FROM services
UNION ALL
SELECT 'Personal' as tabla, COUNT(*) as total, COUNT(CASE WHEN location_id IS NOT NULL THEN 1 END) as con_location
FROM staff_members;



