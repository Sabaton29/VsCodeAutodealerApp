-- Script para crear el bucket de logos de empresa en Supabase Storage
-- Ejecutar en Supabase SQL Editor

-- Crear el bucket para logos de empresa
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true);

-- Crear política para permitir lectura pública del bucket
CREATE POLICY "Allow public read access to company logos" ON storage.objects
    FOR SELECT USING (bucket_id = 'company-logos');

-- Crear política para permitir subida de archivos a usuarios autenticados
CREATE POLICY "Allow authenticated users to upload company logos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'company-logos' 
        AND auth.role() = 'authenticated'
    );

-- Crear política para permitir actualización de archivos a usuarios autenticados
CREATE POLICY "Allow authenticated users to update company logos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'company-logos' 
        AND auth.role() = 'authenticated'
    );

-- Crear política para permitir eliminación de archivos a usuarios autenticados
CREATE POLICY "Allow authenticated users to delete company logos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'company-logos' 
        AND auth.role() = 'authenticated'
    );

-- Comentario para documentar el bucket
COMMENT ON BUCKET company-logos IS 'Bucket para almacenar logos de empresa y archivos corporativos';

