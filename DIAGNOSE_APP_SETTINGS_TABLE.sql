-- DIAGNÓSTICO COMPLETO DE LA TABLA app_settings
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la tabla existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'app_settings'
) as table_exists;

-- 2. Ver estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'app_settings' 
ORDER BY ordinal_position;

-- 3. Verificar RLS (Row Level Security)
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'app_settings';

-- 4. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'app_settings';

-- 5. Contar registros
SELECT COUNT(*) as total_records FROM app_settings;

-- 6. Ver los registros actuales
SELECT * FROM app_settings LIMIT 5;

-- 7. Verificar permisos del usuario actual
SELECT has_table_privilege('app_settings', 'SELECT') as can_select,
       has_table_privilege('app_settings', 'INSERT') as can_insert,
       has_table_privilege('app_settings', 'UPDATE') as can_update,
       has_table_privilege('app_settings', 'DELETE') as can_delete;
