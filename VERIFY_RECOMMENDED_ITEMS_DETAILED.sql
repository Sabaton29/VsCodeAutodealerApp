-- VERIFY RECOMMENDED ITEMS IN WORK ORDERS - DETAILED ANALYSIS
-- Este script verifica si los recommended_items se están guardando correctamente

-- 1. Verificar estructura de la tabla work_orders
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'work_orders' 
AND column_name IN ('recommended_items', 'diagnostic_data')
ORDER BY column_name;

-- 2. Verificar si hay work_orders con recommended_items
SELECT 
    id,
    created_at,
    updated_at,
    CASE 
        WHEN recommended_items IS NULL THEN 'NULL'
        WHEN jsonb_array_length(recommended_items) = 0 THEN 'EMPTY_ARRAY'
        ELSE 'HAS_ITEMS'
    END as recommended_items_status,
    jsonb_array_length(recommended_items) as item_count
FROM work_orders
WHERE recommended_items IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;

-- 3. Verificar contenido detallado de recommended_items
SELECT
    id,
    (SELECT jsonb_agg(
        jsonb_build_object(
            'id', item->>'id',
            'type', item->>'type',
            'description', item->>'description',
            'quantity', item->>'quantity',
            'unitPrice', item->>'unitPrice',
            'taxRate', item->>'taxRate'
        )
    ) FROM jsonb_array_elements(recommended_items) as item) as recommended_items_detail
FROM work_orders
WHERE recommended_items IS NOT NULL
AND jsonb_array_length(recommended_items) > 0
ORDER BY updated_at DESC
LIMIT 5;

-- 4. Verificar si hay work_orders con diagnostic_data que deberían tener recommended_items
SELECT 
    id,
    created_at,
    updated_at,
    CASE 
        WHEN diagnostic_data IS NULL THEN 'NO_DIAGNOSTIC'
        WHEN diagnostic_data = '{}' THEN 'EMPTY_DIAGNOSTIC'
        ELSE 'HAS_DIAGNOSTIC'
    END as diagnostic_status,
    CASE 
        WHEN recommended_items IS NULL THEN 'NO_RECOMMENDED'
        WHEN jsonb_array_length(recommended_items) = 0 THEN 'EMPTY_RECOMMENDED'
        ELSE 'HAS_RECOMMENDED'
    END as recommended_status
FROM work_orders
WHERE diagnostic_data IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;

-- 5. Verificar work_orders más recientes con diagnóstico
SELECT 
    id,
    created_at,
    updated_at,
    jsonb_pretty(diagnostic_data) as diagnostic_data_pretty,
    jsonb_pretty(recommended_items) as recommended_items_pretty
FROM work_orders
WHERE diagnostic_data IS NOT NULL
AND updated_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY updated_at DESC
LIMIT 3;

