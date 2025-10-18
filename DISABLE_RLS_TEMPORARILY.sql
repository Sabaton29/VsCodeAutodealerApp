-- SCRIPT PARA DESHABILITAR RLS TEMPORALMENTE (SOLO PARA TESTING)
-- ⚠️ ADVERTENCIA: Solo usar para testing, no en producción
-- Ejecutar este script en Supabase

-- 1. Deshabilitar RLS temporalmente
SELECT '=== DESHABILITANDO RLS TEMPORALMENTE ===' as seccion;

ALTER TABLE public.financial_accounts DISABLE ROW LEVEL SECURITY;

-- 2. Verificar que RLS esté deshabilitado
SELECT '=== VERIFICANDO RLS DESHABILITADO ===' as seccion;

SELECT 
    schemaname,
    tablename,
    rowsecurity,
    hasrules
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'financial_accounts';

-- 3. Mensaje de confirmación
SELECT '⚠️ RLS DESHABILITADO TEMPORALMENTE' as resultado;
SELECT '🔄 Ahora puedes probar crear una cuenta financiera' as instruccion;
SELECT '⚠️ RECUERDA: Rehabilitar RLS después del testing' as advertencia;
