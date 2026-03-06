import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const listar = async (req: Request, res: Response) => {
  try {
    const { empresaId } = req.query;
    const subempresas = await prisma.subempresa.findMany({
      where:   empresaId ? { empresaId: Number(empresaId) } : undefined,
      include: {
        empresa: { select: { nombre: true } },
        _count:  { select: { movimientos: true } },
      },
      orderBy: { nombre: 'asc' },
    });
    res.json(subempresas);
  } catch {
    res.status(500).json({ error: 'Error al obtener subempresas' });
  }
};

export const crear = async (req: Request, res: Response) => {
  try {
    const { nombre, empresaId } = req.body;
    if (!nombre || !empresaId) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const empresa = await prisma.empresa.findUnique({ where: { id: Number(empresaId) } });
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    const existe = await prisma.subempresa.findFirst({ where: { nombre, empresaId: Number(empresaId) } });
    if (existe) return res.status(400).json({ error: 'Ya existe una subempresa con ese nombre' });

    const subempresa = await prisma.subempresa.create({
      data: { nombre, empresaId: Number(empresaId) },
      include: { empresa: { select: { nombre: true } } },
    });

    await prisma.auditoria.create({
      data: {
        usuarioId: (req as any).usuario.id,
        accion:    'CREAR_SUBEMPRESA',
        modulo:    'subempresas',
        detalle:   JSON.stringify({ nombre, empresaId }),
      }
    });

    res.status(201).json(subempresa);
  } catch {
    res.status(500).json({ error: 'Error al crear subempresa' });
  }
};

export const metricas = async (req: Request, res: Response) => {
  try {
    const { empresaId, desde, hasta } = req.query;

    const where: any = {};
    if (empresaId) where.empresaId = Number(empresaId);
    if (desde || hasta) {
      where.fecha = {};
      if (desde) where.fecha.gte = new Date(String(desde));
      if (hasta) where.fecha.lte = new Date(String(hasta));
    }

    const subempresas = await prisma.subempresa.findMany({
      where:   empresaId ? { empresaId: Number(empresaId) } : undefined,
      include: { empresa: { select: { nombre: true } } },
    });

    const resultado = await Promise.all(
      subempresas.map(async (s) => {
        const [entradas, salidas, total] = await Promise.all([
          prisma.movimiento.aggregate({
            where: { ...where, subempresaId: s.id, tipo: 'ENTRADA' },
            _sum:  { monto: true },
            _count: true,
          }),
          prisma.movimiento.aggregate({
            where: { ...where, subempresaId: s.id, tipo: 'SALIDA' },
            _sum:  { monto: true },
            _count: true,
          }),
          prisma.movimiento.count({ where: { ...where, subempresaId: s.id } }),
        ]);

        const montoEntradas = Number(entradas._sum.monto) || 0;
        const montoSalidas  = Number(salidas._sum.monto)  || 0;

        return {
          id:          s.id,
          nombre:      s.nombre,
          empresa:     s.empresa.nombre,
          empresaId:   s.empresaId,
          entradas:    montoEntradas,
          salidas:     montoSalidas,
          flujoNeto:   montoEntradas - montoSalidas,
          movimientos: total,
        };
      })
    );

    resultado.sort((a, b) => b.flujoNeto - a.flujoNeto);
    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
};
