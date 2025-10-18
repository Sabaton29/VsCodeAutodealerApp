-- Script para corregir las fechas de las órdenes de trabajo
-- Este script actualiza el campo 'date' con 'created_at' si 'date' es NULL

UPDATE work_orders 
SET date = created_at 
WHERE date IS NULL OR date = '';

-- Verificar el resultado
SELECT 
    id, 
    date, 
    created_at,
    CASE 
        WHEN date IS NULL THEN 'SIN FECHA'
        WHEN date = '' THEN 'FECHA VACÍA'
        ELSE 'CON FECHA'
    END as status_fecha
FROM work_orders 
ORDER BY created_at DESC 
LIMIT 10;
