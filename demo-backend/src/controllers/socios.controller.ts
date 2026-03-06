import { Request, Response } from 'express';
import prisma from '../config/prisma';

const TIPO_CAMBIO_DEMO = 17.50;

export const listar = async (req: Request, res: Response) => {
  try {
    const socios = await prisma.socio.findMany({
      include: { retiros: { orderBy: { creadoEn: 'desc' } } }
    });
    res.json(socios);
  } catch {
    res.status(500).json({ error: 'Error al obtener socios' });
  }
};

export const registrarRetiro = async (req: Request, res: Response) => {
  try {
    const { socioId, monto, mes, anio, cajaId, empresaId } = req.body;
    const usuarioId = (req as any).usuario.id;

    if (!socioId || !monto || !mes || !anio || !cajaId || !empresaId) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const montoUsd = Number(monto) / TIPO_CAMBIO_DEMO;

    const resultado = await prisma.$transaction(async (tx) => {
      const retiro = await tx.retiroSocio.create({
        data: {
          socioId:   Number(socioId),
          monto:     Number(monto),
          tipoCambio: TIPO_CAMBIO_DEMO,
          montoUsd,
          mes:       Number(mes),
          anio:      Number(anio),
        }
      });

      const socio = await tx.socio.findUnique({ where: { id: Number(socioId) } });

      await tx.movimiento.create({
        data: {
          tipo:      'SALIDA',
          monto:     Number(monto),
          concepto:  'Retiro de socio',
          persona:   socio?.nombre || `Socio ID ${socioId}`,
          empresaId: Number(empresaId),
          cajaId:    Number(cajaId),
          usuarioId,
          socioId:   Number(socioId),
        }
      });

      await tx.caja.update({
        where: { id: Number(cajaId) },
        data:  { saldo: { decrement: Number(monto) } },
      });

      return { retiro, tipoCambio: TIPO_CAMBIO_DEMO, montoUsd };
    });

    res.status(201).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar retiro' });
  }
};

export const diferencia = async (req: Request, res: Response) => {
  try {
    const { mes, anio } = req.query;

    const where: any = {};
    if (mes) where.mes = Number(mes);
    if (anio) where.anio = Number(anio);

    const retiros = await prisma.retiroSocio.findMany({
      where,
      include: { socio: { select: { nombre: true } } },
      orderBy: { creadoEn: 'desc' },
    });

    const porSocioMxn: Record<number, number> = {};
    const porSocioUsd: Record<number, number> = {};

    for (const r of retiros) {
      const id = r.socioId;
      porSocioMxn[id] = (porSocioMxn[id] || 0) + Number(r.monto);
      porSocioUsd[id] = (porSocioUsd[id] || 0) + Number(r.montoUsd || 0);
    }

    const ids = Object.keys(porSocioMxn).map(Number);
    if (ids.length < 2) {
      return res.json({
        retiros, porSocioMxn, porSocioUsd,
        diferenciaMxn: 0, diferenciaUsd: 0,
        tipoCambio: TIPO_CAMBIO_DEMO, mensaje: 'Sin diferencia calculable',
      });
    }

    const id1 = ids[0], id2 = ids[1];
    const total1 = porSocioMxn[id1] || 0;
    const total2 = porSocioMxn[id2] || 0;
    const diferenciaMxn = Math.abs(total1 - total2);
    const deudor   = total1 > total2 ? id1 : id2;
    const acreedor = total1 > total2 ? id2 : id1;
    const diferenciaUsd = Math.abs((porSocioUsd[id1] || 0) - (porSocioUsd[id2] || 0));

    res.json({
      retiros, porSocioMxn, porSocioUsd,
      diferenciaMxn, diferenciaUsd, tipoCambio: TIPO_CAMBIO_DEMO,
      deudor, acreedor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al calcular diferencia' });
  }
};

export const editarSocio = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { nombre } = req.body;
    if (!nombre || String(nombre).trim().length < 2) {
      return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
    }
    const socio = await prisma.socio.update({
      where: { id },
      data:  { nombre: String(nombre).trim() },
    });
    res.json(socio);
  } catch {
    res.status(500).json({ error: 'Error al editar socio' });
  }
};
