-- FIX QUOTES ITEMS FINAL
-- Este script corrige definitivamente la estructura de items en quotes

-- 1. Primero, diagnosticar qué hay en la columna items
SELECT 
    id,
    client_name,
    pg_typeof(items) as items_type,
    CASE 
        WHEN items IS NULL THEN 'NULL'
        WHEN jsonb_typeof(items) = 'array' THEN 'ARRAY'
        WHEN jsonb_typeof(items) = 'object' THEN 'OBJECT'
        WHEN jsonb_typeof(items) = 'string' THEN 'STRING'
        ELSE 'OTHER'
    END as json_type,
    items
FROM quotes
ORDER BY created_at DESC
LIMIT 3;

-- 2. Si items es un objeto, convertirlo a array
UPDATE quotes 
SET items = jsonb_build_array(items)
WHERE jsonb_typeof(items) = 'object';

-- 3. Si items es NULL, inicializarlo como array vacío
UPDATE quotes 
SET items = '[]'::jsonb
WHERE items IS NULL;

-- 4. Ahora que items es un array, corregir los unitPrice
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
WHERE items IS NOT NULL 
AND jsonb_typeof(items) = 'array'
AND jsonb_array_length(items) > 0;

-- 5. Verificar el resultado final
SELECT 
    q.id,
    q.client_name,
    item->>'type' as item_type,
    item->>'description' as item_description,
    item->>'unitPrice' as unit_price,
    item->>'quantity' as quantity,
    item->>'taxRate' as tax_rate
FROM quotes q,
     jsonb_array_elements(q.items) as item
WHERE jsonb_typeof(q.items) = 'array'
AND jsonb_array_length(q.items) > 0
ORDER BY q.created_at DESC
LIMIT 15;

