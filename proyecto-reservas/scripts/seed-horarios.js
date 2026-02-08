// Script para crear horarios de operación para todos los espacios
import prisma from '../../prisma/client.js';

async function seedHorarios() {
  try {
    console.log('Obteniendo espacios...');
    const espacios = await prisma.espacio.findMany();
    
    if (espacios.length === 0) {
      console.log('No hay espacios en la base de datos');
      return;
    }

    console.log(`Encontrados ${espacios.length} espacios`);

    // Horarios de operación estándar: Lunes a Domingo, 8:00 - 22:00
    // Intervalos de 60 minutos (1 hora por reserva)
    const diasSemana = [0, 1, 2, 3, 4, 5, 6]; // 0=Domingo, 1=Lunes, ..., 6=Sábado

    for (const espacio of espacios) {
      console.log(`\nConfigurando horarios para: ${espacio.nombre}`);
      
      // Verificar si ya tiene horarios
      const horariosExistentes = await prisma.horario.findMany({
        where: { espacioId: espacio.id }
      });

      if (horariosExistentes.length > 0) {
        console.log(`  ⚠️  Ya tiene ${horariosExistentes.length} horarios configurados, saltando...`);
        continue;
      }

      // Crear horarios para todos los días de la semana
      for (const dia of diasSemana) {
        await prisma.horario.create({
          data: {
            espacioId: espacio.id,
            diaSemana: dia,
            horaApertura: '08:00',
            horaCierre: '22:00',
            intervalo: 60, // 60 minutos por slot
            activo: true
          }
        });
      }
      
      console.log(`  ✅ Horarios creados para 7 días (8:00 - 22:00)`);
    }

    console.log('\n✅ Horarios de operación configurados exitosamente!');
    
  } catch (error) {
    console.error('Error al crear horarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedHorarios();
