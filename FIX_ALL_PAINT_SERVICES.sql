-- Corregir TODOS los servicios de pintura para que sean precio fijo
-- Este script marca como precio fijo (is_hourly_rate = false) todos los servicios relacionados con pintura

-- Servicios de pintura que deben ser precio fijo:
UPDATE services 
SET is_hourly_rate = false 
WHERE name ILIKE '%pintura%' 
   OR name ILIKE '%pintar%'
   OR name ILIKE '%pulido%'
   OR name ILIKE '%pulir%'
   OR name ILIKE '%abolladura%'
   OR name ILIKE '%carrocería%'
   OR name ILIKE '%carroceria%'
   OR name ILIKE '%panel%';

-- También actualizar servicios específicos por nombre exacto:
UPDATE services 
SET is_hourly_rate = false 
WHERE name IN (
    'Reparación y Pintura de Abolladura',
    'Pintura Completa',
    'Pintura de Panel',
    'Pulido de Pintura',
    'Pintura Completa de Vehículo',
    'Reparación de Carrocería',
    'Pintura de Parachoques',
    'Pintura de Puertas',
    'Pintura de Capó',
    'Pintura de Maletero'
);

-- Servicios que SÍ deben ser por hora (mantener is_hourly_rate = true):
UPDATE services 
SET is_hourly_rate = true 
WHERE name IN (
    'Cambio de Aceite y Filtro',
    'Alineación 3D',
    'Balanceo',
    'Diagnóstico Básico',
    'Diagnóstico Avanzado',
    'Cambio de Frenos',
    'Cambio de Bujías',
    'Revisión Técnico Mecánica',
    'Mantenimiento Preventivo',
    'Cambio de Filtro de Aire',
    'Cambio de Filtro de Combustible'
);

-- Verificar los cambios realizados:
SELECT 
    id, 
    name, 
    hourly_rate, 
    duration_hours, 
    is_hourly_rate,
    CASE 
        WHEN is_hourly_rate = true THEN 'POR HORA'
        WHEN is_hourly_rate = false THEN 'PRECIO FIJO'
        ELSE 'NO DEFINIDO'
    END as tipo_precio
FROM services 
WHERE name ILIKE '%pintura%' 
   OR name ILIKE '%pulido%'
   OR name ILIKE '%abolladura%'
   OR name ILIKE '%carrocería%'
   OR name ILIKE '%carroceria%'
   OR name ILIKE '%panel%'
ORDER BY name;





