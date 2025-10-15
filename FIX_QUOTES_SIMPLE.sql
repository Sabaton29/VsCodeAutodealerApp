-- FIX QUOTES SIMPLE
-- Este script corrige los unitPrice de forma simple sin depender de otras tablas

-- 1. Primero, convertir objetos a arrays si es necesario
UPDATE quotes 
SET items = jsonb_build_array(items)
WHERE jsonb_typeof(items) = 'object';

-- 2. Corregir unitPrice con valores por defecto simples
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

