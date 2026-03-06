import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';

import authRoutes        from './routes/auth.routes';
import movimientosRoutes from './routes/movimientos.routes';
import cajasRoutes       from './routes/cajas.routes';
import sociosRoutes      from './routes/socios.routes';
import proveedoresRoutes from './routes/proveedores.routes';
import usuariosRoutes    from './routes/usuarios.routes';
import subempresasRoutes from './routes/subempresas.routes';
import auditoriaRoutes   from './routes/auditoria.routes';
import clavesRoutes      from './routes/claves.routes';
import miCuentaRoutes    from './routes/mi-cuenta.routes';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

// ── SEGURIDAD ─────────────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS (demo: permisivo) ────────────────────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));

// ── RUTAS ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/cajas',       cajasRoutes);
app.use('/api/socios',      sociosRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/usuarios',    usuariosRoutes);
app.use('/api/subempresas', subempresasRoutes);
app.use('/api/auditoria',   auditoriaRoutes);
app.use('/api/claves',      clavesRoutes);
app.use('/api/mi-cuenta',   miCuentaRoutes);

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    status:  'ok',
    mensaje: 'CASHFLOW DEMO API',
    version: '1.0.0-demo',
    modo:    'DEMOSTRACIÓN',
  });
});

// ── MANEJO DE ERRORES ─────────────────────────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(`[ERROR]`, err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 CASHFLOW DEMO API corriendo en http://localhost:${PORT}`);
  console.log(`📌 Modo: DEMOSTRACIÓN`);
  console.log(`📧 Usuario: demo@cashflow.com`);
  console.log(`🔑 Password: demo123\n`);
});
