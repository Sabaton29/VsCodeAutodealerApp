-- SCRIPT DE DIAGNÓSTICO PARA VERIFICAR CARGA DE DATOS
-- Ejecutar este script en Supabase para verificar el estado de los datos

-- 1. Verificar estado de todas las tablas principales
SELECT '=== DIAGNÓSTICO DE DATOS ===' as seccion;

SELECT 'Ubicaciones' as tabla, COUNT(*) as total_registros FROM locations;
SELECT 'Clientes' as tabla, COUNT(*) as total_registros FROM clients;
SELECT 'Vehículos' as tabla, COUNT(*) as total_registros FROM vehicles;
SELECT 'Personal' as tabla, COUNT(*) as total_registros FROM staff_members;
SELECT 'Servicios' as tabla, COUNT(*) as total_registros FROM services;
SELECT 'Inventario' as tabla, COUNT(*) as total_registros FROM inventory_items;
SELECT 'Proveedores' as tabla, COUNT(*) as total_registros FROM suppliers;
SELECT 'Órdenes de Trabajo' as tabla, COUNT(*) as total_registros FROM work_orders;
SELECT 'Cotizaciones' as tabla, COUNT(*) as total_registros FROM quotes;
SELECT 'Facturas' as tabla, COUNT(*) as total_registros FROM invoices;

-- 2. Verificar estructura de tablas críticas
SELECT '=== ESTRUCTURA DE TABLAS ===' as seccion;

-- Verificar columnas de locations
SELECT 'locations' as tabla, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'locations' 
ORDER BY ordinal_position;

-- Verificar columnas de clients
SELECT 'clients' as tabla, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- Verificar columnas de work_orders
SELECT 'work_orders' as tabla, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'work_orders' 
ORDER BY ordinal_position;

-- 3. Verificar datos de ejemplo
SELECT '=== DATOS DE EJEMPLO ===' as seccion;

-- Mostrar algunos registros de cada tabla
SELECT 'Ubicaciones:' as info;
SELECT id, name, address, phone FROM locations LIMIT 3;

SELECT 'Clientes:' as info;
SELECT id, name, email, phone FROM clients LIMIT 3;

SELECT 'Vehículos:' as info;
SELECT id, make, model, year, plate FROM vehicles LIMIT 3;

SELECT 'Órdenes de Trabajo:' as info;
SELECT id, service_requested, status, stage, total FROM work_orders LIMIT 3;

-- 4. Verificar relaciones
SELECT '=== VERIFICACIÓN DE RELACIONES ===' as seccion;

-- Clientes con ubicación válida
SELECT 'Clientes con location_id válido:' as info, COUNT(*) as total
FROM clients c 
JOIN locations l ON c.location_id = l.id;

-- Vehículos con cliente válido
SELECT 'Vehículos con client_id válido:' as info, COUNT(*) as total
FROM vehicles v 
JOIN clients c ON v.client_id = c.id;

-- Órdenes de trabajo con cliente válido
SELECT 'Órdenes con client_id válido:' as info, COUNT(*) as total
FROM work_orders wo 
JOIN clients c ON wo.client_id = c.id;

-- 5. Verificar RLS (Row Level Security)
SELECT '=== VERIFICACIÓN DE RLS ===' as seccion;

SELECT schemaname, tablename, rowsecurity, hasrls
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('locations', 'clients', 'vehicles', 'work_orders', 'quotes', 'invoices')
ORDER BY tablename;

-- 6. Verificar políticas de RLS
SELECT '=== POLÍTICAS DE RLS ===' as seccion;

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('locations', 'clients', 'vehicles', 'work_orders', 'quotes', 'invoices')
ORDER BY tablename, policyname;

-- 7. Mensaje final
SELECT '=== DIAGNÓSTICO COMPLETADO ===' as seccion;
SELECT 'Si todas las tablas tienen datos pero la aplicación no los muestra, el problema está en el código frontend' as conclusion;
