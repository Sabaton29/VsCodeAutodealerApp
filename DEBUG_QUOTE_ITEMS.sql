-- DEBUG QUOTE ITEMS - Verificar precios de ítems en cotizaciones
-- Este script verifica los datos de los ítems dentro de las cotizaciones

-- 1. Verificar la estructura de la columna items en quotes
SELECT 
    id,
    client_name,
    status,
    total,
    items
FROM quotes
ORDER BY created_at DESC
LIMIT 5;

-- 2. Extraer ítems individuales de las cotizaciones
SELECT 
    q.id as quote_id,
    q.client_name,
    q.status,
    q.total,
    item->>'id' as item_id,
    item->>'type' as item_type,
    item->>'description' as item_description,
    item->>'quantity' as item_quantity,
    item->>'unitPrice' as item_unit_price,
    item->>'costPrice' as item_cost_price,
    item->>'taxRate' as item_tax_rate,
    item->>'discount' as item_discount
FROM quotes q,
     jsonb_array_elements(q.items) as item
WHERE q.items IS NOT NULL 
AND jsonb_array_length(q.items) > 0
ORDER BY q.created_at DESC
LIMIT 20;

-- 3. Verificar si hay ítems con unitPrice NULL o vacío
SELECT 
    q.id as quote_id,
    q.client_name,
    COUNT(*) as total_items,
    COUNT(CASE WHEN (item->>'unitPrice') IS NULL OR (item->>'unitPrice') = '' THEN 1 END) as null_unit_price_count,
    COUNT(CASE WHEN (item->>'unitPrice') IS NOT NULL AND (item->>'unitPrice') != '' THEN 1 END) as valid_unit_price_count
FROM quotes q,
     jsonb_array_elements(q.items) as item
WHERE q.items IS NOT NULL 
AND jsonb_array_length(q.items) > 0
GROUP BY q.id, q.client_name
ORDER BY q.created_at DESC
LIMIT 10;

-- 4. Verificar tipos de datos de unitPrice
SELECT 
    q.id as quote_id,
    item->>'unitPrice' as raw_unit_price,
    pg_typeof(item->>'unitPrice') as data_type,
    CASE 
        WHEN (item->>'unitPrice') IS NULL THEN 'NULL'
        WHEN (item->>'unitPrice') = '' THEN 'EMPTY_STRING'
        WHEN (item->>'unitPrice') ~ '^[0-9]+\.?[0-9]*$' THEN 'NUMERIC_STRING'
        ELSE 'OTHER'
    END as price_format
FROM quotes q,
     jsonb_array_elements(q.items) as item
WHERE q.items IS NOT NULL 
AND jsonb_array_length(q.items) > 0
ORDER BY q.created_at DESC
LIMIT 15;

-- 5. Comparar con datos de servicios e inventario para verificar si los precios están correctos
SELECT 
    'SERVICE' as source_type,
    id,
    name,
    sale_price,
    duration_hours
FROM services
WHERE id IN (
    SELECT DISTINCT item->>'id'
    FROM quotes q, jsonb_array_elements(q.items) as item
    WHERE item->>'type' = 'service'
    LIMIT 5
)

UNION ALL

SELECT 
    'INVENTORY' as source_type,
    id,
    name,
    sale_price,
    NULL as duration_hours
FROM inventory_items
WHERE id IN (
    SELECT DISTINCT item->>'id'
    FROM quotes q, jsonb_array_elements(q.items) as item
    WHERE item->>'type' = 'inventory'
    LIMIT 5
);

