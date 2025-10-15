-- Script de diagnóstico para entender el problema de client_id en vehículos

-- 1. Ver la estructura de la tabla vehicles
SELECT 'ESTRUCTURA DE LA TABLA VEHICLES' as estado;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'vehicles' 
AND column_name = 'client_id';

-- 2. Ver todos los vehículos con sus client_id exactos
SELECT 'VEHÍCULOS Y SUS CLIENT_ID' as estado;
SELECT 
    id,
    plate, 
    make,
    model,
    client_id,
    CASE 
        WHEN client_id IS NULL THEN 'NULL'
        ELSE client_id::text
    END as client_id_text
FROM vehicles 
ORDER BY plate;

-- 3. Ver qué clientes existen
SELECT 'CLIENTES EXISTENTES' as estado;
SELECT id, name, id_number, created_at 
FROM clients 
ORDER BY created_at;

-- 4. Verificar si hay vehículos con client_id inválido
SELECT 'VEHÍCULOS CON CLIENT_ID INVÁLIDO' as estado;
SELECT id, plate, make, model, client_id
FROM vehicles 
WHERE client_id IS NOT NULL 
AND client_id::text NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

-- 5. Ver el vehículo que SÍ tiene cliente válido
SELECT 'VEHÍCULO CON CLIENTE VÁLIDO' as estado;
SELECT 
    v.id,
    v.plate,
    v.make,
    v.model,
    v.client_id,
    c.name as cliente_nombre
FROM vehicles v
JOIN clients c ON v.client_id = c.id
WHERE v.client_id IS NOT NULL;



