-- Verificar qué columnas de fecha existen en work_orders
SELECT 
    id,
    created_at,
    updated_at,
    -- Buscar otras posibles columnas de fecha
    service_date_time,
    delivery_date,
    next_maintenance_date
FROM work_orders 
ORDER BY created_at DESC 
LIMIT 5;
