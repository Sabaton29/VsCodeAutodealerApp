-- Verificación simple de la estructura de work_orders
SELECT 
    id,
    created_at,
    updated_at
FROM work_orders 
ORDER BY created_at DESC 
LIMIT 3;
