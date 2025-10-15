-- Script de diagnóstico para supplier_id

-- 1. Verificar el tipo de dato de la columna supplier_id
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'inventory_items' 
AND column_name = 'supplier_id';

-- 2. Ver algunos registros de inventory_items
SELECT id, name, supplier_id, created_at
FROM inventory_items 
LIMIT 10;

-- 3. Contar items por estado de supplier_id
SELECT 
    CASE 
        WHEN supplier_id IS NULL THEN 'NULL'
        ELSE 'Tiene valor'
    END as estado,
    COUNT(*) as total
FROM inventory_items
GROUP BY 
    CASE 
        WHEN supplier_id IS NULL THEN 'NULL'
        ELSE 'Tiene valor'
    END;

-- 4. Ver si hay supplier_id que no existen en suppliers
SELECT 'Items con supplier_id inválido' as descripcion, COUNT(*) as total
FROM inventory_items i
WHERE i.supplier_id IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM suppliers s WHERE s.id = i.supplier_id);




