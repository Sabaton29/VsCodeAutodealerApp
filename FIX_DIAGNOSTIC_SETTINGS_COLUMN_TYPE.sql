-- Paso 1: Verificar el tipo actual de la columna diagnostic_settings
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'app_settings' 
AND column_name = 'diagnostic_settings';

-- Paso 2: Si la columna existe pero es de tipo text/varchar, corregirla a jsonb
-- Primero, limpiar datos no válidos si existen
UPDATE app_settings 
SET diagnostic_settings = '{"basic": [], "intermediate": [], "advanced": []}' 
WHERE diagnostic_settings IS NULL 
   OR diagnostic_settings = '' 
   OR diagnostic_settings = '[object Object]';

-- Paso 3: Cambiar el tipo de columna a jsonb
ALTER TABLE app_settings 
ALTER COLUMN diagnostic_settings 
SET DATA TYPE jsonb 
USING diagnostic_settings::jsonb;

-- Paso 4: Establecer un valor por defecto
ALTER TABLE app_settings 
ALTER COLUMN diagnostic_settings 
SET DEFAULT '{"basic": [], "intermediate": [], "advanced": []}'::jsonb;

-- Paso 5: Verificar que el cambio se aplicó correctamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'app_settings' 
AND column_name = 'diagnostic_settings';

-- Paso 6: Verificar los datos actuales en la tabla
SELECT id, diagnostic_settings FROM app_settings;




