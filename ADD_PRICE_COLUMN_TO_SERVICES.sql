-- ADD PRICE COLUMN TO SERVICES TABLE
-- Agregar columna price a la tabla services

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'services' AND column_name = 'price') THEN
        ALTER TABLE services ADD COLUMN price NUMERIC(10,2) DEFAULT 0;
        RAISE NOTICE 'Columna price añadida a la tabla services.';
    ELSE
        RAISE NOTICE 'La columna price ya existe en la tabla services.';
    END IF;
END $$;

-- Verificar que la columna fue agregada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'services' AND column_name = 'price';

