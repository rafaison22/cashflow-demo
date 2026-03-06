import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'demo-jwt-secret-cashflow-2024';

// ── LOGIN (Simplificado - sin 2FA, sin bloqueo por intentos) ─────────────────
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password requeridos' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Registrar login en auditoría
    await prisma.auditoria.create({
      data: {
        usuarioId: usuario.id,
        accion: 'LOGIN',
        modulo: 'auth',
        ip: req.ip || '0.0.0.0',
        detalle: JSON.stringify({ email: usuario.email, modo: 'demo' }),
      }
    });

    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    });

  } catch (error) {
    console.error('[LOGIN_ERROR]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── ME ────────────────────────────────────────────────────────────────────────
export const me = async (req: Request, res: Response) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: (req as any).usuario.id },
      select: { id: true, nombre: true, email: true, rol: true }
    });
    res.json(usuario);
  } catch {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};
