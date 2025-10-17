-- Script para limpiar registros duplicados en app_settings
-- Ejecutar en Supabase SQL Editor

-- 1. Ver cuántos registros hay
SELECT id, company_name, created_at, updated_at FROM app_settings ORDER BY updated_at DESC;

-- 2. Mantener solo el registro más reciente (el que se actualiza)
WITH latest_record AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY updated_at DESC) as rn
    FROM app_settings
)
DELETE FROM app_settings 
WHERE id IN (
    SELECT id FROM latest_record WHERE rn > 1
);

-- 3. Verificar que solo queda uno
SELECT COUNT(*) as total_records FROM app_settings;

-- 4. Si no hay registros, crear uno nuevo con la configuración por defecto
INSERT INTO app_settings (
    company_name, 
    company_nit, 
    company_logo_url, 
    vat_rate, 
    currency_symbol, 
    default_terms, 
    bank_info, 
    service_categories, 
    inventory_categories, 
    diagnostic_settings
) VALUES (
    'Autodealer Taller SAS',
    '900.123.456-7',
    '',
    19,
    '$',
    'El pago debe realizarse dentro de los 30 días posteriores a la fecha de la factura.',
    'Cuenta de Ahorros Bancolombia #123-456789-00 a nombre de Autodealer Taller SAS.',
    '[]'::jsonb,
    '[]'::jsonb,
    '{"basic": [], "intermediate": [], "advanced": []}'::jsonb
) ON CONFLICT DO NOTHING;




