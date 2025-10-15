-- DEBUG DIAGNOSTIC DATA FOR WORK ORDER 0033
-- ============================================

-- Verificar el diagnostic_data completo para la orden 0033
SELECT 
    id,
    status,
    stage,
    diagnostic_type,
    jsonb_pretty(diagnostic_data) as formatted_diagnostic_data
FROM work_orders 
WHERE id = '0033';

-- Verificar si hay customItems en el diagnostic_data
SELECT 
    id,
    jsonb_path_query_array(
        diagnostic_data, 
        '$.**.customItems[*]'
    ) as custom_items_found
FROM work_orders 
WHERE id = '0033';

-- Verificar estructura específica de una sección
SELECT 
    id,
    diagnostic_data->'Sistema de Luces - Eléctrico' as luces_section,
    diagnostic_data->'Sistema de Luces - Eléctrico'->'customItems' as custom_items_in_luces
FROM work_orders 
WHERE id = '0033';

-- Verificar si hay algún customItems en cualquier sección
SELECT 
    id,
    key as section_name,
    value->'customItems' as custom_items
FROM work_orders,
LATERAL jsonb_each(diagnostic_data)
WHERE id = '0033' 
AND value ? 'customItems'
AND jsonb_array_length(value->'customItems') > 0;

