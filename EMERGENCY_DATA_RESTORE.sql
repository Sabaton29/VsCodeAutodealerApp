-- SCRIPT DE EMERGENCIA PARA RESTAURAR DATOS BÁSICOS
-- Ejecutar este script en Supabase para restaurar la funcionalidad básica

-- 1. Verificar estado actual
SELECT 'ESTADO ACTUAL - ANTES DE RESTAURAR' as estado;
SELECT 'Ubicaciones' as tabla, COUNT(*) as total FROM locations;
SELECT 'Clientes' as tabla, COUNT(*) as total FROM clients;
SELECT 'Vehículos' as tabla, COUNT(*) as total FROM vehicles;
SELECT 'Personal' as tabla, COUNT(*) as total FROM staff_members;
SELECT 'Servicios' as tabla, COUNT(*) as total FROM services;
SELECT 'Inventario' as tabla, COUNT(*) as total FROM inventory_items;
SELECT 'Proveedores' as tabla, COUNT(*) as total FROM suppliers;

-- 2. Crear ubicación por defecto si no existe
INSERT INTO locations (id, name, address, phone, email, is_active, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Sede Bogotá',
    'Calle 123 #45-67, Bogotá',
    '+57 1 234-5678',
    'bogota@taller.com',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Crear cliente por defecto
INSERT INTO clients (id, name, email, phone, address, location_id, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Cliente Demo',
    'demo@cliente.com',
    '+57 1 234-5678',
    'Calle Demo #123, Bogotá',
    '550e8400-e29b-41d4-a716-446655440001',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 4. Crear vehículo por defecto
INSERT INTO vehicles (id, make, model, year, plate, color, client_id, location_id, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Toyota',
    'Corolla',
    2020,
    'ABC-123',
    'Blanco',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 5. Crear personal por defecto
INSERT INTO staff_members (id, name, email, phone, role, location_id, is_active, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Admin Taller',
    'admin@taller.com',
    '+57 1 234-5678',
    'Administrador',
    '550e8400-e29b-41d4-a716-446655440001',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 6. Crear servicios básicos
INSERT INTO services (id, name, description, price, category, location_id, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Cambio de Aceite', 'Cambio de aceite y filtro', 50000, 'Mantenimiento', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'Revisión General', 'Revisión completa del vehículo', 80000, 'Diagnóstico', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'Alineación', 'Alineación y balanceo', 60000, 'Mantenimiento', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 7. Crear proveedor por defecto
INSERT INTO suppliers (id, name, email, phone, address, location_id, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Proveedor Demo',
    'proveedor@demo.com',
    '+57 1 234-5678',
    'Calle Proveedor #456, Bogotá',
    '550e8400-e29b-41d4-a716-446655440001',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 8. Crear artículos de inventario básicos
INSERT INTO inventory_items (id, name, description, price, category, supplier_id, location_id, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Filtro de Aceite', 'Filtro de aceite para motor', 15000, 'Filtros', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'Aceite Motor', 'Aceite sintético 5W-30', 25000, 'Lubricantes', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'Pastillas de Freno', 'Pastillas de freno delanteras', 45000, 'Frenos', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 9. Crear orden de trabajo de ejemplo
INSERT INTO work_orders (id, client_id, vehicle_id, service_requested, status, stage, total, date, location_id, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Mantenimiento general',
    'En Proceso',
    'Diagnóstico',
    0,
    NOW(),
    '550e8400-e29b-41d4-a716-446655440001',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 10. Verificar estado final
SELECT 'ESTADO FINAL - DESPUÉS DE RESTAURAR' as estado;
SELECT 'Ubicaciones' as tabla, COUNT(*) as total FROM locations;
SELECT 'Clientes' as tabla, COUNT(*) as total FROM clients;
SELECT 'Vehículos' as tabla, COUNT(*) as total FROM vehicles;
SELECT 'Personal' as tabla, COUNT(*) as total FROM staff_members;
SELECT 'Servicios' as tabla, COUNT(*) as total FROM services;
SELECT 'Inventario' as tabla, COUNT(*) as total FROM inventory_items;
SELECT 'Proveedores' as tabla, COUNT(*) as total FROM suppliers;
SELECT 'Órdenes de Trabajo' as tabla, COUNT(*) as total FROM work_orders;

-- 11. Mensaje de confirmación
SELECT '✅ DATOS DE EMERGENCIA RESTAURADOS EXITOSAMENTE' as resultado;
SELECT '🔄 Recarga la página para ver los datos restaurados' as instruccion;
