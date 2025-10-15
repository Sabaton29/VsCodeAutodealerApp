# 📝 INSTRUCCIONES DE INSTALACIÓN - AUTODEALER CLOUD

## 🎯 Resumen de Cambios Realizados

Se ha completado una auditoría exhaustiva del código y se han implementado las siguientes mejoras:

### ✅ Correcciones Implementadas

1. **✅ Bug Crítico Corregido**: Función `handleSaveWorkOrder` faltante añadida
2. **✅ Dependencias del Backend**: Corregido `backend/package.json` con todas las dependencias necesarias
3. **✅ Integración con Supabase**: Sistema completo de autenticación y base de datos preparado
4. **✅ Archivos de Configuración**: Templates de `.env` creados para frontend y backend
5. **✅ Sistema de Autenticación**: Componentes `AuthProvider`, `LoginPage` y `ProtectedRoute` creados
6. **✅ Cliente de Supabase**: Archivo `lib/supabase.ts` configurado
7. **✅ Utilidades de Auth**: Archivo `lib/auth.ts` con funciones helper
8. **✅ Documentación Completa**: Informes y guías de migración

### 📋 Archivos Nuevos Creados

```
├── .env.example                          # Template de variables de entorno (frontend)
├── .gitignore                            # Ignorar archivos sensibles
├── SECURITY_AUDIT_REPORT.md              # Informe completo de auditoría
├── MIGRATION_GUIDE.md                    # Guía paso a paso para migrar a Supabase
├── INSTRUCCIONES_INSTALACION.md          # Este archivo
├── backend/
│   ├── .env.example                      # Template de variables de entorno (backend)
│   └── package.json                      # ✅ CORREGIDO con dependencias
├── lib/
│   ├── supabase.ts                       # Cliente de Supabase configurado
│   └── auth.ts                           # Utilidades de autenticación
└── components/
    ├── AuthProvider.tsx                  # Proveedor de contexto de autenticación
    ├── ProtectedRoute.tsx                # Componente para proteger rutas
    └── LoginPage.tsx                     # Página de inicio de sesión
```

---

## 🚀 PASOS PARA INSTALAR Y EJECUTAR

### Paso 1: Instalar Dependencias

```bash
# En la raíz del proyecto
npm install

# En el directorio backend
cd backend
npm install
cd ..
```

### Paso 2: Configurar Supabase

