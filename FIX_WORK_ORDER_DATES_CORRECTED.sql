-- Script CORREGIDO para arreglar las fechas de las órdenes de trabajo
-- El problema: la columna 'date' contiene cadenas vacías ('') que no son válidas para TIMESTAMPTZ

-- Paso 1: Convertir cadenas vacías a NULL en la columna 'date'
-- Esto es necesario porque una columna TIMESTAMPTZ no puede contener cadenas vacías
UPDATE work_orders 
SET date = NULL 
WHERE date::text = '';  -- Casteamos a texto para poder comparar con cadena vacía

-- Paso 2: Actualizar la columna 'date' con 'created_at' donde 'date' sea NULL
UPDATE work_orders 
SET date = created_at 
WHERE date IS NULL;

-- Paso 3: Verificar el resultado
-- Ya no necesitamos verificar por cadena vacía, solo por NULL o CON FECHA
SELECT 
    id, 
    date, 
    created_at,
    CASE 
        WHEN date IS NULL THEN 'SIN FECHA'
        ELSE 'CON FECHA'
    END as status_fecha
FROM work_orders 
ORDER BY created_at DESC 
LIMIT 10;
