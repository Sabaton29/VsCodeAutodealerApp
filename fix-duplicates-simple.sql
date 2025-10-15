-- Script simple para arreglar duplicados en app_settings
-- Ejecutar en el SQL Editor de Supabase

-- 1. Ver cuántos registros hay
SELECT COUNT(*) as total_records FROM app_settings;

-- 2. Ver todos los registros
SELECT id, created_at, updated_at FROM app_settings ORDER BY created_at;

-- 3. Eliminar todos los registros duplicados, manteniendo solo el más reciente
WITH ranked_settings AS (
    SELECT id,
           ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
    FROM app_settings
)
DELETE FROM app_settings 
WHERE id IN (
    SELECT id 
    FROM ranked_settings 
    WHERE rn > 1
);

-- 4. Verificar que solo quede un registro
SELECT COUNT(*) as remaining_records FROM app_settings;

-- 5. Si no hay registros, crear uno por defecto
INSERT INTO app_settings (
    id,
    company_info,
    billing_settings,
    operations_settings,
    created_at,
    updated_at
) 
SELECT 'default',
       '{
           "name": "Autodealer Taller SAS",
           "nit": "900.123.456-7",
           "logoUrl": "/images/company/logo.png"
       }'::jsonb,
       '{
           "vatRate": 19,
           "currencySymbol": "$",
           "defaultTerms": "El pago debe realizarse dentro de los 30 días posteriores a la fecha de la factura.",
           "bankInfo": "Cuenta de Ahorros Bancolombia #123-456789-00"
       }'::jsonb,
       '{
           "serviceCategories": [],
           "inventoryCategories": [],
           "defaultLocationId": null,
           "autoAssignWorkOrders": false,
           "requireClientApproval": true,
           "enableNotifications": true,
           "maxWorkOrdersPerDay": 50
       }'::jsonb,
       NOW(),
       NOW()
WHERE NOT EXISTS (SELECT 1 FROM app_settings);

-- 6. Verificar el resultado final
SELECT * FROM app_settings;
