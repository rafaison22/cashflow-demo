import { Request, Response } from 'express';
import prisma from '../config/prisma';

// Genera evolución de saldo de los últimos 6 meses (simulada)
function generarEvolucionSaldo(saldoActual: number) {
  const meses = [];
  const nombres = ['Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb'];
  let saldo = saldoActual * 0.4; // Empieza en 40% del saldo actual

  for (let i = 0; i < 6; i++) {
    const variacion = (Math.random() * 0.3 + 0.05) * saldoActual;
    saldo = i < 5 ? saldo + variacion : saldoActual;
    meses.push({ mes: nombres[i], saldo: Math.round(saldo) });
  }

  return meses;
}

// Retiros personales simulados del usuario demo
const retirosPersonalesDemo = [
  { id: 1, fecha: new Date('2025-02-15'), monto: 8500,  concepto: 'Retiro quincenal febrero' },
  { id: 2, fecha: new Date('2025-02-01'), monto: 8500,  concepto: 'Retiro quincenal febrero' },
  { id: 3, fecha: new Date('2025-01-15'), monto: 7800,  concepto: 'Retiro quincenal enero' },
  { id: 4, fecha: new Date('2025-01-01'), monto: 7800,  concepto: 'Retiro quincenal enero' },
  { id: 5, fecha: new Date('2024-12-15'), monto: 12000, concepto: 'Retiro + bono diciembre' },
  { id: 6, fecha: new Date('2024-12-01'), monto: 7500,  concepto: 'Retiro quincenal diciembre' },
  { id: 7, fecha: new Date('2024-11-15'), monto: 7500,  concepto: 'Retiro quincenal noviembre' },
  { id: 8, fecha: new Date('2024-11-01'), monto: 7500,  concepto: 'Retiro quincenal noviembre' },
];

export const miCuenta = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario.id;

    // Obtener datos del usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true, nombre: true, email: true, rol: true, creadoEn: true },
    });

    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Saldo acumulado simulado
    const saldoAcumulado = 45320.00;
    const sueldoMensual  = 17000.00;
    const totalRetirado  = retirosPersonalesDemo.reduce((a, r) => a + r.monto, 0);

    // Últimas 10 transacciones del sistema relacionadas al usuario
    const ultimasTransacciones = await prisma.movimiento.findMany({
      where:   { usuarioId },
      take:    10,
      orderBy: { fecha: 'desc' },
      include: {
        empresa: { select: { nombre: true } },
        caja:    { select: { nombre: true } },
      }
    });

    // Evolución del saldo en los últimos 6 meses
    const evolucionSaldo = generarEvolucionSaldo(saldoAcumulado);

    res.json({
      usuario,
      saldoAcumulado,
      sueldoMensual,
      totalRetirado,
      retiros: retirosPersonalesDemo,
      ultimasTransacciones,
      evolucionSaldo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener datos de tu cuenta' });
  }
};
