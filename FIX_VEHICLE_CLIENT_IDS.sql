-- Script para corregir client_id en vehículos
-- Este script asigna los vehículos a clientes existentes

-- 1. Verificar estado actual
SELECT 'ESTADO ACTUAL DE VEHÍCULOS' as estado;
SELECT id, plate, make, model, client_id 
FROM vehicles 
ORDER BY plate;

-- 2. Verificar clientes disponibles
SELECT 'CLIENTES DISPONIBLES' as estado;
SELECT id, name, id_number 
FROM clients 
ORDER BY name;

-- 3. Asignar vehículos a clientes
-- Asignar RJT-190 (Peugeot 208) a un cliente
UPDATE vehicles 
SET client_id = (SELECT id FROM clients WHERE name ILIKE '%LUZ MARINA%' LIMIT 1)
WHERE plate = 'RJT-190' AND (client_id = 'undefined' OR client_id IS NULL);

-- Asignar LMS-275 (Nissan Versa) a otro cliente
UPDATE vehicles 
SET client_id = (SELECT id FROM clients WHERE name ILIKE '%camilo%' LIMIT 1)
WHERE plate = 'LMS-275' AND (client_id = 'undefined' OR client_id IS NULL);

-- Asignar MQN-984 (BMW Serie 1) a un cliente
UPDATE vehicles 
SET client_id = (SELECT id FROM clients WHERE name ILIKE '%LUZ MARINA%' LIMIT 1)
WHERE plate = 'MQN-984' AND (client_id = 'undefined' OR client_id IS NULL);

-- 4. Verificar resultado
SELECT 'ESTADO FINAL DE VEHÍCULOS' as estado;
SELECT id, plate, make, model, client_id 
FROM vehicles 
ORDER BY plate;

-- 5. Verificar que todos los vehículos tengan propietario
SELECT 'VERIFICACIÓN FINAL' as estado;
SELECT 
    v.plate,
    v.make,
    v.model,
    c.name as propietario
FROM vehicles v
LEFT JOIN clients c ON v.client_id = c.id
ORDER BY v.plate;



