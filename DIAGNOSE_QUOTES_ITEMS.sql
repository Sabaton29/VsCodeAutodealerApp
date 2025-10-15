-- DIAGNOSE QUOTES ITEMS STRUCTURE
-- Este script diagnostica la estructura real de la columna items

-- 1. Verificar el tipo de datos de la columna items
SELECT 
    id,
    client_name,
    pg_typeof(items) as items_data_type,
    CASE 
        WHEN items IS NULL THEN 'NULL'
        WHEN jsonb_typeof(items) = 'array' THEN 'ARRAY'
        WHEN jsonb_typeof(items) = 'object' THEN 'OBJECT'
        WHEN jsonb_typeof(items) = 'string' THEN 'STRING'
        WHEN jsonb_typeof(items) = 'number' THEN 'NUMBER'
        WHEN jsonb_typeof(items) = 'boolean' THEN 'BOOLEAN'
        ELSE 'OTHER'
    END as json_type
FROM quotes
ORDER BY created_at DESC
LIMIT 10;

-- 2. Ver el contenido real de la columna items
SELECT 
    id,
    client_name,
    items
FROM quotes
ORDER BY created_at DESC
LIMIT 5;

-- 3. Si items es un objeto, convertirlo a array
-- Primero verificar si necesitamos hacer la conversión
SELECT 
    COUNT(*) as total_quotes,
    COUNT(CASE WHEN jsonb_typeof(items) = 'array' THEN 1 END) as array_type_count,
    COUNT(CASE WHEN jsonb_typeof(items) = 'object' THEN 1 END) as object_type_count,
    COUNT(CASE WHEN items IS NULL THEN 1 END) as null_count
FROM quotes;

-- 4. Si hay objetos, convertirlos a arrays (ejecutar solo si es necesario)
-- UPDATE quotes 
-- SET items = jsonb_build_array(items)
-- WHERE jsonb_typeof(items) = 'object';

-- 5. Después de la conversión, verificar items individuales
SELECT 
    q.id,
    q.client_name,
    item->>'id' as item_id,
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

