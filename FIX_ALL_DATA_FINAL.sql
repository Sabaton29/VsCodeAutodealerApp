-- SCRIPT FINAL PARA CORREGIR TODOS LOS PROBLEMAS DE DATOS
-- Ejecutar este script en Supabase para corregir todos los problemas

-- 1. Verificar estado actual
SELECT 'ESTADO ACTUAL' as estado;
SELECT 'Ubicaciones' as tabla, COUNT(*) as total FROM locations;
SELECT 'Clientes' as tabla, COUNT(*) as total, COUNT(CASE WHEN location_id IS NULL THEN 1 END) as sin_location FROM clients;
SELECT 'Proveedores' as tabla, COUNT(*) as total, COUNT(CASE WHEN location_id IS NULL THEN 1 END) as sin_location FROM suppliers;
SELECT 'Inventario' as tabla, COUNT(*) as total, COUNT(CASE WHEN location_id IS NULL THEN 1 END) as sin_location FROM inventory_items;
SELECT 'Servicios' as tabla, COUNT(*) as total, COUNT(CASE WHEN location_id IS NULL THEN 1 END) as sin_location FROM services;
SELECT 'Personal' as tabla, COUNT(*) as total, COUNT(CASE WHEN location_id IS NULL THEN 1 END) as sin_location FROM staff_members;

-- 2. Corregir clientes sin location_id
UPDATE clients 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL;

-- 3. Corregir proveedores sin location_id
UPDATE suppliers 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL;

-- 4. Corregir artículos de inventario sin location_id
UPDATE inventory_items 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL;

-- 5. Corregir servicios sin location_id
UPDATE services 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL;

-- 6. Corregir personal sin location_id
UPDATE staff_members 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL;

-- 6.1. Corregir supplier_id vacío en inventario
UPDATE inventory_items 
SET supplier_id = NULL
WHERE supplier_id = '';

-- 7. Verificar estado final
SELECT 'ESTADO FINAL' as estado;
SELECT 'Ubicaciones' as tabla, COUNT(*) as total FROM locations;
SELECT 'Clientes' as tabla, COUNT(*) as total, COUNT(CASE WHEN location_id IS NULL THEN 1 END) as sin_location FROM clients;
SELECT 'Proveedores' as tabla, COUNT(*) as total, COUNT(CASE WHEN location_id IS NULL THEN 1 END) as sin_location FROM suppliers;
SELECT 'Inventario' as tabla, COUNT(*) as total, COUNT(CASE WHEN location_id IS NULL THEN 1 END) as sin_location FROM inventory_items;
SELECT 'Servicios' as tabla, COUNT(*) as total, COUNT(CASE WHEN location_id IS NULL THEN 1 END) as sin_location FROM services;
SELECT 'Personal' as tabla, COUNT(*) as total, COUNT(CASE WHEN location_id IS NULL THEN 1 END) as sin_location FROM staff_members;

-- 8. Verificar relaciones
SELECT 'RELACIONES' as estado;
SELECT 'Clientes con ubicación válida' as descripcion, COUNT(*) as total FROM clients WHERE location_id IN (SELECT id FROM locations);
SELECT 'Proveedores con ubicación válida' as descripcion, COUNT(*) as total FROM suppliers WHERE location_id IN (SELECT id FROM locations);
SELECT 'Inventario con ubicación válida' as descripcion, COUNT(*) as total FROM inventory_items WHERE location_id IN (SELECT id FROM locations);
SELECT 'Servicios con ubicación válida' as descripcion, COUNT(*) as total FROM services WHERE location_id IN (SELECT id FROM locations);
SELECT 'Personal con ubicación válida' as descripcion, COUNT(*) as total FROM staff_members WHERE location_id IN (SELECT id FROM locations);

-- 9. Verificar supplier_id en inventario
SELECT 'SUPPLIER_ID EN INVENTARIO' as estado;
SELECT 'Artículos con supplier_id válido' as descripcion, COUNT(*) as total FROM inventory_items WHERE supplier_id IS NOT NULL AND supplier_id IN (SELECT id FROM suppliers);
SELECT 'Artículos sin supplier_id' as descripcion, COUNT(*) as total FROM inventory_items WHERE supplier_id IS NULL;
SELECT 'Artículos con supplier_id inválido' as descripcion, COUNT(*) as total FROM inventory_items WHERE supplier_id IS NOT NULL AND supplier_id NOT IN (SELECT id FROM suppliers);
