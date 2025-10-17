-- Verificar el tipo de dato de la columna diagnostic_settings
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'app_settings' 
AND column_name = 'diagnostic_settings';




