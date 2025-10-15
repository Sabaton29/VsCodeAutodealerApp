-- Script para verificar el estado final de los datos

-- 1. Verificar ubicaciones
SELECT 'Ubicaciones' as tabla, COUNT(*) as total FROM locations;

-- 2. Verificar clientes
SELECT 'Clientes' as tabla, COUNT(*) as total FROM clients;

-- 3. Verificar vehículos
SELECT 'Vehículos' as tabla, COUNT(*) as total FROM vehicles;

-- 4. Verificar proveedores
SELECT 'Proveedores' as tabla, COUNT(*) as total FROM suppliers;

-- 5. Verificar inventario
SELECT 'Inventario' as tabla, COUNT(*) as total FROM inventory_items;

-- 6. Verificar servicios
SELECT 'Servicios' as tabla, COUNT(*) as total FROM services;

-- 7. Verificar personal
SELECT 'Personal' as tabla, COUNT(*) as total FROM staff_members;

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