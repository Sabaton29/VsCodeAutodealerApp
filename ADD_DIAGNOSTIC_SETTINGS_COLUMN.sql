-- Script para agregar la columna diagnostic_settings a la tabla app_settings
-- Ejecutar en Supabase SQL Editor

-- Agregar la columna diagnostic_settings si no existe
ALTER TABLE app_settings 
ADD COLUMN IF NOT EXISTS diagnostic_settings JSONB NOT NULL DEFAULT '{
    "basic": [],
    "intermediate": [],
    "advanced": []
}'::jsonb;

-- Comentario para documentar la nueva columna
COMMENT ON COLUMN app_settings.diagnostic_settings IS 'Configuración de diagnósticos por niveles (básico, intermedio, avanzado)';

-- Actualizar registros existentes que no tengan diagnostic_settings
UPDATE app_settings 
SET diagnostic_settings = '{
    "basic": [],
    "intermediate": [],
    "advanced": []
}'::jsonb
WHERE diagnostic_settings IS NULL;





