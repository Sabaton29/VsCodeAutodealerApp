-- Verificar estructura de la tabla app_settings
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'app_settings' 
ORDER BY ordinal_position;

-- Verificar si la tabla existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'app_settings'
) as table_exists;

-- Verificar registros en app_settings
SELECT COUNT(*) as total_records FROM app_settings;

-- Verificar permisos RLS
SELECT schemaname, tablename, rowsecurity, forcerowsecurity 
FROM pg_tables 
WHERE tablename = 'app_settings';

