# POS SaaS Multijerárquico (Monolito Modular)

Plataforma empresarial **POS SaaS Multi-tenant** y **Multijerárquica** con motor híbrido para la venta de productos físicos y servicios profesionales. Construida bajo los principios de **Clean Architecture (DDD)**, metodología **Feature-Sliced Design (FSD)** en frontend, soporte **Offline-First** (IndexedDB), notificaciones modernas mediante Toasts y Modales (cero `alert()` nativos), exportación a PDF/Excel y gestión jerárquica de permisos.

---

## 🔑 Credenciales de Acceso Inicial

| Campo | Valor por Defecto |
| :--- | :--- |
| **Usuario / Correo** | `daviex14@gmail.com` |
| **Contraseña** | `admin123` |
| **Rol** | Administrador del Tenant (`ADMIN`) |
| **Permisos Especiales** | Reset de Contraseñas & Delegación Habilitada |

---

## 🚀 Características Principales

1. **Autenticación y Delegación de Seguridad:**
   - Inicio de sesión mediante credenciales.
   - Restablecimiento de contraseñas por administradores y usuarios autorizados.
   - Delegación configurable mediante switch (`Permiso Reset`).

2. **Doble Interfaz Adaptativa:**
   - **Modo POS (Operador/Cajero):** UI de alta velocidad con buscador por código SKU/Escáner, carrito atómico, cobro en efectivo/tarjeta, toggle de exportación a PDF (Recibo) y soporte Offline-First con IndexedDB.
   - **Sección de Productos:** CRUD completo (Listar, Agregar, Editar, Eliminar) para bienes físicos con control de stock y servicios con duración por minutos.
   - **Sección de Usuarios:** Administración de personal, asignación de roles (`ADMIN`, `MANAGER`, `CASHIER`) y gestión de credenciales.
   - **Reportes & Gráficas (Dashboard Analytics):** Gráficas interactivas ejecutivas (Recharts) con filtrado temporal (*Hoy*, *Esta Semana*, *Este Mes*, *Todo el Histórico*, *Rango Personalizado*).
   - **Exportación General a Excel (.xlsx):** Descarga de todas las operaciones, productos, usuarios y nodos organizacionales en un único libro de trabajo con múltiples pestañas.
   - **Dashboard SaaS Jerárquico:** Configuración de jerarquías (`Región` -> `Sucursal` -> `Punto de Venta/Caja`) y reimpresión de tickets antiguos en PDF con el detalle de items consumidos.

---

## 🛠️ Requisitos e Instalación

- **Node.js** v18+ 
- **pnpm** (Gestor de paquetes recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/mrryzensor/POSsaas.git
cd POSsaas

# 2. Instalar dependencias con pnpm
pnpm install

# 3. Iniciar la aplicación en modo desarrollo (Backend: 4000, Frontend: 3000)
pnpm dev
```

---

## 📦 Despliegue (Production Build)

Para generar la compilación optimizada de producción:

```bash
# Compilar frontend con Vite y verificar tipos con TypeScript
pnpm build

# Ejecutar el servidor backend en producción
pnpm dev:backend
```

---

## 📁 Estructura del Proyecto (Clean Architecture + FSD)

```
POSsaas/
├── src/
│   ├── backend/
│   │   ├── domain/               # Entidades de dominio puras
│   │   ├── application/          # Casos de uso y reglas de negocio
│   │   ├── infrastructure/       # Drizzle ORM, driver SQLite, REST controllers
│   │   └── server.ts             # Servidor Express integrador
│   └── client/                   # Feature-Sliced Design (FSD)
│       ├── app/                  # Providers globales
│       ├── pages/                # PosPage, ProductsPage, UsersPage, ReportsDashboardPage, AdminPage
│       ├── shared/               # Toast, Modal, IndexedDB store, PDF exporter, Excel exporter
│       └── App.tsx               # Enrutador y layout principal
├── pos_saas.db                   # Base de datos SQLite local
├── pnpm-lock.yaml
└── package.json
```
