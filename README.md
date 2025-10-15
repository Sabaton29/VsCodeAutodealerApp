# 🚗 Autodealer Cloud - Sistema de Gestión de Taller Automotriz

Sistema integral de gestión para talleres automotrices construido con React, TypeScript y Supabase.

## 🌟 Características Principales

- ✅ **Gestión de Órdenes de Trabajo** - Sistema Kanban completo
- ✅ **Control de Inventario** - Gestión de repuestos y artículos
- ✅ **Facturación** - Generación de cotizaciones y facturas
- ✅ **Gestión de Personal** - Control de asistencia y nómina
- ✅ **Reportes Financieros** - Análisis de rentabilidad
- ✅ **Portal de Cliente** - Seguimiento en tiempo real
- ✅ **Multi-Sede** - Soporte para múltiples ubicaciones
- ✅ **Sistema de Permisos** - Control de acceso por rol

## 🔧 Tecnologías

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Almacenamiento Local**: IndexedDB (para modo offline)
- **Estilos**: TailwindCSS
- **Autenticación**: Supabase Auth con Row Level Security

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- npm o yarn
- Cuenta de Supabase (gratis en [supabase.com](https://supabase.com))

## 🚀 Instalación Rápida

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd autodealer-cloud
```

### 2. Instalar dependencias

```bash
npm install
cd backend
npm install
cd ..
```

### 3. Configurar Supabase

Crea un archivo `.env` en la raíz:

```env
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```

### 4. Inicializar base de datos

Sigue las instrucciones detalladas en [`MIGRATION_GUIDE.md`](MIGRATION_GUIDE.md)

### 5. Ejecutar aplicación

```bash
npm run dev
```

Accede a: http://localhost:5173

## 📖 Documentación Completa

- 📄 **[INSTRUCCIONES_INSTALACION.md](INSTRUCCIONES_INSTALACION.md)** - Guía paso a paso de instalación
- 📄 **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Migración completa a Supabase
- 📄 **[SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md)** - Auditoría de seguridad

## 🔒 Seguridad

Este proyecto implementa:
- ✅ Autenticación con Supabase Auth
- ✅ Row Level Security (RLS) en PostgreSQL
- ✅ Validación de tokens para portal de cliente
- ✅ Sistema de permisos por rol
- ✅ Protección de rutas en frontend
- ✅ Variables de entorno para credenciales

⚠️ **IMPORTANTE**: Nunca subas el archivo `.env` al repositorio.

## 👥 Roles de Usuario

- **Administrador** - Acceso total al sistema
- **Jefe de Taller** - Gestión de operaciones y personal
- **Asesor de Servicio** - Atención al cliente y cotizaciones
- **Mecánico** - Acceso a órdenes de trabajo asignadas
- **Almacén** - Gestión de inventario y compras
- **Facturación** - Gestión de facturación y finanzas

## 🗂️ Estructura del Proyecto

```
autodealer-cloud/
├── components/          # Componentes React
│   ├── views/          # Vistas principales
│   ├── AuthProvider.tsx
│   ├── DataContext.tsx
│   └── UIContext.tsx
├── lib/                # Configuración de Supabase
│   ├── supabase.ts
│   └── auth.ts
├── backend/            # API Backend (opcional)
├── services/           # Servicios (DB local)
├── utils/              # Utilidades
├── types.ts            # Definiciones de tipos
└── constants.ts        # Constantes
```

## 🔄 Estados del Sistema

### Órdenes de Trabajo
1. Recepción
2. Diagnóstico
3. Pendiente Cotización
4. Esperando Aprobación
5. En Reparación
6. Control de Calidad
7. Listo para Entrega
8. Entregado

## 📊 Módulos Principales

### 1. Órdenes de Trabajo
- Creación y seguimiento de OTs
- Sistema Kanban visual
- Diagnóstico con checklist
- Evidencias fotográficas
- Portal de cliente

### 2. Facturación
- Cotizaciones con aprobación
- Generación de facturas
- Gestión de pagos
- Factoring y retenciones
- Impresión de documentos

### 3. Inventario
- Control de stock
- Órdenes de compra
- Alertas de bajo inventario
- Gestión de proveedores

### 4. Finanzas
- Caja menor
- Gastos operativos
- Cuentas por cobrar
- Cuentas por pagar
- Reportes de rentabilidad

### 5. Personal
- Registro de asistencia
- Nómina
- Préstamos
- Comisiones
- Productividad

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run preview

# Backend
cd backend
npm start        # Producción
npm run dev      # Desarrollo
```

## 🧪 Testing

```bash
# TODO: Implementar tests
npm test
```

## 📈 Próximas Características

- [ ] Sincronización en tiempo real
- [ ] Aplicación móvil
- [ ] Integración con WhatsApp
- [ ] Reportes avanzados con IA
- [ ] Sistema de recordatorios automáticos
- [ ] Integración con sistemas contables

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y de uso exclusivo.

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@autodealer.com
- Documentación: Ver archivos en `/docs`

## ⚠️ Estado del Proyecto

**Versión Actual**: 1.0.0-beta  
**Estado**: En desarrollo activo  
**Última Actualización**: Octubre 2025

### ✅ Completado
- Sistema de gestión completo
- Integración con Supabase
- Autenticación y seguridad
- Documentación

### 🚧 En Progreso
- Migración completa a Supabase
- Testing exhaustivo
- Optimizaciones de rendimiento

---

Desarrollado con ❤️ para talleres automotrices modernos.
