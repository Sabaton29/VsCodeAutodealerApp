-- Script para limpiar y reorganizar los datos en Supabase

-- 1. Limpiar clientes duplicados o con datos inválidos
DELETE FROM clients WHERE id IS NULL OR name IS NULL OR name = '';

-- 2. Limpiar vehículos duplicados o con datos inválidos
DELETE FROM vehicles WHERE id IS NULL OR make IS NULL OR model IS NULL OR plate IS NULL;

-- 3. Limpiar proveedores duplicados o con datos inválidos
DELETE FROM suppliers WHERE id IS NULL OR name IS NULL OR name = '';

-- 4. Limpiar artículos de inventario duplicados o con datos inválidos
DELETE FROM inventory_items WHERE id IS NULL OR name IS NULL OR name = '';

-- 5. Limpiar servicios duplicados o con datos inválidos
DELETE FROM services WHERE id IS NULL OR name IS NULL OR name = '';

-- 6. Limpiar personal duplicado o con datos inválidos
DELETE FROM staff_members WHERE id IS NULL OR name IS NULL OR name = '';

-- 7. Verificar integridad referencial - eliminar vehículos sin cliente válido
DELETE FROM vehicles WHERE client_id NOT IN (SELECT id FROM clients);

-- 8. Verificar integridad referencial - eliminar artículos de inventario sin proveedor válido
DELETE FROM inventory_items WHERE supplier_id IS NOT NULL AND supplier_id NOT IN (SELECT id FROM suppliers);

-- 9. Verificar integridad referencial - eliminar artículos de inventario sin ubicación válida
DELETE FROM inventory_items WHERE location_id NOT IN (SELECT id FROM locations);

-- 10. Verificar integridad referencial - eliminar clientes sin ubicación válida
DELETE FROM clients WHERE location_id NOT IN (SELECT id FROM locations);

-- 11. Verificar integridad referencial - eliminar proveedores sin ubicación válida
DELETE FROM suppliers WHERE location_id NOT IN (SELECT id FROM locations);

-- 12. Verificar integridad referencial - eliminar servicios sin ubicación válida
DELETE FROM services WHERE location_id NOT IN (SELECT id FROM locations);

-- 13. Verificar integridad referencial - eliminar personal sin ubicación válida
DELETE FROM staff_members WHERE location_id NOT IN (SELECT id FROM locations);

-- 14. Verificar el resultado final
SELECT 'Limpieza completada' as status;



