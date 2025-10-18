-- Verificar si la columna date existe y crearla si no existe
DO $$
BEGIN
    -- Verificar si la columna date existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'work_orders' 
        AND column_name = 'date'
    ) THEN
        -- Crear la columna date si no existe
        ALTER TABLE work_orders ADD COLUMN date TIMESTAMPTZ;
        
        -- Actualizar la columna date con created_at para registros existentes
        UPDATE work_orders 
        SET date = created_at 
        WHERE date IS NULL;
        
        -- Hacer la columna NOT NULL después de actualizar los datos
        ALTER TABLE work_orders ALTER COLUMN date SET NOT NULL;
        
        RAISE NOTICE 'Columna date creada y actualizada exitosamente';
    ELSE
        RAISE NOTICE 'La columna date ya existe';
    END IF;
END $$;

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
