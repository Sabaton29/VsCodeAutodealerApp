# Pruebas de Formularios

## Formularios a Probar

### 1. Crear Cliente
- **Ubicación**: Clientes → Crear Nuevo Cliente
- **Campos requeridos**: Nombre, Email, Teléfono, Tipo de Persona, Tipo de ID, Número de ID
- **Verificar**: Que se guarde correctamente y aparezca en el listado

### 2. Crear Vehículo
- **Ubicación**: Vehículos → Crear Nuevo Vehículo
- **Campos requeridos**: Cliente, Marca, Modelo, Placa, Año
- **Verificar**: Que se guarde correctamente y aparezca en el listado

### 3. Crear Artículo de Inventario
- **Ubicación**: Inventario → Crear Nuevo Artículo
- **Campos requeridos**: Nombre, SKU, Marca, Categoría, Stock, Precio de Costo, Precio de Venta
- **Verificar**: Que se guarde correctamente y aparezca en el listado

### 4. Crear Proveedor
- **Ubicación**: Proveedores → Crear Nuevo Proveedor
- **Campos requeridos**: Nombre, NIT, Persona de Contacto, Teléfono, Email, Categoría
- **Verificar**: Que se guarde correctamente y aparezca en el listado

### 5. Crear Servicio
- **Ubicación**: Catálogo de Servicios → Crear Nuevo Servicio
- **Campos requeridos**: Nombre, Categoría, Duración en Horas
- **Verificar**: Que se guarde correctamente y aparezca en el listado

### 6. Crear Orden de Trabajo
- **Ubicación**: Órdenes de Trabajo → Crear Nueva Orden
- **Campos requeridos**: Cliente, Vehículo, Servicio Solicitado
- **Verificar**: Que el dropdown de clientes se llene correctamente

### 7. Crear Cita
- **Ubicación**: Citas → Crear Nueva Cita
- **Campos requeridos**: Cliente, Vehículo, Fecha, Hora, Servicio Solicitado
- **Verificar**: Que el dropdown de clientes se llene correctamente

## Problemas a Verificar

### 1. Dropdown de Clientes Vacío
- **Síntoma**: El dropdown de clientes está vacío en crear orden de trabajo y citas
- **Causa posible**: Filtrado por `locationId` incorrecto
- **Solución**: Verificar que los clientes tengan `locationId` válido

### 2. Error de UUID Inválido en Inventario
- **Síntoma**: Error al crear artículos de inventario
- **Causa**: `supplierId` vacío enviado como UUID
- **Solución**: Cambiar inicialización a `undefined`

### 3. Datos No Se Guardan
- **Síntoma**: Los formularios no guardan datos
- **Causa posible**: Problemas de conexión con Supabase
- **Solución**: Verificar conexión y logs de consola

## Pasos de Diagnóstico

1. **Verificar consola del navegador** para errores JavaScript
2. **Verificar logs de Supabase** para errores de base de datos
3. **Verificar datos en Supabase** usando los scripts SQL
4. **Probar cada formulario** individualmente
5. **Verificar dropdowns** se llenen correctamente



