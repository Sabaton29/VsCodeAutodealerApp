-- UPDATE SERVICE PRICES DYNAMIC
-- Actualizar precios de servicios dinámicamente basados en la hourly_rate de cada sede

-- Actualizar precios de servicios basados en la hourly_rate de la sede
UPDATE services s
SET 
    price = s.duration_hours * l.hourly_rate
FROM locations l
WHERE s.location_id = l.id
AND s.duration_hours IS NOT NULL 
AND s.duration_hours > 0
AND l.hourly_rate IS NOT NULL
AND l.hourly_rate > 0;

-- Verificar los cambios
SELECT 
    s.id,
    s.name,
    s.duration_hours,
    s.price,
    l.name as location_name,
    l.hourly_rate,
    ROUND(s.duration_hours * l.hourly_rate) as calculated_price
FROM services s
JOIN locations l ON s.location_id = l.id
ORDER BY l.name, s.name;

