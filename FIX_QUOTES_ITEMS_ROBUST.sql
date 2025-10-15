-- FIX QUOTES ITEMS ROBUST
-- Script robusto para corregir cualquier tipo de dato en la columna items

-- 1. Diagnosticar todos los tipos de datos en items
SELECT 
    jsonb_typeof(items) as json_type,
    COUNT(*) as count,
    MIN(created_at) as oldest_date,
    MAX(created_at) as newest_date
FROM quotes 
WHERE items IS NOT NULL
GROUP BY jsonb_typeof(items)
ORDER BY count DESC;

-- 2. Ver algunos ejemplos de cada tipo
SELECT 
    id,
    client_name,
    jsonb_typeof(items) as json_type,
    items,
    created_at
FROM quotes 
WHERE items IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 3. Convertir CUALQUIER tipo no-array a array vacío
UPDATE quotes 
SET items = '[]'::jsonb
WHERE items IS NULL 
   OR jsonb_typeof(items) != 'array';

-- 4. Verificar que todos los items son ahora arrays
SELECT 
    jsonb_typeof(items) as json_type,
    COUNT(*) as count
FROM quotes 
WHERE items IS NOT NULL
GROUP BY jsonb_typeof(items);

-- 5. Ahora que todos los items son arrays, corregir los unitPrice
UPDATE quotes 
SET items = (
    SELECT jsonb_agg(
        jsonb_set(
            jsonb_set(
                jsonb_set(
                    jsonb_set(
                        item,
                        '{unitPrice}',
                        to_jsonb(
                            CASE 
                                WHEN (item->>'unitPrice') IS NULL OR (item->>'unitPrice') = '' OR (item->>'unitPrice') = 'undefined' THEN
                                    CASE 
                                        WHEN item->>'type' = 'service' THEN 95000  -- Precio por defecto para servicios
                                        WHEN item->>'type' = 'inventory' THEN 50000  -- Precio por defecto para inventario
                                        ELSE 0
                                    END
                                ELSE (item->>'unitPrice')::numeric
                            END
                        )
                    ),
                    '{taxRate}',
                    to_jsonb(COALESCE((item->>'taxRate')::numeric, 19))
                ),
                '{quantity}',
                to_jsonb(COALESCE((item->>'quantity')::numeric, 1))
            ),
            '{discount}',
            to_jsonb(COALESCE((item->>'discount')::numeric, 0))
        )
    )
    FROM jsonb_array_elements(quotes.items) as item
)
WHERE jsonb_typeof(items) = 'array'
AND jsonb_array_length(items) > 0;

-- 6. Verificar el resultado final
SELECT 
    q.id,
    q.client_name,
    jsonb_typeof(q.items) as items_type,
    jsonb_array_length(q.items) as items_count,
    item->>'type' as item_type,
    item->>'description' as item_description,
    item->>'unitPrice' as unit_price,
    item->>'quantity' as quantity
FROM quotes q,
     jsonb_array_elements(q.items) as item
WHERE jsonb_typeof(q.items) = 'array'
AND jsonb_array_length(q.items) > 0
ORDER BY q.created_at DESC
LIMIT 15;

