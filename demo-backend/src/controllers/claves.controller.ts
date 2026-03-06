import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const listar = async (req: Request, res: Response) => {
  try {
    const claves = await prisma.clave.findMany({ orderBy: { codigo: 'asc' } });
    res.json(claves);
  } catch {
    res.status(500).json({ error: 'Error al obtener claves' });
  }
};

export const crear = async (req: Request, res: Response) => {
  try {
    const { codigo, descripcion, categoria } = req.body;
    if (!codigo || !descripcion) {
      return res.status(400).json({ error: 'Código y descripción requeridos' });
    }

    const codigoUp = String(codigo).toUpperCase().trim();
    const existe = await prisma.clave.findUnique({ where: { codigo: codigoUp } });
    if (existe) return res.status(400).json({ error: `Ya existe la clave ${codigoUp}` });

    const clave = await prisma.clave.create({
      data: { codigo: codigoUp, descripcion, categoria: categoria || null },
    });

    await prisma.auditoria.create({
      data: {
        usuarioId: (req as any).usuario.id,
        accion:    'CREAR_CLAVE',
        modulo:    'claves',
        detalle:   JSON.stringify({ codigo: codigoUp, descripcion }),
      }
    });

    res.status(201).json(clave);
  } catch {
    res.status(500).json({ error: 'Error al crear clave' });
  }
};

export const editar = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { descripcion, categoria, activa } = req.body;
    const clave = await prisma.clave.update({
      where: { id },
      data:  { descripcion, categoria, activa },
    });
    res.json(clave);
  } catch {
    res.status(500).json({ error: 'Error al editar clave' });
  }
};
