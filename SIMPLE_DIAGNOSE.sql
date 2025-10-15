-- SIMPLE DIAGNOSE - Ver estructura real de items
-- Este script es muy simple para evitar errores

-- 1. Ver el tipo de datos de items
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

