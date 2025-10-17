-- Script FINAL para limpiar app_settings
-- Ejecutar en Supabase SQL Editor

-- 1. Ver cuántos registros hay actualmente
SELECT COUNT(*) as total_records FROM app_settings;

-- 2. Ver todos los registros
SELECT id, company_name, created_at, updated_at FROM app_settings ORDER BY created_at;

-- 3. ELIMINAR TODOS los registros duplicados
DELETE FROM app_settings;

-- 4. Verificar que están todos eliminados
SELECT COUNT(*) as remaining_records FROM app_settings;

-- 5. Crear UN SOLO registro con configuración por defecto
INSERT INTO app_settings (
    id,
    company_name, 
    company_nit, 
    company_logo_url,
    company_info,
    billing_settings,
    operations_settings,
    diagnostic_settings,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Autodealer Cloud',
    '123456789-0',
    '',
    '{"name": "Autodealer Cloud", "address": "", "phone": "", "email": ""}'::jsonb,
    '{"currency": "COP", "taxRate": 0.19, "invoicePrefix": "FAC"}'::jsonb,
    '{"serviceCategories": ["Mantenimiento", "Reparación", "Diagnóstico"], "inventoryCategories": ["Repuestos", "Lubricantes", "Filtros"]}'::jsonb,
    '{"basic": [], "intermediate": [], "advanced": []}'::jsonb,
    NOW(),
    NOW()
);

-- 6. Verificar que solo queda UN registro
SELECT COUNT(*) as final_count FROM app_settings;

-- 7. Ver el registro creado
SELECT id, company_name, created_at, updated_at FROM app_settings;

