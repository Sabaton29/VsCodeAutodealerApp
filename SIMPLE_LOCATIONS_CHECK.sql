-- SCRIPT SIMPLE PARA VERIFICAR Y CREAR UBICACIONES
-- Ejecutar este script en Supabase

-- 1. Verificar ubicaciones existentes
SELECT '=== UBICACIONES EXISTENTES ===' as seccion;

SELECT 
    id,
    name,
    address,
    phone,
    email,
    is_active
FROM locations
ORDER BY name;

-- 2. Contar ubicaciones
SELECT '=== CONTEO DE UBICACIONES ===' as seccion;

SELECT 
    COUNT(*) as total_ubicaciones,
    COUNT(CASE WHEN is_active = true THEN 1 END) as ubicaciones_activas
FROM locations;

-- 3. Si no hay ubicaciones, crear algunas básicas
SELECT '=== CREANDO UBICACIONES BÁSICAS ===' as seccion;

-- Solo crear si no existen ubicaciones
INSERT INTO locations (id, name, address, phone, email, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'Sede Bogotá',
    'Calle 123 #45-67, Bogotá',
    '+57 1 234-5678',
    'bogota@taller.com',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Sede Bogotá');

INSERT INTO locations (id, name, address, phone, email, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'Sede Cali',
    'Carrera 5 #23-45, Cali',
    '+57 2 345-6789',
    'cali@taller.com',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Sede Cali');

-- 4. Verificar estado final
SELECT '=== ESTADO FINAL ===' as seccion;

SELECT 
    id,
    name,
    address,
    phone,
    email,
    is_active
FROM locations
ORDER BY name;

-- 5. Mensaje de confirmación
SELECT '✅ VERIFICACIÓN COMPLETADA' as resultado;
SELECT '🔄 Ahora puedes probar crear una cuenta financiera' as instruccion;
