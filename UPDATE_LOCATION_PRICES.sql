-- UPDATE LOCATION PRICES
-- Actualizar precios por hora de las sedes

UPDATE locations 
SET hourly_rate = 108000
WHERE id = '550e8400-e29b-41d4-a716-446655440001' 
   OR name = 'Sede Bogotá';

UPDATE locations 
SET hourly_rate = 95000
WHERE id = '550e8400-e29b-41d4-a716-446655440002' 
   OR name = 'Sede Cali';

-- Verificar los cambios
SELECT id, name, city, hourly_rate 
FROM locations 
ORDER BY name;

