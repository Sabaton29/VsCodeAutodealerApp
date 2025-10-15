-- Script para limpiar DEFINITIVAMENTE los registros duplicados en app_settings
-- Ejecutar en Supabase SQL Editor

-- 1. Primero, ver todos los registros actuales
SELECT id, company_name, created_at, updated_at FROM app_settings ORDER BY updated_at DESC;

-- 2. ELIMINAR TODOS los registros existentes
DELETE FROM app_settings;

-- 3. Verificar que están todos eliminados
SELECT COUNT(*) as remaining_records FROM app_settings;

-- 4. Crear UN SOLO registro nuevo con configuración por defecto
INSERT INTO app_settings (
    id,
    company_name, 
    company_nit, 
    company_logo_url, 
    vat_rate, 
    currency_symbol, 
    default_terms, 
    bank_info, 
    service_categories, 
    inventory_categories, 
    diagnostic_settings,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Autodealer Taller SAS',
    '900.123.456-7',
    '',
    19,
    '$',
    'El pago debe realizarse dentro de los 30 días posteriores a la fecha de la factura.',
    'Cuenta de Ahorros Bancolombia #123-456789-00 a nombre de Autodealer Taller SAS.',
    '[]'::jsonb,
    '[]'::jsonb,
    '{"basic": [], "intermediate": [], "advanced": []}'::jsonb,
    NOW(),
    NOW()
);

-- 5. Verificar que solo queda UN registro
SELECT COUNT(*) as final_count FROM app_settings;

-- 6. Ver el registro creado
SELECT id, company_name, created_at, updated_at FROM app_settings;



