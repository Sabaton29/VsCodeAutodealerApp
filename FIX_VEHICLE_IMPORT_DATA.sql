-- Script para corregir vehículos creados durante la importación
-- Este script asigna client_id válidos a los vehículos que tienen "undefined"

-- 1. Ver estado actual (solo los que tienen problemas)
SELECT 'VEHÍCULOS CON PROBLEMAS' as estado;
SELECT id, plate, make, model, client_id
FROM vehicles 
WHERE client_id::text = 'undefined' OR client_id IS NULL;

-- 2. Ver clientes disponibles para asignar
SELECT 'CLIENTES DISPONIBLES' as estado;
SELECT id, name, id_number 
FROM clients 
ORDER BY name;

-- 3. Corregir usando CAST para evitar el error de UUID
-- Primero, asignar RJT-190 a LUZ MARINA HERNANDEZ
UPDATE vehicles 
SET client_id = (SELECT id FROM clients WHERE name ILIKE '%LUZ MARINA%' LIMIT 1)
WHERE plate = 'RJT-190' 
AND (client_id::text = 'undefined' OR client_id IS NULL);

-- Asignar LMS-275 a camilo marroquin
UPDATE vehicles 
SET client_id = (SELECT id FROM clients WHERE name ILIKE '%camilo%' LIMIT 1)
WHERE plate = 'LMS-275' 
AND (client_id::text = 'undefined' OR client_id IS NULL);

-- Asignar MQN-984 a LUZ MARINA HERNANDEZ (o al otro cliente si prefieres)
UPDATE vehicles 
SET client_id = (SELECT id FROM clients WHERE name ILIKE '%LUZ MARINA%' LIMIT 1)
WHERE plate = 'MQN-984' 
AND (client_id::text = 'undefined' OR client_id IS NULL);

-- 4. Verificar resultado
SELECT 'RESULTADO FINAL' as estado;
SELECT 
    v.id,
    v.plate,
    v.make,
    v.model,
    v.client_id,
    c.name as propietario
FROM vehicles v
LEFT JOIN clients c ON v.client_id = c.id
ORDER BY v.plate;



