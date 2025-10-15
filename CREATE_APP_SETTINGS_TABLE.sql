-- Script para crear la tabla app_settings con la estructura correcta
-- Ejecutar en Supabase SQL Editor

-- Crear la tabla app_settings si no existe
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_info JSONB NOT NULL DEFAULT '{}',
    billing_settings JSONB NOT NULL DEFAULT '{}',
    operations_settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir lectura y escritura a usuarios autenticados
CREATE POLICY "Allow authenticated users to manage app settings" ON app_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar configuración por defecto si no existe
INSERT INTO app_settings (id, company_info, billing_settings, operations_settings)
VALUES (
    'default',
    '{
        "name": "Autodealer Taller SAS",
        "nit": "900.123.456-7",
        "logoUrl": ""
    }'::jsonb,
    '{
        "currency": "COP",
        "taxRate": 19,
        "invoicePrefix": "FAC",
        "quotePrefix": "COT",
        "paymentTerms": "NET_30"
    }'::jsonb,
    '{
        "serviceCategories": [],
        "inventoryCategories": []
    }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Comentarios para documentar la tabla
COMMENT ON TABLE app_settings IS 'Configuración global de la aplicación';
COMMENT ON COLUMN app_settings.company_info IS 'Información de la empresa (nombre, NIT, logo)';
COMMENT ON COLUMN app_settings.billing_settings IS 'Configuración de facturación y cotizaciones';
COMMENT ON COLUMN app_settings.operations_settings IS 'Configuración de operaciones (categorías, etc.)';

