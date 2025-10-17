-- SCRIPT FINAL PARA ELIMINAR DUPLICADOS EN app_settings
-- Ejecutar en Supabase SQL Editor

-- 1. Ver cuántos registros hay actualmente
SELECT COUNT(*) as total_records FROM app_settings;

-- 2. Ver todos los registros actuales
SELECT id, company_name, created_at, updated_at 
FROM app_settings 
ORDER BY created_at DESC;

-- 3. ELIMINAR TODOS los registros existentes
DELETE FROM app_settings;

-- 4. Verificar que están todos eliminados
SELECT COUNT(*) as remaining_records FROM app_settings;

-- 5. Crear UN SOLO registro nuevo con configuración por defecto
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
    gen_random_uuid(), -- Generar un nuevo UUID
    'Autodealer Cloud',
    '900123456-7',
    '/images/company/Logo.png',
    '{"address": "Calle Falsa 123", "phone": "555-1234", "email": "info@autodealer.com"}',
    '{"currency": "USD", "taxRate": 0.19}',
    '{"serviceCategories": ["Mecánica General", "Eléctrico", "Pintura"], "inventoryCategories": ["Filtros", "Aceites", "Llantas"]}',
    '{"basic": [], "intermediate": [], "advanced": []}',
    NOW(),
    NOW()
);

-- 6. Verificar que solo queda UN registro
SELECT COUNT(*) as final_count FROM app_settings;

-- 7. Ver el registro creado
SELECT id, company_name, created_at, updated_at FROM app_settings;

