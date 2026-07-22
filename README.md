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

## 🔰 Guía Paso a Paso para Principiantes (Desde Cero)

Sigue estos sencillos pasos si nunca has ejecutado un proyecto web de este tipo antes.

### Paso 1: Requisitos Previos

Antes de comenzar, asegúrate de tener instalado **Node.js** en tu computadora.
1. Descarga e instala la versión recomendada desde [https://nodejs.org/](https://nodejs.org/).
2. Para comprobar si ya lo tienes instalado:
   - Abre la consola (PowerShell) y escribe: `node -v` y presiona **Enter**.

---

### Paso 2: ¿Cómo abrir la Consola (PowerShell en Windows)?

Hay 2 formas sencillas de abrir PowerShell:

**Opción A (Desde el menú Inicio):**
1. Presiona la tecla **Windows** en tu teclado.
2. Escribe `PowerShell`.
3. Haz clic en **Windows PowerShell** o **Terminal**.

**Opción B (Directamente desde la carpeta del proyecto):**
1. Abre el **Explorador de Archivos** de Windows y navega hasta la carpeta donde descargaste o clonaste este proyecto (por ejemplo `E:\CrearApps\POSsaas`).
2. En la barra de direcciones de la carpeta (arriba donde dice la ruta), haz clic, escribe `powershell` y presiona **Enter**. Se abrirá la consola directamente lista en esta carpeta.

---

### Paso 3: Navegar hasta la carpeta del proyecto (Si abriste PowerShell desde el inicio)

Si abriste PowerShell desde el menú Inicio, debes dirigirte a la carpeta del proyecto usando el comando `cd`.

```powershell
# Reemplaza la ruta por la carpeta exacta donde guardaste el proyecto
cd E:\CrearApps\POSsaas
```

---

### Paso 4: Instalar pnpm (Gestor de Paquetes)

Para instalar las librerías del proyecto de forma rápida y eficiente, usaremos **pnpm**. Escribe este comando en la consola y presiona **Enter**:

```powershell
npm install -g pnpm
```

---

### Paso 5: Instalar las Dependencias del Proyecto

Una vez ubicado dentro de la carpeta del proyecto en la consola, ejecuta:

```powershell
pnpm install
```
*Espera unos segundos a que termine de descargar las librerías requeridas.*

---

### Paso 6: Ejecutar la Aplicación en Modo Desarrollo

Para encender el servidor backend y la interfaz web al mismo tiempo, ejecuta:

```powershell
pnpm dev
```

Verás un mensaje en la consola indicando que la aplicación está activa:
- **Frontend (Interfaz Gráfica):** `http://localhost:3000`
- **Backend (API REST):** `http://localhost:4000`

---

### Paso 7: Abrir la Aplicación en tu Navegador

1. Abre tu navegador web favorito (Google Chrome, Edge, Brave, Firefox, etc.).
2. En la barra de direcciones escribe:
   ```
   http://localhost:3000
   ```
3. Verás la pantalla de **Iniciar Sesión**. Ingresa las credenciales iniciales:
   - **Correo:** `daviex14@gmail.com`
   - **Contraseña:** `admin123`
4. ¡Listo! Ya estás dentro de la plataforma POS SaaS.

---

## 🚀 Módulos Incluidos y Uso

1. **Modo POS (Operador/Cajero):**
   - Buscador rápido por código SKU o lector de código de barras.
   - Carrito atómico de compras con cobro en efectivo o tarjeta.
   - Switch toggle para **Exportar Recibo a PDF**.
   - Soporte **Offline-First**: si pierdes conexión a Internet, las ventas se guardan localmente en IndexedDB y podrás sincronizarlas cuando regrese la conexión.

2. **Sección de Productos:**
   - Crear, editar, listar y eliminar productos físicos (con control de stock) y servicios profesionales (con duración en minutos).

3. **Sección de Usuarios:**
   - Crear nuevos usuarios con su respectiva contraseña.
   - Botón `KeyRound` para **resetear la contraseña** de cualquier usuario mediante un modal.
   - Switch `Permiso Reset` para delegar permiso de reseteo a otros colaboradores según su nivel jerárquico.

4. **Reportes & Gráficas (Dashboard):**
   - Gráficas interactivas ejecutas de ventas en el tiempo y top de ítems más vendidos.
   - Filtros de fecha (*Hoy*, *Esta Semana*, *Este Mes*, *Todo el Histórico*, *Rango Personalizado*).
   - Botón **"Exportar Todo a Excel (.xlsx)"** para descargar la base de datos de ventas, productos, usuarios y jerarquía.

5. **Dashboard SaaS Jerárquico:**
   - Estructura organizativa (`Región` -> `Sucursal` -> `Punto de Venta/Caja`).
   - Botón para **reimprimir recibos antiguos** en PDF con el detalle exacto de items consumidos.

---

## 📦 Compilación para Producción (Despliegue)

Cuando quieras compilar la aplicación para un servidor de producción:

```powershell
# 1. Generar la compilación optimizada del cliente
pnpm build

# 2. Iniciar únicamente el servidor backend de producción
pnpm dev:backend
```

---

## 📁 Estructura del Código Fuente

```
POSsaas/
├── src/
│   ├── backend/
│   │   ├── domain/               # Entidades del negocio
│   │   ├── application/          # Casos de uso
│   │   ├── infrastructure/       # Base de datos SQLite y ORM Drizzle
│   │   └── server.ts             # Servidor REST
│   └── client/                   # Frontend (Feature-Sliced Design)
│       ├── pages/                # POS, Productos, Usuarios, Reportes, Dashboard SaaS
│       ├── shared/               # Toasts, Modales, Explotadores PDF y Excel
│       └── App.tsx               # Control de navegación y autenticación
├── README.md                     # Guía completa de uso
└── package.json
```
