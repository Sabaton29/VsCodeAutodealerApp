-- Script para corregir supplier_id inválidos en inventory_items
-- Este script convierte la columna temporalmente a texto para limpiar valores inválidos

-- 1. Ver el problema actual
SELECT 'Verificando supplier_id en inventory_items' as estado;
SELECT id, name, supplier_id 
FROM inventory_items 
LIMIT 10;

-- 2. Opción A: Si supplier_id tiene valores de texto inválidos, necesitamos recrear la columna
-- Primero, crear una columna temporal
ALTER TABLE inventory_items ADD COLUMN supplier_id_temp UUID;

-- 3. Copiar solo los UUIDs válidos
UPDATE inventory_items 
SET supplier_id_temp = 
  CASE 
    WHEN supplier_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
    THEN supplier_id 
    ELSE NULL 
  END;

-- 4. Eliminar la columna original
ALTER TABLE inventory_items DROP COLUMN supplier_id;

-- 5. Renombrar la columna temporal
ALTER TABLE inventory_items RENAME COLUMN supplier_id_temp TO supplier_id;

-- 6. Verificar resultado
SELECT 'Resultado final' as estado;
SELECT 'Items sin proveedor' as descripcion, COUNT(*) as total 
FROM inventory_items 
WHERE supplier_id IS NULL;

SELECT 'Items con proveedor válido' as descripcion, COUNT(*) as total 
FROM inventory_items 
WHERE supplier_id IS NOT NULL;




