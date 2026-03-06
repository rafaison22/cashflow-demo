import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const conceptosEntrada = [
  'Cobro de servicio mensual', 'Pago de cliente corporativo', 'Ingreso por ventas',
  'Depósito de contado', 'Cobro de factura', 'Liquidación de cuenta',
  'Pago anticipado cliente', 'Cobro por servicios profesionales',
  'Ingreso por consultoría', 'Cobro de renta local',
];

const conceptosSalida = [
  'Pago de nómina quincenal', 'Pago a proveedor de insumos', 'Gasto operativo mensual',
  'Pago de servicios (luz, agua)', 'Compra de materiales', 'Pago de renta de oficina',
  'Gastos de representación', 'Pago de seguro empresarial', 'Compra de equipo de cómputo',
  'Mantenimiento de instalaciones',
];

const personas = [
  'Carlos Mendoza', 'Ana García', 'Roberto Sánchez', 'María López', 'José Martínez',
  'Laura Hernández', 'Pedro Ramírez', 'Sofia Torres', 'Diego Morales', 'Elena Vargas',
];

async function main() {
  console.log('🌱 Sembrando datos de demostración...');

  // Limpiar datos anteriores
  await prisma.auditoria.deleteMany();
  await prisma.movimiento.deleteMany();
  await prisma.transferenciaProveedor.deleteMany();
  await prisma.transferenciaCaja.deleteMany();
  await prisma.retiroSocio.deleteMany();
  await prisma.diferenciaSocios.deleteMany();
  await prisma.clave.deleteMany();
  await prisma.caja.deleteMany();
  await prisma.subempresa.deleteMany();
  await prisma.socio.deleteMany();
  await prisma.proveedor.deleteMany();
  await prisma.empresa.deleteMany();
  await prisma.usuario.deleteMany();

  // ── USUARIO DEMO ──────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('demo123', 10);
  const userDemo = await prisma.usuario.create({
    data: {
      nombre:   'Administrador Demo',
      email:    'demo@cashflow.com',
      password: passwordHash,
      rol:      'ADMIN',
      activo:   true,
    }
  });
  console.log('✓ Usuario demo creado:', userDemo.email);

  // ── EMPRESAS ──────────────────────────────────────────────────────────────
  const empresaA = await prisma.empresa.create({ data: { nombre: 'Empresa Demo A' } });
  const empresaB = await prisma.empresa.create({ data: { nombre: 'Empresa Demo B' } });
  console.log('✓ 2 empresas creadas');

  // ── SUBEMPRESAS ───────────────────────────────────────────────────────────
  const subempresas = await Promise.all([
    prisma.subempresa.create({ data: { nombre: 'Sucursal Norte',  empresaId: empresaA.id } }),
    prisma.subempresa.create({ data: { nombre: 'Sucursal Sur',    empresaId: empresaA.id } }),
    prisma.subempresa.create({ data: { nombre: 'Sucursal Centro', empresaId: empresaA.id } }),
    prisma.subempresa.create({ data: { nombre: 'División Retail', empresaId: empresaB.id } }),
    prisma.subempresa.create({ data: { nombre: 'División Logística', empresaId: empresaB.id } }),
  ]);
  console.log('✓ Subempresas creadas');

  // ── CAJAS ─────────────────────────────────────────────────────────────────
  const cajasA = await Promise.all([
    prisma.caja.create({ data: { nombre: 'Caja Principal A', locacion: 'Oficina Central', saldo: 245800.50, empresaId: empresaA.id } }),
    prisma.caja.create({ data: { nombre: 'Caja Operaciones A', locacion: 'Bodega Norte', saldo: 87320.00, empresaId: empresaA.id } }),
    prisma.caja.create({ data: { nombre: 'Caja Gastos A', locacion: 'Administración', saldo: 31500.75, empresaId: empresaA.id } }),
  ]);
  const cajasB = await Promise.all([
    prisma.caja.create({ data: { nombre: 'Caja Principal B', locacion: 'Sede Empresarial', saldo: 198450.00, empresaId: empresaB.id } }),
    prisma.caja.create({ data: { nombre: 'Caja Ventas B', locacion: 'Piso de Ventas', saldo: 52100.25, empresaId: empresaB.id } }),
    prisma.caja.create({ data: { nombre: 'Caja Reserva B', locacion: 'Tesorería', saldo: 110000.00, empresaId: empresaB.id } }),
  ]);
  const todasCajas = [...cajasA, ...cajasB];
  console.log('✓ 6 cajas creadas');

  // ── CLAVES ────────────────────────────────────────────────────────────────
  const claves = await Promise.all([
    prisma.clave.create({ data: { codigo: 'NOM',  descripcion: 'Nómina y sueldos',         categoria: 'Gasto' } }),
    prisma.clave.create({ data: { codigo: 'OPER', descripcion: 'Gastos operativos',         categoria: 'Gasto' } }),
    prisma.clave.create({ data: { codigo: 'VTA',  descripcion: 'Ventas y cobros',           categoria: 'Ingreso' } }),
    prisma.clave.create({ data: { codigo: 'SERV', descripcion: 'Servicios profesionales',   categoria: 'Ingreso' } }),
    prisma.clave.create({ data: { codigo: 'COMP', descripcion: 'Compras e insumos',         categoria: 'Gasto' } }),
    prisma.clave.create({ data: { codigo: 'RENTA', descripcion: 'Renta y arrendamiento',   categoria: 'Gasto' } }),
    prisma.clave.create({ data: { codigo: 'MISC', descripcion: 'Misceláneos',               categoria: 'Gasto' } }),
  ]);
  console.log('✓ Claves creadas');

  // ── SOCIOS ────────────────────────────────────────────────────────────────
  const socios = await Promise.all([
    prisma.socio.create({ data: { nombre: 'Rodrigo Fuentes Díaz' } }),
    prisma.socio.create({ data: { nombre: 'Beatriz Olvera Castillo' } }),
    prisma.socio.create({ data: { nombre: 'Fernando Aguilar Reyes' } }),
  ]);
  console.log('✓ Socios creados');

  // Retiros de socios (últimos 3 meses)
  const meses = [
    { mes: 1, anio: 2025 }, { mes: 2, anio: 2025 }, { mes: 3, anio: 2025 }
  ];
  for (const socio of socios) {
    for (const { mes, anio } of meses) {
      const monto = randomBetween(15000, 45000);
      await prisma.retiroSocio.create({
        data: {
          socioId:   socio.id,
          monto,
          tipoCambio: 17.50,
          montoUsd:   monto / 17.50,
          mes,
          anio,
        }
      });
    }
  }
  console.log('✓ Retiros de socios creados');

  // ── PROVEEDORES ───────────────────────────────────────────────────────────
  const proveedores = await Promise.all([
    prisma.proveedor.create({ data: { nombre: 'Logística Express México', comision: 2.5 } }),
    prisma.proveedor.create({ data: { nombre: 'Distribuidora Central SA', comision: 1.8 } }),
    prisma.proveedor.create({ data: { nombre: 'Servicios Financieros GH', comision: 3.2 } }),
  ]);

  // Transferencias a proveedores
  const transferenciasProv = await Promise.all([
    prisma.transferenciaProveedor.create({
      data: {
        proveedorId: proveedores[0].id,
        montoEnviado: 150000,
        montoEsperado: 146250, // 150k * (1 - 2.5%)
        montoRecibido: 146250,
        pendiente: 0,
        comision: 2.5,
        liquidado: true,
      }
    }),
    prisma.transferenciaProveedor.create({
      data: {
        proveedorId: proveedores[1].id,
        montoEnviado: 80000,
        montoEsperado: 78560, // 80k * (1 - 1.8%)
        montoRecibido: 50000,
        pendiente: 28560,
        comision: 1.8,
        liquidado: false,
      }
    }),
    prisma.transferenciaProveedor.create({
      data: {
        proveedorId: proveedores[2].id,
        montoEnviado: 200000,
        montoEsperado: 193600, // 200k * (1 - 3.2%)
        montoRecibido: 0,
        pendiente: 193600,
        comision: 3.2,
        liquidado: false,
      }
    }),
    prisma.transferenciaProveedor.create({
      data: {
        proveedorId: proveedores[0].id,
        montoEnviado: 95000,
        montoEsperado: 92625,
        montoRecibido: 92625,
        pendiente: 0,
        comision: 2.5,
        liquidado: true,
      }
    }),
  ]);
  console.log('✓ Proveedores y transferencias creados');

  // ── MOVIMIENTOS (80 movimientos en los últimos 3 meses) ───────────────────
  const movimientosData: any[] = [];

  // Entradas variadas
  for (let i = 0; i < 45; i++) {
    const empresa = i % 2 === 0 ? empresaA : empresaB;
    const cajasEmpresa = i % 2 === 0 ? cajasA : cajasB;
    const caja = cajasEmpresa[randomBetween(0, cajasEmpresa.length - 1)];
    const clave = claves[randomBetween(2, 3)]; // VTA o SERV
    const diasAtras = randomBetween(1, 90);
    movimientosData.push({
      tipo:        'ENTRADA',
      monto:       randomBetween(5000, 85000),
      concepto:    conceptosEntrada[randomBetween(0, conceptosEntrada.length - 1)],
      persona:     personas[randomBetween(0, personas.length - 1)],
      empresaId:   empresa.id,
      cajaId:      caja.id,
      claveId:     clave.id,
      usuarioId:   userDemo.id,
      subempresaId: subempresas[randomBetween(0, subempresas.length - 1)].id,
      fecha:       daysAgo(diasAtras),
    });
  }

  // Salidas variadas
  for (let i = 0; i < 35; i++) {
    const empresa = i % 2 === 0 ? empresaA : empresaB;
    const cajasEmpresa = i % 2 === 0 ? cajasA : cajasB;
    const caja = cajasEmpresa[randomBetween(0, cajasEmpresa.length - 1)];
    const clave = claves[randomBetween(0, 1)]; // NOM u OPER
    const diasAtras = randomBetween(1, 90);
    movimientosData.push({
      tipo:        'SALIDA',
      monto:       randomBetween(3000, 50000),
      concepto:    conceptosSalida[randomBetween(0, conceptosSalida.length - 1)],
      persona:     personas[randomBetween(0, personas.length - 1)],
      empresaId:   empresa.id,
      cajaId:      caja.id,
      claveId:     clave.id,
      usuarioId:   userDemo.id,
      subempresaId: subempresas[randomBetween(0, subempresas.length - 1)].id,
      fecha:       daysAgo(diasAtras),
    });
  }

  // Crear movimientos
  for (const mov of movimientosData) {
    await prisma.movimiento.create({ data: mov });
  }
  console.log(`✓ ${movimientosData.length} movimientos creados`);

  // ── AUDITORÍA ─────────────────────────────────────────────────────────────
  const acciones = [
    { accion: 'LOGIN', modulo: 'auth' },
    { accion: 'CREAR_MOVIMIENTO', modulo: 'movimientos' },
    { accion: 'TRANSFERENCIA_CAJA', modulo: 'cajas' },
    { accion: 'RETIRO_SOCIO', modulo: 'socios' },
    { accion: 'CREAR_SUBEMPRESA', modulo: 'subempresas' },
  ];

  for (let i = 0; i < 20; i++) {
    const acc = acciones[randomBetween(0, acciones.length - 1)];
    await prisma.auditoria.create({
      data: {
        usuarioId: userDemo.id,
        accion:    acc.accion,
        modulo:    acc.modulo,
        detalle:   JSON.stringify({ demo: true, index: i }),
        ip:        '127.0.0.1',
        creadoEn:  daysAgo(randomBetween(0, 30)),
      }
    });
  }
  console.log('✓ Registros de auditoría creados');

  console.log('\n🎉 ¡Datos de demo sembrados exitosamente!');
  console.log('📧 Email:    demo@cashflow.com');
  console.log('🔑 Password: demo123');
}

main()
  .catch(e => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
