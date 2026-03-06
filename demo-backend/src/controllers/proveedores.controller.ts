import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const listar = async (req: Request, res: Response) => {
  try {
    const proveedores = await prisma.proveedor.findMany({
      include: { transferencias: { orderBy: { creadoEn: 'desc' } } }
    });
    res.json(proveedores);
  } catch {
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

export const crear = async (req: Request, res: Response) => {
  try {
    const { nombre, comision } = req.body;
    if (!nombre || comision === undefined) {
      return res.status(400).json({ error: 'Faltan campos: nombre, comision' });
    }
    const proveedor = await prisma.proveedor.create({
      data: { nombre, comision: Number(comision) }
    });
    res.status(201).json(proveedor);
  } catch {
    res.status(500).json({ error: 'Error al crear proveedor' });
  }
};

export const registrarTransferencia = async (req: Request, res: Response) => {
  try {
    const { proveedorId, montoEnviado } = req.body;
    if (!proveedorId || !montoEnviado) {
      return res.status(400).json({ error: 'Faltan campos: proveedorId, montoEnviado' });
    }

    const proveedor = await prisma.proveedor.findUnique({ where: { id: Number(proveedorId) } });
    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });

    const montoEsperado = Number(montoEnviado) * (1 - Number(proveedor.comision) / 100);

    const transferencia = await prisma.transferenciaProveedor.create({
      data: {
        proveedorId:   Number(proveedorId),
        montoEnviado:  Number(montoEnviado),
        montoEsperado,
        montoRecibido: 0,
        pendiente:     montoEsperado,
        comision:      Number(proveedor.comision),
      }
    });

    res.status(201).json(transferencia);
  } catch {
    res.status(500).json({ error: 'Error al registrar transferencia' });
  }
};

export const registrarEfectivo = async (req: Request, res: Response) => {
  try {
    const { transferenciaId, montoRecibido, cajaId, empresaId } = req.body;
    const usuarioId = (req as any).usuario.id;

    if (!transferenciaId || !montoRecibido || !cajaId || !empresaId) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const transferencia = await prisma.transferenciaProveedor.findUnique({
      where: { id: Number(transferenciaId) }
    });
    if (!transferencia) return res.status(404).json({ error: 'Transferencia no encontrada' });

    const resultado = await prisma.$transaction(async (tx) => {
      const nuevoPendiente = Number(transferencia.pendiente) - Number(montoRecibido);
      const liquidado      = nuevoPendiente <= 0;

      const updated = await tx.transferenciaProveedor.update({
        where: { id: Number(transferenciaId) },
        data: {
          montoRecibido: { increment: Number(montoRecibido) },
          pendiente:     nuevoPendiente > 0 ? nuevoPendiente : 0,
          liquidado,
        }
      });

      await tx.movimiento.create({
        data: {
          tipo:        'ENTRADA',
          monto:       Number(montoRecibido),
          concepto:    'Efectivo recibido de proveedor',
          persona:     `Proveedor ID ${transferencia.proveedorId}`,
          empresaId:   Number(empresaId),
          cajaId:      Number(cajaId),
          usuarioId,
          proveedorId: transferencia.proveedorId,
        }
      });

      await tx.caja.update({
        where: { id: Number(cajaId) },
        data:  { saldo: { increment: Number(montoRecibido) } },
      });

      return updated;
    });

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar efectivo recibido' });
  }
};
