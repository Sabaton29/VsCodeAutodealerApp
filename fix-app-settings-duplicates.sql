-- Script para arreglar duplicados en app_settings
-- Este script elimina registros duplicados y mantiene solo uno

-- Primero, verificar cuántos registros hay
SELECT COUNT(*) as total_records FROM app_settings;

-- Ver los registros duplicados
SELECT * FROM app_settings ORDER BY created_at;

-- Eliminar duplicados, manteniendo solo el más reciente
WITH ranked_settings AS (
    SELECT *,
           ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
    FROM app_settings
)
DELETE FROM app_settings 
WHERE id IN (
    SELECT id 
    FROM ranked_settings 
    WHERE rn > 1
);

-- Verificar que solo quede un registro
SELECT COUNT(*) as remaining_records FROM app_settings;

-- Si no hay registros, crear uno por defecto
INSERT INTO app_settings (
    id,
    company_info,
    billing_settings,
    operations_settings,
    created_at,
    updated_at
) VALUES (
    'default',
    '{
        "name": "Autodealer Taller SAS",
        "nit": "900.123.456-7",
        "logoUrl": "/images/company/logo.png"
    }'::jsonb,
    '{
        "vatRate": 19,
        "currencySymbol": "$",
        "defaultTerms": "El pago debe realizarse dentro de los 30 días posteriores a la fecha de la factura. Todos los trabajos están garantizados por 3 meses o 5,000 km, lo que ocurra primero.",
        "bankInfo": "Cuenta de Ahorros Bancolombia #123-456789-00 a nombre de Autodealer Taller SAS."
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
) ON CONFLICT (id) DO NOTHING;

-- Verificar el resultado final
SELECT * FROM app_settings;
