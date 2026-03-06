import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const listar = async (req: Request, res: Response) => {
  try {
    const cajas = await prisma.caja.findMany({
      where:   { activa: true },
      include: { empresa: { select: { nombre: true } } },
      orderBy: { empresaId: 'asc' },
    });
    res.json(cajas);
  } catch {
    res.status(500).json({ error: 'Error al obtener cajas' });
  }
};

export const obtener = async (req: Request, res: Response) => {
  try {
    const caja = await prisma.caja.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        empresa: { select: { nombre: true } },
        movimientos: {
          orderBy: { fecha: 'desc' },
          take: 50,
          include: {
            clave:   { select: { codigo: true } },
            usuario: { select: { nombre: true } },
          }
        }
      }
    });
    if (!caja) return res.status(404).json({ error: 'Caja no encontrada' });
    res.json(caja);
  } catch {
    res.status(500).json({ error: 'Error al obtener caja' });
  }
};

export const transferir = async (req: Request, res: Response) => {
  try {
    const { cajaOrigenId, cajaDestinoId, monto, concepto } = req.body;
    const usuarioId = (req as any).usuario.id;

    if (!cajaOrigenId || !cajaDestinoId || !monto) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    if (Number(cajaOrigenId) === Number(cajaDestinoId)) {
      return res.status(400).json({ error: 'La caja origen y destino no pueden ser la misma' });
    }

    const origen = await prisma.caja.findUnique({ where: { id: Number(cajaOrigenId) } });
    if (!origen) return res.status(404).json({ error: 'Caja origen no encontrada' });
    if (Number(origen.saldo) < Number(monto)) {
      return res.status(400).json({ error: `Saldo insuficiente. Disponible: $${origen.saldo}` });
    }

    const destino = await prisma.caja.findUnique({ where: { id: Number(cajaDestinoId) } });
    if (!destino) return res.status(404).json({ error: 'Caja destino no encontrada' });

    const resultado = await prisma.$transaction(async (tx) => {
      const transferencia = await tx.transferenciaCaja.create({
        data: {
          cajaOrigenId: Number(cajaOrigenId),
          cajaDestino:  Number(cajaDestinoId),
          monto:        Number(monto),
          concepto:     concepto || 'Transferencia entre cajas',
          usuarioId,
        }
      });

      await tx.movimiento.create({
        data: {
          tipo:      'SALIDA',
          monto:     Number(monto),
          concepto:  `[TRANSFERENCIA] a ${destino.nombre}: ${concepto || 'Transferencia'}`,
          persona:   'SISTEMA (Transferencia)',
          empresaId: origen.empresaId,
          cajaId:    Number(cajaOrigenId),
          usuarioId,
        }
      });

      await tx.movimiento.create({
        data: {
          tipo:      'ENTRADA',
          monto:     Number(monto),
          concepto:  `[TRANSFERENCIA] desde ${origen.nombre}: ${concepto || 'Transferencia'}`,
          persona:   'SISTEMA (Transferencia)',
          empresaId: destino.empresaId,
          cajaId:    Number(cajaDestinoId),
          usuarioId,
        }
      });

      await tx.caja.update({ where: { id: Number(cajaOrigenId) },  data: { saldo: { decrement: Number(monto) } } });
      await tx.caja.update({ where: { id: Number(cajaDestinoId) }, data: { saldo: { increment: Number(monto) } } });

      await tx.auditoria.create({
        data: {
          usuarioId,
          accion:  'TRANSFERENCIA_CAJA',
          modulo:  'cajas',
          detalle: JSON.stringify({ cajaOrigenId, cajaDestinoId, monto }),
        }
      });

      return transferencia;
    });

    res.status(201).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al realizar la transferencia' });
  }
};

export const crear = async (req: Request, res: Response) => {
  try {
    const { nombre, locacion, empresaId } = req.body;
    if (!nombre || !locacion || !empresaId) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    const caja = await prisma.caja.create({
      data: { nombre, locacion, empresaId: Number(empresaId) },
      include: { empresa: { select: { nombre: true } } }
    });
    res.status(201).json(caja);
  } catch {
    res.status(500).json({ error: 'Error al crear la caja' });
  }
};
