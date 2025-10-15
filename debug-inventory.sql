-- Script para depurar y corregir datos de inventario en Supabase

-- 1. Verificar la estructura de la tabla inventory_items
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'inventory_items' 
ORDER BY ordinal_position;

-- 2. Verificar los datos actuales de inventario
SELECT id, name, sku, supplier_id, location_id, stock
FROM inventory_items
ORDER BY created_at DESC;

-- 3. Verificar si hay artículos sin location_id
SELECT COUNT(*) as articulos_sin_location
FROM inventory_items 
WHERE location_id IS NULL OR location_id = '';

-- 4. Verificar si hay artículos con supplier_id vacío
SELECT COUNT(*) as articulos_sin_supplier
FROM inventory_items 
WHERE supplier_id IS NULL OR supplier_id = '';

-- 5. Actualizar artículos sin location_id (asignar a Bogotá por defecto)
UPDATE inventory_items 
SET location_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE location_id IS NULL OR location_id = '';

-- 6. Verificar el resultado
SELECT id, name, supplier_id, location_id
FROM inventory_items
WHERE location_id = '550e8400-e29b-41d4-a716-446655440001';



