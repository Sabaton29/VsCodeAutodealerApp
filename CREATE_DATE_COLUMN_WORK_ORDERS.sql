-- Script para CREAR la columna 'date' en work_orders y poblar con datos
-- El problema: la columna 'date' no existe en la tabla work_orders

-- Paso 1: Crear la columna 'date' de tipo TIMESTAMPTZ
ALTER TABLE work_orders 
ADD COLUMN date TIMESTAMPTZ;

-- Paso 2: Poblar la columna 'date' con 'created_at' para todos los registros existentes
UPDATE work_orders 
SET date = created_at;

-- Paso 3: Hacer la columna 'date' NOT NULL después de poblar los datos
ALTER TABLE work_orders 
ALTER COLUMN date SET NOT NULL;

-- Paso 4: Verificar el resultado
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
