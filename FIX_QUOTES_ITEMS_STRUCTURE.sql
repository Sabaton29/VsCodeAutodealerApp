-- FIX QUOTES ITEMS STRUCTURE
-- Este script corrige la estructura de la columna items en quotes

-- 1. Primero, convertir objetos a arrays si es necesario
UPDATE quotes 
SET items = jsonb_build_array(items)
WHERE jsonb_typeof(items) = 'object';

-- 2. Ahora que items es un array, corregir los unitPrice
UPDATE quotes 
SET items = (
    SELECT jsonb_agg(
        CASE 
            WHEN item->>'type' = 'service' THEN
                jsonb_set(
                    jsonb_set(
                        jsonb_set(
                            item,
                            '{unitPrice}',
                            to_jsonb(
                                CASE 
                                    WHEN (item->>'unitPrice') IS NULL OR (item->>'unitPrice') = '' OR (item->>'unitPrice') = 'undefined' THEN
                                        COALESCE(
                                            (SELECT (s.duration_hours * 95000)::numeric 
                                             FROM services s 
                                             WHERE s.id = (item->>'id')),
                                            95000
                                        )
                                    ELSE (item->>'unitPrice')::numeric
                                END
                            )
                        ),
                        '{taxRate}',
                        to_jsonb(COALESCE((item->>'taxRate')::numeric, 19))
                    ),
                    '{quantity}',
                    to_jsonb(COALESCE((item->>'quantity')::numeric, 1))
                )
            WHEN item->>'type' = 'inventory' THEN
                jsonb_set(
                    jsonb_set(
                        jsonb_set(
                            jsonb_set(
                                item,
                                '{unitPrice}',
                                to_jsonb(
                                    CASE 
                                        WHEN (item->>'unitPrice') IS NULL OR (item->>'unitPrice') = '' OR (item->>'unitPrice') = 'undefined' THEN
                                            COALESCE(
                                                (SELECT i.sale_price 
                                                 FROM inventory_items i 
                                                 WHERE i.id = (item->>'id')),
                                                0
                                            )
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
                    '{costPrice}',
                    to_jsonb(
                        COALESCE(
                            (item->>'costPrice')::numeric,
                            (SELECT i.cost_price FROM inventory_items i WHERE i.id = (item->>'id')),
                            0
                        )
                    )
                )
            ELSE item
        END
    )
    FROM jsonb_array_elements(quotes.items) as item
)
WHERE items IS NOT NULL 
AND jsonb_typeof(items) = 'array'
AND jsonb_array_length(items) > 0;

-- 3. Verificar el resultado
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

