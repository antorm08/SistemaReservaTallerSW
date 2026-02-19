import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function seed() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuario administrador
  const hashedPassword = await hashPassword('admin123');
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@deportivo.com' },
    update: {},
    create: {
      email: 'admin@deportivo.com',
      password: hashedPassword,
      nombre: 'Administrador',
      telefono: '555-0001',
      rol: 'admin',
    },
  });
  console.log('✅ Usuario administrador creado:', admin.email);

  // Crear espacios deportivos
  const espacios = [
    { 
      nombre: 'Cancha Fútbol 5 - A', 
      tipo: 'futbol5', 
      capacidad: 10, 
      precioHora: 50,
      precioMedia: 30,
      techado: true,
      iluminacion: true,
      descripcion: 'Cancha de fútbol 5 con césped sintético de última generación'
    },
    { 
      nombre: 'Cancha Fútbol 5 - B', 
      tipo: 'futbol5', 
      capacidad: 10, 
      precioHora: 50,
      precioMedia: 30,
      techado: false,
      iluminacion: true,
      descripcion: 'Cancha de fútbol 5 al aire libre'
    },
    { 
      nombre: 'Cancha Fútbol 7', 
      tipo: 'futbol7', 
      capacidad: 14, 
      precioHora: 70,
      precioMedia: 40,
      techado: false,
      iluminacion: true,
      descripcion: 'Cancha de fútbol 7 profesional'
    },
    { 
      nombre: 'Cancha Fútbol 11', 
      tipo: 'futbol11', 
      capacidad: 22, 
      precioHora: 100,
      techado: false,
      iluminacion: true,
      estacionamiento: true,
      descripcion: 'Cancha de fútbol 11 reglamentaria con tribunas'
    },
    { 
      nombre: 'Cancha Básquet', 
      tipo: 'basquet', 
      capacidad: 10, 
      precioHora: 40,
      precioMedia: 25,
      techado: true,
      iluminacion: true,
      vestuarios: true,
      descripcion: 'Cancha de básquetbol techada con piso sintético'
    },
    { 
      nombre: 'Cancha Vóley', 
      tipo: 'voley', 
      capacidad: 12, 
      precioHora: 35,
      precioMedia: 20,
      techado: false,
      iluminacion: true,
      descripcion: 'Cancha de vóley con arena'
    },
    { 
      nombre: 'Piscina Olímpica', 
      tipo: 'piscina', 
      capacidad: 30, 
      precioHora: 60,
      iluminacion: true,
      vestuarios: true,
      estacionamiento: true,
      descripcion: 'Piscina temperada 25x50m con vestuarios y duchas'
    },
    { 
      nombre: 'Gimnasio Principal', 
      tipo: 'gimnasio', 
      capacidad: 20, 
      precioHora: 30,
      techado: true,
      iluminacion: true,
      vestuarios: true,
      estacionamiento: true,
      descripcion: 'Gimnasio equipado con máquinas de última generación'
    },
  ];

  const espaciosCreados = [];
  for (const espacio of espacios) {
    const espacioCreado = await prisma.espacio.upsert({
      where: { nombre: espacio.nombre },
      update: {},
      create: { ...espacio, orden: espacios.indexOf(espacio) + 1 },
    });
    espaciosCreados.push(espacioCreado);
  }
  console.log('✅ Espacios deportivos creados:', espacios.length);

  // Crear horarios de operación para cada espacio
  // Horario estándar: Lunes a Viernes 6:00-23:00, Sábado y Domingo 7:00-22:00
  for (const espacio of espaciosCreados) {
    // Lunes a Viernes (1-5)
    for (let dia = 1; dia <= 5; dia++) {
      await prisma.horario.create({
        data: {
          espacioId: espacio.id,
          diaSemana: dia,
          horaApertura: '06:00',
          horaCierre: '23:00',
          intervalo: 60, // Turnos de 1 hora
          activo: true,
        },
      });
    }
    
    // Sábado (6)
    await prisma.horario.create({
      data: {
        espacioId: espacio.id,
        diaSemana: 6,
        horaApertura: '08:00',
        horaCierre: '18:00',
        intervalo: 60,
        activo: true,
      },
    });
    
    // Domingo (0)
    await prisma.horario.create({
      data: {
        espacioId: espacio.id,
        diaSemana: 0,
        horaApertura: '10:00',
        horaCierre: '16:00',
        intervalo: 60,
        activo: true,
      },
    });
  }
  console.log('✅ Horarios de operación configurados para todos los espacios');

  console.log('🎉 Seed completado exitosamente!');
}

seed()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
