-- VERIFY RECOMMENDED ITEMS IN WORK ORDERS
-- ============================================

-- Verificar si hay órdenes de trabajo con recommended_items
SELECT 
    id,
    status,
    stage,
    diagnostic_type,
    CASE 
        WHEN recommended_items IS NULL THEN 'NULL'
        WHEN jsonb_array_length(recommended_items) = 0 THEN 'EMPTY_ARRAY'
        ELSE 'HAS_ITEMS'
    END as recommended_items_status,
    jsonb_array_length(recommended_items) as items_count
FROM work_orders 
WHERE recommended_items IS NOT NULL 
ORDER BY updated_at DESC 
LIMIT 10;

-- Verificar el contenido de recommended_items para la orden 0036 (la que acabas de crear)
SELECT 
    id,
    status,
    stage,
    diagnostic_type,
    recommended_items,
    jsonb_pretty(recommended_items) as formatted_recommended_items
FROM work_orders 
WHERE id = '0036';

-- Verificar si hay recommended_items en cualquier orden de trabajo
SELECT 
    id,
    jsonb_path_query_array(
        recommended_items, 
        '$[*]'
    ) as recommended_items_found
FROM work_orders 
WHERE recommended_items IS NOT NULL 
AND jsonb_array_length(recommended_items) > 0
ORDER BY updated_at DESC 
LIMIT 5;

-- Verificar estructura de recommended_items
SELECT 
    id,
    jsonb_path_query_array(
        recommended_items, 
        '$[*].description'
    ) as item_descriptions,
    jsonb_path_query_array(
        recommended_items, 
        '$[*].type'
    ) as item_types,
    jsonb_path_query_array(
        recommended_items, 
        '$[*].quantity'
    ) as item_quantities
FROM work_orders 
WHERE recommended_items IS NOT NULL 
AND jsonb_array_length(recommended_items) > 0
ORDER BY updated_at DESC 
LIMIT 3;