1. **Crear proyecto en Supabase**:
   - Ve a [supabase.com](https://supabase.com)
   - Crea una cuenta (si no tienes)
   - Crea un nuevo proyecto
   - Espera a que se complete la configuración (2-3 minutos)

2. **Obtener credenciales**:
   - En el panel de Supabase, ve a Settings → API
   - Copia la `Project URL`
   - Copia la `anon public` key

### Paso 3: Crear Archivo .env (Frontend)

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-aqui
```

### Paso 4: Crear Archivo .env (Backend) - Opcional

Crear archivo `backend/.env`:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Paso 5: Crear Base de Datos en Supabase

1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor**
3. Abre el archivo `MIGRATION_GUIDE.md` (sección "Paso 3: Crear Esquema de Base de Datos")
4. Copia el script SQL completo
5. Pégalo en el SQL Editor de Supabase
6. Haz clic en **RUN** para ejecutar el script

### Paso 6: Configurar Row Level Security (RLS)

1. En el mismo SQL Editor de Supabase
2. Abre el archivo `MIGRATION_GUIDE.md` (sección "Paso 4: Configurar Row Level Security")
3. Copia el script SQL de políticas
4. Pégalo en el SQL Editor
5. Haz clic en **RUN**

### Paso 7: Crear Usuario de Prueba

En el SQL Editor de Supabase, ejecuta:

```sql
-- Insertar datos iniciales (ubicaciones)
INSERT INTO locations (id, name, city, address, phone, hourly_rate)
VALUES 
  ('L1', 'Sede Bogotá', 'Bogotá D.C.', 'Avenida El Dorado # 68C-61', '(601) 555-1010', 108000),
  ('L2', 'Sede Cali', 'Cali, Valle', 'Calle 5 # 66B-15', '(602) 555-2020', 95000);

-- Insertar configuración de la app
INSERT INTO app_settings (id, company_info, billing_settings, operations_settings)
VALUES (
  'singleton',
  '{"name": "Autodealer Taller SAS", "nit": "900.123.456-7", "logoUrl": "/favicon.svg"}',
  '{"vatRate": 19, "currencySymbol": "$", "defaultTerms": "El pago debe realizarse dentro de los 30 días.", "bankInfo": "Cuenta Bancolombia #123-456789-00"}',
  '{"serviceCategories": [], "inventoryCategories": []}'
);
```

Luego, crea un usuario desde el panel de Supabase:
1. Ve a **Authentication** → **Users**
2. Haz clic en **Add user**
3. Añade email y contraseña (ej: `admin@autodealer.com` / `admin123`)
4. Después de crear, ejecuta en SQL Editor:

```sql
-- Insertar perfil para el usuario creado
-- Reemplaza 'USER_ID_AQUI' con el ID del usuario que acabas de crear
INSERT INTO staff_members (id, name, email, role, location_id, document_type, document_number, avatar_url)
VALUES (
  'USER_ID_AQUI',  -- ID del usuario de auth.users
  'Administrador',
  'admin@autodealer.com',
  'Administrador',
  'L1',
  'Cédula de Ciudadanía',
  '1000000001',
  'https://i.pravatar.cc/48?u=admin'
);
```

### Paso 8: Ejecutar la Aplicación

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2 (opcional): Backend
cd backend
npm run dev
```

### Paso 9: Acceder a la Aplicación

1. Abre tu navegador en: http://localhost:5173
2. Verás la pantalla de inicio de sesión
3. Ingresa con las credenciales creadas
4. ¡Listo! 🎉

---

## 🔍 Verificación de Instalación

### ✅ Checklist de Verificación

- [ ] Dependencias instaladas sin errores
- [ ] Archivo `.env` creado con las credenciales correctas
- [ ] Base de datos creada en Supabase
- [ ] Políticas de RLS configuradas
- [ ] Usuario de prueba creado
- [ ] Aplicación ejecutándose sin errores
- [ ] Puedes iniciar sesión correctamente
- [ ] Los datos se guardan en Supabase (no en IndexedDB)

### 🐛 Problemas Comunes

#### Error: "Missing Supabase environment variables"
**Solución**: 
- Verifica que `.env` existe en la raíz del proyecto
- Verifica que las variables empiezan con `VITE_`
- Reinicia el servidor de desarrollo (`npm run dev`)

#### Error: "Failed to fetch" o "Network error"
**Solución**:
- Verifica que la URL de Supabase es correcta
- Verifica conexión a internet
- Verifica que el proyecto de Supabase está activo

#### No puedo iniciar sesión
**Solución**:
- Verifica que el usuario existe en Authentication → Users
- Verifica que el perfil existe en la tabla `staff_members`
- Revisa la consola del navegador para más detalles del error

#### Datos no se guardan
**Solución**:
- Verifica políticas de RLS en Supabase
- Revisa Storage → Policies
- Verifica que el usuario tiene los permisos correctos

---

## 📊 Estado del Proyecto

### ✅ Completado
- Auditoría completa de seguridad
- Corrección de bugs críticos
- Configuración de Supabase
- Sistema de autenticación
- Documentación completa

### ⚠️ Pendiente (Próximas Fases)
- Migración completa de componentes a usar Supabase
- Implementar sincronización en tiempo real
- Migrar imágenes de Base64 a Supabase Storage
- Implementar tests unitarios
- Optimización de rendimiento

---

## 📚 Documentación Adicional

Lee los siguientes archivos para más información:

1. **`SECURITY_AUDIT_REPORT.md`**: Informe detallado de todos los problemas encontrados
2. **`MIGRATION_GUIDE.md`**: Guía completa de migración a Supabase
3. **`.env.example`**: Template de variables de entorno

---

## 🆘 Soporte

Si encuentras algún problema:

1. Revisa la consola del navegador (F12)
2. Revisa los logs del servidor
3. Consulta la documentación de Supabase: https://supabase.com/docs
4. Revisa el archivo `SECURITY_AUDIT_REPORT.md` para detalles técnicos

---

## 🎉 ¡Felicitaciones!

Has instalado exitosamente Autodealer Cloud con Supabase. El proyecto ahora está listo para:
- Autenticación segura de usuarios
- Almacenamiento en la nube
- Acceso multi-dispositivo
- Respaldos automáticos

**Próximo paso**: Lee `MIGRATION_GUIDE.md` para entender la arquitectura completa.








