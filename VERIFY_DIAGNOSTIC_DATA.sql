-- VERIFY DIAGNOSTIC DATA STRUCTURE
-- ============================================

-- Verificar estructura de la tabla work_orders
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'work_orders' 
AND column_name IN ('diagnostic_data', 'recommended_items', 'diagnostic_type')
ORDER BY ordinal_position;

-- Verificar si hay órdenes de trabajo con diagnostic_data
SELECT 
    id,
    status,
    stage,
    diagnostic_type,
    CASE 
        WHEN diagnostic_data IS NULL THEN 'NULL'
        ELSE 'HAS_DATA'
    END as diagnostic_data_status,
    CASE 
        WHEN recommended_items IS NULL THEN 'NULL'
        ELSE 'HAS_DATA'
    END as recommended_items_status
FROM work_orders 
WHERE diagnostic_data IS NOT NULL 
ORDER BY updated_at DESC 
LIMIT 5;

-- Verificar estructura del diagnostic_data JSON
SELECT 
    id,
    diagnostic_data,
    jsonb_pretty(diagnostic_data) as formatted_diagnostic_data
FROM work_orders 
WHERE diagnostic_data IS NOT NULL 
ORDER BY updated_at DESC 
LIMIT 3;

-- Verificar si hay customItems en el diagnostic_data
SELECT 
    id,
    jsonb_path_query_array(
        diagnostic_data, 
        '$.**.customItems[*]'
    ) as custom_items_found
FROM work_orders 
WHERE diagnostic_data IS NOT NULL 
AND jsonb_path_exists(diagnostic_data, '$.**.customItems')
ORDER BY updated_at DESC 
LIMIT 5;

-- Verificar estructura completa de una orden específica (reemplaza '0033' con el ID que quieras verificar)
SELECT 
    id,
    client_id,
    vehicle_id,
    status,
    stage,
    diagnostic_type,
    diagnostic_data,
    recommended_items,
    created_at,
    updated_at
FROM work_orders 
WHERE id = '0033';

