-- Verificar buckets de storage existentes
SELECT 
    name,
    id,
    public,
    created_at,
    updated_at,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY created_at DESC;
