import { Request, Response } from 'express';
import prisma from '../config/prisma';

// En el demo, solo se puede ver la lista de usuarios (sin crear/modificar)
export const listar = async (req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nombre: true, email: true, rol: true, activo: true, creadoEn: true },
      orderBy: { nombre: 'asc' },
    });
    res.json(usuarios);
  } catch {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Bloqueado en el demo
export const crear = (_req: Request, res: Response) => {
  res.status(403).json({ error: 'La creación de usuarios no está disponible en el modo demo.' });
};

export const cambiarPassword = (_req: Request, res: Response) => {
  res.status(403).json({ error: 'Esta función no está disponible en el modo demo.' });
};

export const toggleActivo = (_req: Request, res: Response) => {
  res.status(403).json({ error: 'Esta función no está disponible en el modo demo.' });
};
