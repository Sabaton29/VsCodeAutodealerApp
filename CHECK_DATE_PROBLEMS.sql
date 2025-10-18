-- Verificar qué tipos de datos problemáticos tenemos en la columna 'date'
SELECT 
    id,
    date,
    date::text as date_as_text,  -- Ver el valor como texto
    created_at,
    CASE 
        WHEN date IS NULL THEN 'NULL'
        WHEN date::text = '' THEN 'CADENA VACÍA'
        ELSE 'FECHA VÁLIDA'
    END as tipo_dato
FROM work_orders 
ORDER BY created_at DESC 
LIMIT 10;
