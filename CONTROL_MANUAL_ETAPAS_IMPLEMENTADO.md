# Control Manual de Etapas - Implementado

## 📋 Resumen

Se ha implementado el control manual de etapas para administradores, permitiendo **avanzar** y **retroceder** etapas de órdenes de trabajo sin restricciones, eliminando la necesidad de botones adicionales de diagnóstico o corrección masiva.

---

## ✅ Cambios Implementados

### 1. **WorkOrderActions.tsx**
- ✅ Añadido prop `onRetreatStage?: () => void`
- ✅ Añadido botón **"Retroceder a [etapa anterior]"** con ícono chevron-left
- ✅ Lógica de permisos actualizada:
  - **Administradores** (`advance:work_order_stage`): Pueden avanzar/retroceder en **TODAS** las etapas
  - **No administradores**: Solo pueden avanzar en etapas específicas (`EN_REPARACION`, `CONTROL_CALIDAD`)
- ✅ Botón de retroceso solo visible para administradores
- ✅ No se puede retroceder desde la primera etapa (`RECEPCION`)

### 2. **DataContext.tsx**
- ✅ Añadida función `handleRetreatStage(workOrderId: string, currentStage: KanbanStage)`
- ✅ Lógica simétrica a `handleAdvanceStage`:
  - Verifica que no esté en la primera etapa
  - Actualiza la etapa en Supabase
  - Actualiza el estado local
  - Añade entrada al historial con nota: `"Etapa retrocedida manualmente de X a Y"`
- ✅ Función exportada en el contexto

### 3. **types.ts**
- ✅ Añadido `handleRetreatStage` al tipo `DataContextType`

### 4. **ActiveWorkOrdersTable.tsx**
- ✅ Añadido prop `onRetreatStage` a la interfaz principal
- ✅ Añadido prop a `WorkOrderRowProps` (componente interno)
- ✅ Pasado prop a todas las instancias de `WorkOrderActions` (activas y entregadas)

### 5. **WorkOrderList.tsx**
- ✅ Añadido prop `onRetreatStage` a la interfaz principal
- ✅ Añadido prop a `WorkOrderRow` (componente interno)
- ✅ Pasado prop a `WorkOrderActions`

### 6. **Dashboard.tsx**
- ✅ Añadido prop `handleRetreatStage` a la interfaz
- ✅ Extraído del destructuring
- ✅ Pasado a `WorkOrderList`

### 7. **App.tsx**
- ✅ Conectado `handleRetreatStage={data.handleRetreatStage}` al componente `Dashboard`

---

## 🎨 UI/UX

### Botones en el Menú de Acciones

**Botón de Avanzar Etapa** (Rojo):
```
🔷 Avanzar a "En Reparación"
```
- Color: Rojo (`bg-brand-red`)
- Visible para: Administradores en todas las etapas, o usuarios con permiso en etapas específicas
- Deshabilitado si es la última etapa

**Botón de Retroceder Etapa** (Naranja):
```
🔶 Retroceder a "Recepción"
```
- Color: Naranja (`bg-orange-600`)
- Visible para: **Solo administradores**
- Deshabilitado si es la primera etapa (`RECEPCION`)

---

## 🔐 Permisos

### Administrador (`advance:work_order_stage`)
- ✅ Puede **avanzar** cualquier orden a la siguiente etapa
- ✅ Puede **retroceder** cualquier orden a la etapa anterior
- ✅ Botones visibles en **todas las etapas** (excepto límites)

### Usuario Regular
- ✅ Puede **avanzar** solo desde `EN_REPARACION` o `CONTROL_CALIDAD`
- ❌ **NO** puede retroceder etapas

---

## 📊 Flujo de Trabajo

### Ejemplo de Uso por Administrador

1. **Orden en "Espera Aprobación"** con cotización enviada incorrectamente
   - Administrador selecciona: **"Retroceder a Pendiente Cotización"**
   - Sistema actualiza etapa y registra en historial
   
2. **Orden en "Pendiente Cotización"** lista para enviar
   - Administrador selecciona: **"Avanzar a Espera Aprobación"**
   - Sistema actualiza etapa y registra en historial

3. **Historial de Orden**
   ```
   2025-10-13 22:45 - Sistema: Etapa retrocedida manualmente de Espera Aprobación a Pendiente Cotización
   2025-10-13 22:50 - Sistema: Etapa avanzada manualmente de Pendiente Cotización a Espera Aprobación
   ```

---

## 🧪 Testing Manual

### Para Probar:

1. **Iniciar sesión como administrador**
2. **Navegar a una orden de trabajo** (cualquier etapa)
3. **Abrir menú de acciones** (⋮)
4. **Verificar botones visibles:**
   - ✅ "Avanzar a [siguiente etapa]" (si no es última)
   - ✅ "Retroceder a [etapa anterior]" (si no es primera)
5. **Hacer clic en retroceder**
6. **Verificar:**
   - Etapa de la orden cambió
   - Historial tiene entrada nueva
   - Kanban se actualizó

---

## 🎯 Beneficios

1. ✅ **Control total** para administradores sobre el flujo de etapas
2. ✅ **Sin dependencias** de correcciones automáticas fallidas
3. ✅ **Historial completo** de cambios manuales
4. ✅ **UI limpia** sin botones adicionales en configuración
5. ✅ **Seguridad** mantenida con sistema de permisos

---

## 📝 Próximos Pasos

1. ✅ **Implementación completada**
2. 🧪 **Testing del usuario** para verificar el flujo
3. 📊 **Monitorear historial** de cambios manuales
4. 🔍 **Revisar vínculos rotos** (problema identificado en diagnóstico anterior)

---

**Fecha de Implementación:** 13 de Octubre, 2025
**Estado:** ✅ Completado y listo para testing






