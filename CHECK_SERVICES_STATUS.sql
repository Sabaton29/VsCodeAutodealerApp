-- Verificar el estado actual de todos los servicios
SELECT 
    id, 
    name, 
    category,
    hourly_rate, 
    duration_hours, 
    is_hourly_rate,
    CASE 
        WHEN is_hourly_rate = true THEN 'POR HORA'
        WHEN is_hourly_rate = false THEN 'PRECIO FIJO'
        ELSE 'NO DEFINIDO'
    END as tipo_precio
FROM services 
ORDER BY name;

-- Contar servicios por tipo:
SELECT 
    CASE 
        WHEN is_hourly_rate = true THEN 'POR HORA'
        WHEN is_hourly_rate = false THEN 'PRECIO FIJO'
        ELSE 'NO DEFINIDO'
    END as tipo_precio,
    COUNT(*) as cantidad
FROM services 
GROUP BY is_hourly_rate
ORDER BY is_hourly_rate;





