-- FIX RECOMMENDED ITEMS DATA - CORRECT MALFORMED JSON
-- Este script corrige los recommended_items que se guardaron como objetos en lugar de arrays

-- 1. Verificar el estado actual de recommended_items
SELECT 
    id,
    created_at,
    updated_at,
    CASE 
        WHEN recommended_items IS NULL THEN 'NULL'
        WHEN jsonb_typeof(recommended_items) = 'array' THEN 'ARRAY'
        WHEN jsonb_typeof(recommended_items) = 'object' THEN 'OBJECT'
        ELSE 'OTHER'
    END as recommended_items_type,
    jsonb_pretty(recommended_items) as recommended_items_content
FROM work_orders
WHERE recommended_items IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;

-- 2. Corregir recommended_items que son objetos pero deberían ser arrays vacíos
UPDATE work_orders 
SET recommended_items = '[]'::jsonb
WHERE recommended_items IS NOT NULL 
AND jsonb_typeof(recommended_items) = 'object'
AND jsonb_array_length(recommended_items) IS NULL;

-- 3. Verificar que no haya recommended_items con estructura incorrecta
SELECT 
    id,
    jsonb_typeof(recommended_items) as type,
    jsonb_pretty(recommended_items) as content
FROM work_orders
WHERE recommended_items IS NOT NULL
AND jsonb_typeof(recommended_items) != 'array'
ORDER BY updated_at DESC;

-- 4. Si hay recommended_items que son objetos con datos válidos, convertirlos a arrays
-- (Esto es más complejo y requiere verificar la estructura específica)
-- Por ahora, vamos a limpiar todos los objetos malformados

-- 5. Verificar work_orders con recommended_items válidos (arrays)
SELECT 
    id,
    created_at,
    updated_at,
    jsonb_array_length(recommended_items) as item_count,
    jsonb_pretty(recommended_items) as recommended_items_content
FROM work_orders
WHERE recommended_items IS NOT NULL
AND jsonb_typeof(recommended_items) = 'array'
AND jsonb_array_length(recommended_items) > 0
ORDER BY updated_at DESC
LIMIT 5;

-- 6. Limpiar recommended_items que no son arrays válidos
UPDATE work_orders 
SET recommended_items = NULL
WHERE recommended_items IS NOT NULL 
AND jsonb_typeof(recommended_items) != 'array';

-- 7. Verificar el estado final
SELECT 
    id,
    CASE 
        WHEN recommended_items IS NULL THEN 'NULL'
        WHEN jsonb_typeof(recommended_items) = 'array' THEN 
            CASE 
                WHEN jsonb_array_length(recommended_items) = 0 THEN 'EMPTY_ARRAY'
                ELSE 'ARRAY_WITH_ITEMS'
            END
        ELSE 'OTHER'
    END as recommended_items_status,
    jsonb_array_length(recommended_items) as item_count
FROM work_orders
WHERE recommended_items IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;

