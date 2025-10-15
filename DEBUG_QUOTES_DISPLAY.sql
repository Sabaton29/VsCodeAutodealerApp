-- DEBUG QUOTES DISPLAY ISSUE
-- Este script verifica por qué las cotizaciones no se muestran en la interfaz

-- 1. Verificar todas las cotizaciones en la base de datos
SELECT 
    id,
    work_order_id,
    client_id,
    client_name,
    vehicle_summary,
    issue_date,
    status,
    total,
    location_id,
    created_at,
    updated_at
FROM quotes
ORDER BY updated_at DESC
LIMIT 20;

-- 2. Verificar cotizaciones específicas para la orden 0038 (la que se creó)
SELECT 
    id,
    work_order_id,
    client_name,
    vehicle_summary,
    status,
    total,
    location_id,
    created_at,
    updated_at
FROM quotes
WHERE work_order_id = '0038'
ORDER BY created_at DESC;

-- 3. Verificar cotizaciones para la orden 0017 (la que sí funciona)
SELECT 
    id,
    work_order_id,
    client_name,
    vehicle_summary,
    status,
    total,
    location_id,
    created_at,
    updated_at
FROM quotes
WHERE work_order_id = '0017'
ORDER BY created_at DESC;

-- 4. Comparar estructura de cotizaciones que aparecen vs las que no aparecen
SELECT 
    CASE 
        WHEN work_order_id IN ('0017', 'COT-003', 'COT-004', 'COT-005', 'COT-006') THEN 'VISIBLE_IN_UI'
        ELSE 'NOT_VISIBLE'
    END as visibility_status,
    COUNT(*) as count,
    AVG(total) as avg_total,
    STRING_AGG(DISTINCT status, ', ') as statuses,
    STRING_AGG(DISTINCT location_id::text, ', ') as location_ids
FROM quotes
GROUP BY visibility_status;

-- 5. Verificar si hay diferencias en los campos de las cotizaciones
SELECT 
    'VISIBLE' as category,
    COUNT(*) as count,
    COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_count,
    COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'SENT' THEN 1 END) as sent_count,
    COUNT(CASE WHEN location_id IS NULL THEN 1 END) as null_location_count,
    COUNT(CASE WHEN total IS NULL OR total = 0 THEN 1 END) as null_total_count
FROM quotes
WHERE work_order_id IN ('0017', 'COT-003', 'COT-004', 'COT-005', 'COT-006')

UNION ALL

SELECT 
    'ALL_QUOTES' as category,
    COUNT(*) as count,
    COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_count,
    COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'SENT' THEN 1 END) as sent_count,
    COUNT(CASE WHEN location_id IS NULL THEN 1 END) as null_location_count,
    COUNT(CASE WHEN total IS NULL OR total = 0 THEN 1 END) as null_total_count
FROM quotes;

-- 6. Verificar cotizaciones más recientes
SELECT 
    id,
    work_order_id,
    client_name,
    status,
    total,
    created_at,
    updated_at,
    CASE 
        WHEN created_at >= CURRENT_DATE THEN 'TODAY'
        WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 'THIS_WEEK'
        ELSE 'OLDER'
    END as age_category
FROM quotes
ORDER BY created_at DESC
LIMIT 10;

