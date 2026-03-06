import { Request, Response } from 'express';
import prisma from '../config/prisma';

// ── LISTAR con filtros ────────────────────────────────────────────────────────
export const listar = async (req: Request, res: Response) => {
  try {
    const { empresaId, cajaId, tipo, claveId, persona, desde, hasta, page = 1, limit = 50 } = req.query;

    const where: any = {};
    if (empresaId) where.empresaId = Number(empresaId);
    if (cajaId)    where.cajaId    = Number(cajaId);
    if (claveId)   where.claveId   = Number(claveId);

    if (tipo) {
      if (tipo === 'TRANSFERENCIA') {
        where.concepto = { contains: '[TRANSFERENCIA]' };
      } else {
        where.tipo = tipo;
      }
    }

    if (persona) {
      where.OR = [
        { persona:  { contains: String(persona) } },
        { concepto: { contains: String(persona) } },
      ];
    }

    if (desde || hasta) {
      where.fecha = {};
      if (desde) where.fecha.gte = new Date(String(desde));
      if (hasta) where.fecha.lte = new Date(String(hasta));
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [movimientos, total] = await Promise.all([
      prisma.movimiento.findMany({
        where,
        include: {
          empresa:    { select: { nombre: true } },
          caja:       { select: { nombre: true } },
          clave:      { select: { codigo: true } },
          usuario:    { select: { nombre: true } },
          subempresa: { select: { nombre: true } },
        },
        orderBy: { fecha: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.movimiento.count({ where }),
    ]);

    res.json({
      data: movimientos,
      total,
      pagina: Number(page),
      paginas: Math.ceil(total / Number(limit)),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
};

// ── CREAR ─────────────────────────────────────────────────────────────────────
export const crear = async (req: Request, res: Response) => {
  try {
    const {
      tipo, monto, concepto, persona,
      empresaId, subempresaId, cajaId, claveId,
      socioId, proveedorId, fecha,
    } = req.body;

    const usuarioId = (req as any).usuario.id;

    if (!tipo || !monto || !concepto || !persona || !empresaId || !cajaId) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    if (!['ENTRADA', 'SALIDA', 'TRANSFERENCIA'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido' });
    }

    const caja = await prisma.caja.findUnique({ where: { id: Number(cajaId) } });
    if (!caja) return res.status(404).json({ error: 'Caja no encontrada' });

    const resultado = await prisma.$transaction(async (tx) => {
      const movimiento = await tx.movimiento.create({
        data: {
          tipo,
          monto:        Number(monto),
          concepto,
          persona,
          empresaId:    Number(empresaId),
          subempresaId: subempresaId ? Number(subempresaId) : null,
          cajaId:       Number(cajaId),
          claveId:      claveId ? Number(claveId) : null,
          usuarioId,
          socioId:      socioId ? Number(socioId) : null,
          proveedorId:  proveedorId ? Number(proveedorId) : null,
          fecha:        fecha ? new Date(fecha) : new Date(),
        },
        include: {
          empresa: { select: { nombre: true } },
          caja:    { select: { nombre: true } },
          clave:   { select: { codigo: true } },
          usuario: { select: { nombre: true } },
        }
      });

      const incremento = tipo === 'ENTRADA' ? Number(monto) : -Number(monto);
      await tx.caja.update({
        where: { id: Number(cajaId) },
        data:  { saldo: { increment: incremento } },
      });

      await tx.auditoria.create({
        data: {
          usuarioId,
          accion:  'CREAR_MOVIMIENTO',
          modulo:  'movimientos',
          detalle: JSON.stringify({ tipo, monto, cajaId }),
        }
      });

      return movimiento;
    });

    res.status(201).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear movimiento' });
  }
};

// ── OBTENER UNO ───────────────────────────────────────────────────────────────
export const obtener = async (req: Request, res: Response) => {
  try {
    const movimiento = await prisma.movimiento.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        empresa:    { select: { nombre: true } },
        subempresa: { select: { nombre: true } },
        caja:       { select: { nombre: true, locacion: true } },
        clave:      { select: { codigo: true, descripcion: true } },
        usuario:    { select: { nombre: true } },
        socio:      { select: { nombre: true } },
        proveedor:  { select: { nombre: true } },
      }
    });

    if (!movimiento) return res.status(404).json({ error: 'Movimiento no encontrado' });
    res.json(movimiento);
  } catch {
    res.status(500).json({ error: 'Error al obtener movimiento' });
  }
};

// ── RESUMEN DASHBOARD ─────────────────────────────────────────────────────────
export const resumen = async (req: Request, res: Response) => {
  try {
    const ahora    = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    const [cajas, entradas, salidas, ultimosMovimientos] = await Promise.all([
      prisma.caja.findMany({
        where:   { activa: true },
        include: { empresa: { select: { nombre: true } } },
        orderBy: { empresa: { nombre: 'asc' } },
      }),
      prisma.movimiento.aggregate({
        where: { tipo: 'ENTRADA', fecha: { gte: inicioMes } },
        _sum:  { monto: true },
      }),
      prisma.movimiento.aggregate({
        where: { tipo: 'SALIDA', fecha: { gte: inicioMes } },
        _sum:  { monto: true },
      }),
      prisma.movimiento.findMany({
        take:    10,
        orderBy: { fecha: 'desc' },
        include: {
          empresa: { select: { nombre: true } },
          caja:    { select: { nombre: true } },
          clave:   { select: { codigo: true } },
        }
      }),
    ]);

    const saldoTotal = cajas.reduce((acc, c) => acc + Number(c.saldo), 0);

    res.json({
      saldoTotal,
      cajas,
      mes: {
        entradas:  Number(entradas._sum.monto) || 0,
        salidas:   Number(salidas._sum.monto)  || 0,
        flujoNeto: (Number(entradas._sum.monto) || 0) - (Number(salidas._sum.monto) || 0),
      },
      ultimosMovimientos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
};
