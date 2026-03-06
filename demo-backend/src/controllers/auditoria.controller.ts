import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const listar = async (req: Request, res: Response) => {
  try {
    const { modulo, accion, page = 1, limit = 50 } = req.query;

    const where: any = {};
    if (modulo) where.modulo = String(modulo);
    if (accion) where.accion = String(accion);

    const skip = (Number(page) - 1) * Number(limit);

    const [registros, total] = await Promise.all([
      prisma.auditoria.findMany({
        where,
        include: { usuario: { select: { nombre: true, email: true } } },
        orderBy: { creadoEn: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.auditoria.count({ where }),
    ]);

    res.json({
      data:    registros,
      total,
      pagina:  Number(page),
      paginas: Math.ceil(total / Number(limit)),
    });
  } catch {
    res.status(500).json({ error: 'Error al obtener auditoría' });
  }
};
