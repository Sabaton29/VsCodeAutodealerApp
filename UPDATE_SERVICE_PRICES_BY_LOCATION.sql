-- UPDATE SERVICE PRICES BY LOCATION
-- Actualizar precios de servicios basados en la sede y el precio por hora

-- Bogotá: $108,000/hr
UPDATE services 
SET 
    price = CASE 
        WHEN duration_hours = 0.5 THEN 54000  -- 30 minutos
        WHEN duration_hours = 1 THEN 108000   -- 1 hora
        WHEN duration_hours = 1.5 THEN 162000 -- 1.5 horas
        WHEN duration_hours = 2 THEN 216000   -- 2 horas
        WHEN duration_hours = 2.5 THEN 270000 -- 2.5 horas
        WHEN duration_hours = 3 THEN 324000   -- 3 horas
        WHEN duration_hours = 4 THEN 432000   -- 4 horas
        WHEN duration_hours = 5 THEN 540000   -- 5 horas
        WHEN duration_hours = 6 THEN 648000   -- 6 horas
        WHEN duration_hours = 8 THEN 864000   -- 8 horas
        ELSE duration_hours * 108000
    END
WHERE location_id = '550e8400-e29b-41d4-a716-446655440001';

-- Cali: $95,000/hr
UPDATE services 
SET 
    price = CASE 
        WHEN duration_hours = 0.5 THEN 47500  -- 30 minutos
        WHEN duration_hours = 1 THEN 95000    -- 1 hora
        WHEN duration_hours = 1.5 THEN 142500 -- 1.5 horas
        WHEN duration_hours = 2 THEN 190000   -- 2 horas
        WHEN duration_hours = 2.5 THEN 237500 -- 2.5 horas
        WHEN duration_hours = 3 THEN 285000   -- 3 horas
        WHEN duration_hours = 4 THEN 380000   -- 4 horas
        WHEN duration_hours = 5 THEN 475000   -- 5 horas
        WHEN duration_hours = 6 THEN 570000   -- 6 horas
        WHEN duration_hours = 8 THEN 760000   -- 8 horas
        ELSE duration_hours * 95000
    END
WHERE location_id = '550e8400-e29b-41d4-a716-446655440002';

-- Verificar los cambios
SELECT 
    s.name,
    s.duration_hours,
    s.price,
    l.name as location_name,
    l.hourly_rate
FROM services s
LEFT JOIN locations l ON s.location_id = l.id
ORDER BY l.name, s.name;
