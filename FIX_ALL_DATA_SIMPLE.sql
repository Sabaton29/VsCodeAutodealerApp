-- SCRIPT SIMPLIFICADO PARA CORREGIR PROBLEMAS DE DATOS
-- Este script solo actualiza valores NULL en location_id

-- 1. Verificar estado actual (solo NULL)
SELECT 'ESTADO ACTUAL' as estado;
SELECT 'Ubicaciones' as tabla, COUNT(*) as total FROM locations;
SELECT 'Clientes sin location_id' as descripcion, COUNT(*) as total FROM clients WHERE location_id IS NULL;
SELECT 'Proveedores sin location_id' as descripcion, COUNT(*) as total FROM suppliers WHERE location_id IS NULL;
SELECT 'Inventario sin location_id' as descripcion, COUNT(*) as total FROM inventory_items WHERE location_id IS NULL;
SELECT 'Servicios sin location_id' as descripcion, COUNT(*) as total FROM services WHERE location_id IS NULL;
SELECT 'Personal sin location_id' as descripcion, COUNT(*) as total FROM staff_members WHERE location_id IS NULL;

-- 2. Asegurar que exista la ubicación por defecto
INSERT INTO locations (id, name, city, address, phone, hourly_rate)
VALUES ('550e8400-e29b-41d4-a716-446655440001', 'Sede Bogotá', 'Bogotá D.C.', 'Avenida El Dorado # 68C-61', '(601) 555-1010', 108000)
ON CONFLICT (id) DO NOTHING;

-- 3. Actualizar clientes sin location_id
UPDATE clients 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL;

-- 4. Actualizar proveedores sin location_id
UPDATE suppliers 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL;

-- 5. Actualizar inventario sin location_id
UPDATE inventory_items 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL;

-- 6. Actualizar servicios sin location_id
UPDATE services 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL;

-- 7. Actualizar personal sin location_id
UPDATE staff_members 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL;

-- 8. Actualizar vehículos sin location_id (si la columna existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicles' AND column_name='location_id') THEN
        UPDATE vehicles 
        SET location_id = '550e8400-e29b-41d4-a716-446655440001'
        WHERE location_id IS NULL;
    END IF;
END $$;

-- 9. Actualizar órdenes de trabajo sin location_id (si la columna existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='work_orders' AND column_name='location_id') THEN
        UPDATE work_orders 
        SET location_id = '550e8400-e29b-41d4-a716-446655440001'
        WHERE location_id IS NULL;
    END IF;
END $$;

-- 10. Verificar estado final
SELECT 'ESTADO FINAL' as estado;
SELECT 'Clientes sin location_id' as descripcion, COUNT(*) as total FROM clients WHERE location_id IS NULL;
SELECT 'Proveedores sin location_id' as descripcion, COUNT(*) as total FROM suppliers WHERE location_id IS NULL;
SELECT 'Inventario sin location_id' as descripcion, COUNT(*) as total FROM inventory_items WHERE location_id IS NULL;
SELECT 'Servicios sin location_id' as descripcion, COUNT(*) as total FROM services WHERE location_id IS NULL;
SELECT 'Personal sin location_id' as descripcion, COUNT(*) as total FROM staff_members WHERE location_id IS NULL;

-- 11. Verificar relaciones válidas
SELECT 'VERIFICACIÓN FINAL' as estado;
SELECT 'Clientes con ubicación válida' as descripcion, COUNT(*) as total FROM clients WHERE location_id IN (SELECT id FROM locations);
SELECT 'Proveedores con ubicación válida' as descripcion, COUNT(*) as total FROM suppliers WHERE location_id IN (SELECT id FROM locations);
SELECT 'Inventario con ubicación válida' as descripcion, COUNT(*) as total FROM inventory_items WHERE location_id IN (SELECT id FROM locations);




