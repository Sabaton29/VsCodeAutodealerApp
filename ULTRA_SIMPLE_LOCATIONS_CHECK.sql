-- SCRIPT ULTRA SIMPLE PARA VERIFICAR UBICACIONES
-- Ejecutar este script en Supabase

-- 1. Verificar estructura de la tabla locations
SELECT '=== ESTRUCTURA DE LA TABLA LOCATIONS ===' as seccion;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'locations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar datos existentes (solo las columnas básicas)
SELECT '=== DATOS EXISTENTES ===' as seccion;

SELECT 
    id,
    name
FROM locations
ORDER BY name;

-- 3. Contar ubicaciones
SELECT '=== CONTEO DE UBICACIONES ===' as seccion;

SELECT 
    COUNT(*) as total_ubicaciones
FROM locations;

-- 4. Si no hay ubicaciones, crear algunas básicas
SELECT '=== CREANDO UBICACIONES BÁSICAS ===' as seccion;

-- Solo crear si no existen ubicaciones
INSERT INTO locations (id, name)
SELECT 
    gen_random_uuid(),
    'Sede Bogotá'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Sede Bogotá');

INSERT INTO locations (id, name)
SELECT 
    gen_random_uuid(),
    'Sede Cali'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Sede Cali');

-- 5. Verificar estado final
SELECT '=== ESTADO FINAL ===' as seccion;

SELECT 
    id,
    name
FROM locations
ORDER BY name;

-- 6. Mensaje de confirmación
SELECT '✅ VERIFICACIÓN COMPLETADA' as resultado;
SELECT '🔄 Ahora puedes probar crear una cuenta financiera' as instruccion;
