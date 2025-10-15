-- Agregar campo is_hourly_rate a la tabla services
-- Este campo determina si el precio es por hora (true) o precio fijo (false)

ALTER TABLE services 
ADD COLUMN is_hourly_rate BOOLEAN DEFAULT true;

-- Actualizar servicios existentes
-- Servicios que son precio fijo (no por hora):
UPDATE services 
SET is_hourly_rate = false 
WHERE name IN (
    'Reparación y Pintura de Abolladura',
    'Pintura Completa de Vehículo',
    'Reparación de Motor',
    'Cambio de Transmisión'
    -- Agregar más servicios que tengan precio fijo
);

-- Servicios que son por hora (mantener true):
UPDATE services 
SET is_hourly_rate = true 
WHERE name IN (
    'Cambio de Aceite y Filtro',
    'Alineación 3D',
    'Balanceo',
    'Diagnóstico Básico',
    'Diagnóstico Avanzado'
    -- Agregar más servicios que sean por hora
);

-- Verificar los cambios
SELECT id, name, hourly_rate, duration_hours, is_hourly_rate 
FROM services 
ORDER BY name;




