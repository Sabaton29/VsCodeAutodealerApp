-- SCRIPT PARA CORREGIR LAS POLÍTICAS RLS DE FINANCIAL_ACCOUNTS
-- Ejecutar este script en Supabase

-- 1. Verificar políticas RLS existentes
SELECT '=== POLÍTICAS RLS EXISTENTES ===' as seccion;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'financial_accounts'
ORDER BY policyname;

-- 2. Eliminar políticas existentes problemáticas
SELECT '=== ELIMINANDO POLÍTICAS PROBLEMÁTICAS ===' as seccion;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.financial_accounts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.financial_accounts;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.financial_accounts;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.financial_accounts;

-- 3. Crear nuevas políticas RLS más permisivas
SELECT '=== CREANDO NUEVAS POLÍTICAS RLS ===' as seccion;

-- Política para lectura (todos los usuarios autenticados)
CREATE POLICY "Enable read access for authenticated users" 
ON public.financial_accounts 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Política para inserción (todos los usuarios autenticados)
CREATE POLICY "Enable insert for authenticated users" 
ON public.financial_accounts 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Política para actualización (todos los usuarios autenticados)
CREATE POLICY "Enable update for authenticated users" 
ON public.financial_accounts 
FOR UPDATE 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Política para eliminación (todos los usuarios autenticados)
CREATE POLICY "Enable delete for authenticated users" 
ON public.financial_accounts 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- 4. Verificar que RLS esté habilitado
SELECT '=== VERIFICANDO RLS ===' as seccion;

SELECT 
    schemaname,
    tablename,
    rowsecurity,
    hasrules
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'financial_accounts';

-- 5. Verificar nuevas políticas
SELECT '=== NUEVAS POLÍTICAS CREADAS ===' as seccion;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'financial_accounts'
ORDER BY policyname;

-- 6. Mensaje de confirmación
SELECT '✅ POLÍTICAS RLS CORREGIDAS' as resultado;
SELECT '🔄 Ahora puedes probar crear una cuenta financiera' as instruccion;
