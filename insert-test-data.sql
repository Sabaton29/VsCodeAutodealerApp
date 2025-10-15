-- Script para insertar datos de prueba si es necesario

-- 1. Insertar ubicaciones si no existen
INSERT INTO locations (id, name, city, address, phone, hourly_rate)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Sede Bogotá', 'Bogotá D.C.', 'Avenida El Dorado # 68C-61', '(601) 555-1010', 108000),
    ('550e8400-e29b-41d4-a716-446655440002', 'Sede Cali', 'Cali, Valle', 'Calle 5 # 66B-15', '(602) 555-2020', 95000)
ON CONFLICT (id) DO NOTHING;

-- 2. Insertar clientes de prueba si no existen
INSERT INTO clients (id, name, email, phone, vehicle_count, registration_date, location_id, person_type, id_type, id_number)
VALUES 
    ('C1', 'Juan Pérez', 'juan.perez@email.com', '3001234567', 2, '2023-01-15', '550e8400-e29b-41d4-a716-446655440001', 'Persona Natural', 'Cédula de Ciudadanía', '12345678'),
    ('C2', 'Ana Gómez', 'ana.gomez@email.com', '3109876543', 1, '2023-03-22', '550e8400-e29b-41d4-a716-446655440002', 'Persona Natural', 'Cédula de Ciudadanía', '87654321'),
    ('C3', 'Carlos Ruiz', 'carlos.ruiz@email.com', '3215558899', 3, '2023-05-10', '550e8400-e29b-41d4-a716-446655440001', 'Persona Natural', 'Cédula de Ciudadanía', '11223344')
ON CONFLICT (id) DO NOTHING;

-- 3. Insertar vehículos de prueba si no existen
INSERT INTO vehicles (id, client_id, make, model, plate, year, color)
VALUES 
    ('V1', 'C1', 'Chevrolet', 'Spark GT', 'ABC-123', 2020, 'Rojo'),
    ('V2', 'C2', 'Renault', 'Duster', 'DEF-456', 2021, 'Gris'),
    ('V3', 'C3', 'Mazda', '3', 'GHI-789', 2023, 'Blanco')
ON CONFLICT (id) DO NOTHING;

-- 4. Insertar proveedores de prueba si no existen
INSERT INTO suppliers (id, name, nit, contact_person, phone, email, category, location_id, has_credit)
VALUES 
    ('SUP-001', 'Autopartes El Motor S.A.S', '900.123.456-1', 'Carlos Ramirez', '3101112233', 'ventas@elmotor.com', 'Repuestos y Motor', '550e8400-e29b-41d4-a716-446655440001', true),
    ('SUP-002', 'Importadora de Llantas del Pacífico', '800.987.654-2', 'Lucia Mendoza', '3204445566', 'contacto@llantaspacifico.com', 'Llantas', '550e8400-e29b-41d4-a716-446655440002', false),
    ('SUP-003', 'Lubricantes y Filtros de Colombia', '901.555.888-3', 'Sofia Giraldo', '3007778899', 'pedidos@lubrifiltros.co', 'Aceites y Filtros', '550e8400-e29b-41d4-a716-446655440001', true)
ON CONFLICT (id) DO NOTHING;



