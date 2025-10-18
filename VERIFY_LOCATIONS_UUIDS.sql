-- SCRIPT PARA VERIFICAR QUE LAS UBICACIONES TIENEN UUIDs VÁLIDOS
-- Ejecutar este script en Supabase para verificar el formato de los IDs

-- 1. Verificar formato de UUIDs en locations
SELECT '=== VERIFICACIÓN DE UBICACIONES ===' as seccion;

SELECT 
    id,
    name,
    CASE 
        WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN '✅ UUID VÁLIDO' 
        ELSE '❌ UUID INVÁLIDO' 
    END as uuid_status,
    LENGTH(id::text) as id_length
FROM locations
ORDER BY name;

-- 2. Verificar si hay ubicaciones con IDs como 'L1', 'L2', etc.
SELECT '=== UBICACIONES CON IDs INVÁLIDOS ===' as seccion;

SELECT 
    id,
    name,
    'ID NO ES UUID' as problema
FROM locations
WHERE id::text NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

-- 3. Si hay ubicaciones con IDs inválidos, crear nuevas con UUIDs válidos
SELECT '=== CREANDO UBICACIONES CON UUIDs VÁLIDOS ===' as seccion;

-- Eliminar ubicaciones con IDs inválidos si existen
-- Primero verificar si existen ubicaciones con IDs no-UUID
DELETE FROM locations WHERE id::text IN ('L1', 'L2', 'L3', 'L4', 'L5');

-- Crear ubicaciones con UUIDs válidos
INSERT INTO locations (id, name, address, phone, email, is_active, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'Sede Bogotá', 'Calle 123 #45-67, Bogotá', '+57 1 234-5678', 'bogota@taller.com', true, NOW(), NOW()),
    (gen_random_uuid(), 'Sede Cali', 'Carrera 5 #23-45, Cali', '+57 2 345-6789', 'cali@taller.com', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 4. Verificar estado final
SELECT '=== ESTADO FINAL ===' as seccion;

SELECT 
    id,
    name,
    CASE 
        WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN '✅ UUID VÁLIDO' 
        ELSE '❌ UUID INVÁLIDO' 
    END as uuid_status
FROM locations
ORDER BY name;

-- 5. Mensaje de confirmación
SELECT '✅ VERIFICACIÓN COMPLETADA' as resultado;
SELECT '🔄 Recarga la página para probar la creación de cuentas financieras' as instruccion;
