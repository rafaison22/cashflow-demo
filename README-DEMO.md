# CASHFLOW — Demo Preview

Sistema de gestión de flujo de caja. Esta es la versión de demostración con datos ficticios.

## Acceso

| Campo | Valor |
|-------|-------|
| URL   | http://localhost:5174 |
| Email | `demo@cashflow.com` |
| Password | `demo123` |

---

## Qué puedes hacer en el demo

✅ **Permitido:**
- Ver dashboard completo con KPIs y gráficas en tiempo real
- Explorar movimientos con filtros (tipo, empresa, fechas, búsqueda)
- Ver cajas y sus saldos por empresa
- Ver socios con historial de retiros
- Ver proveedores y estado de transferencias
- Ver **Mi Cuenta Personal** — saldo, retiros personales, evolución gráfica
- Crear movimientos (se guardan en la base de datos demo)
- Transferir entre cajas
- Ver auditoría y registros de sistema
- Explorar claves y subempresas

🔒 **No disponible en demo:**
- Crear nuevos usuarios
- Descargar reportes en Excel/PDF
- Autenticación 2FA
- Modificar configuración crítica

---

## Diferencias con la versión completa

| Característica | Demo | Completo |
|----------------|------|----------|
| Base de datos | SQLite (local) | PostgreSQL (producción) |
| Autenticación | Login simple | Login + 2FA TOTP |
| Usuarios | 1 usuario demo | Ilimitados (ADMIN/OPERATIVO) |
| Reportes | Vista únicamente | Excel + PDF descargable |
| Módulo Hijos | ❌ No incluido | ✅ Hijos de socios |
| Datos | Ficticios (demo) | Datos reales de tu empresa |
| Seguridad | Simplificada | Rate limiting, bloqueo por intentos |
| Despliegue | Local / Railway | Producción segura |

---

## Instalación y Despliegue Local

### Requisitos
- Node.js 18+
- npm o pnpm

### Backend (demo-backend)

```bash
cd demo-backend

# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Crear la base de datos y cargar datos demo
npm run setup

# 4. Iniciar servidor
npm run dev
# El backend corre en http://localhost:3001
```

### Frontend (demo-frontend)

```bash
cd demo-frontend

# 1. Instalar dependencias
npm install

# 2. Iniciar
npm run dev
# El frontend corre en http://localhost:5174
```

---

## Despliegue en Railway (Producción)

### Backend en Railway

1. Crea un nuevo proyecto en [railway.app](https://railway.app)
2. Conecta tu repositorio
3. Configura el directorio de trabajo: `cashflow-demo/demo-backend`
4. Variables de entorno:
   ```
   DATABASE_URL=file:./demo.db
   PORT=3001
   JWT_SECRET=<genera-un-secreto-aleatorio>
   FRONTEND_URL=https://tu-frontend.vercel.app
   ```
5. Comando de inicio: `npm run setup && npm start`

### Frontend en Vercel

1. Crea un nuevo proyecto en [vercel.com](https://vercel.com)
2. Conecta tu repositorio
3. Directorio raíz: `cashflow-demo/demo-frontend`
4. Variables de entorno:
   ```
   VITE_API_URL=https://tu-backend.railway.app
   ```
5. Actualiza `vite.config.ts` con la URL del backend

---

## Estructura de Archivos

```
cashflow-demo/
├── demo-backend/
│   ├── prisma/
│   │   ├── schema.prisma    # SQLite, sin HijoSocio
│   │   └── seed.ts          # Datos de demostración
│   ├── src/
│   │   ├── index.ts
│   │   ├── config/prisma.ts
│   │   ├── middleware/auth.middleware.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts      # Sin 2FA
│   │   │   ├── mi-cuenta.controller.ts # NUEVO
│   │   │   └── ... (resto de controladores)
│   │   └── routes/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── demo-frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── MiCuentaPersonal.tsx  # NUEVA PÁGINA
    │   │   ├── Reportes.tsx          # Sin descargas
    │   │   ├── Usuarios.tsx          # Solo lectura
    │   │   └── ... (resto de páginas)
    │   ├── components/
    │   │   ├── Layout.tsx            # Con banner demo
    │   │   ├── DemoBanner.tsx        # Banner superior
    │   │   └── WelcomeModal.tsx      # Modal bienvenida
    │   └── App.tsx
    ├── package.json
    └── vite.config.ts
```

---

## Datos de Demo Incluidos

- **2 empresas:** Empresa Demo A, Empresa Demo B
- **6 cajas** con saldos variados (Total: ~$725,000 MXN)
- **5 subempresas** (Sucursal Norte, Sur, Centro, División Retail, Logística)
- **80 movimientos** de los últimos 3 meses
- **3 socios** con retiros históricos (últimos 3 meses)
- **3 proveedores** con diferentes estados (liquidado/pendiente)
- **7 claves** de categorización
- **20 registros** de auditoría

---

## Contacto

¿Interesado en el sistema completo para tu empresa?

📧 **contacto@cashflow.com**

El sistema completo incluye:
- Multi-empresa con múltiples usuarios y roles
- 2FA para mayor seguridad
- Reportes descargables en Excel y PDF
- Módulo completo de Hijos de Socios
- PostgreSQL en producción
- Soporte técnico y capacitación
