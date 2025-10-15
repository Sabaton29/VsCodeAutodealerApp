-- TEST QUOTE CREATION WITH RECOMMENDED ITEMS
-- Este script verifica la creación de cotizaciones y sus items

-- 1. Verificar cotizaciones recientes
SELECT 
    id,
    work_order_id,
    client_id,
    created_at,
    total,
    status,
    jsonb_array_length(items) as item_count
FROM quotes
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 5;

-- 2. Verificar items en cotizaciones recientes
SELECT 
    q.id as quote_id,
    q.work_order_id,
    q.created_at as quote_created,
    jsonb_agg(
        jsonb_build_object(
            'id', item->>'id',
            'type', item->>'type',
            'description', item->>'description',
            'quantity', item->>'quantity',
            'unitPrice', item->>'unitPrice'
        )
    ) as quote_items
FROM quotes q,
     jsonb_array_elements(q.items) as item
WHERE q.created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY q.id, q.work_order_id, q.created_at
ORDER BY q.created_at DESC
LIMIT 3;

-- 3. Verificar si hay work_orders con recommended_items que no tienen cotizaciones
SELECT 
    wo.id as work_order_id,
    wo.created_at,
    wo.updated_at,
    jsonb_array_length(wo.recommended_items) as recommended_count,
    COUNT(q.id) as quote_count
FROM work_orders wo
LEFT JOIN quotes q ON q.work_order_id = wo.id
WHERE wo.recommended_items IS NOT NULL
AND jsonb_array_length(wo.recommended_items) > 0
AND wo.updated_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY wo.id, wo.created_at, wo.updated_at, wo.recommended_items
ORDER BY wo.updated_at DESC
LIMIT 5;

-- 4. Verificar estructura de la tabla quotes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'quotes' 
AND column_name IN ('items', 'work_order_id', 'client_id', 'total')
ORDER BY column_name;

