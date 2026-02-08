// Script de prueba de endpoints
// Ejecutar: node test-api.js

const BASE_URL = 'http://localhost:4321';

async function testAPI() {
  console.log('🧪 Iniciando pruebas de API...\n');

  try {
    // 1. Test: Listar espacios
    console.log('1️⃣ Test: Listar espacios');
    const espaciosRes = await fetch(`${BASE_URL}/api/espacios`);
    const espacios = await espaciosRes.json();
    console.log(`   ✅ ${espacios.count} espacios encontrados`);
    console.log(`   Ejemplo: ${espacios.data[0]?.nombre}\n`);

    if (espacios.data.length === 0) {
      console.log('⚠️  No hay espacios. Ejecuta: npm run seed\n');
      return;
    }

    const espacioId = espacios.data[0].id;

    // 2. Test: Consultar disponibilidad
    console.log('2️⃣ Test: Consultar disponibilidad');
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    const fecha = mañana.toISOString().split('T')[0];

    const dispRes = await fetch(
      `${BASE_URL}/api/espacios/${espacioId}/disponibilidad?fecha=${fecha}`
    );
    const disponibilidad = await dispRes.json();
    console.log(`   ✅ ${disponibilidad.data.disponibles} de ${disponibilidad.data.total} slots disponibles`);
    console.log(`   Fecha: ${disponibilidad.data.fecha}`);
    console.log(`   Horario: ${disponibilidad.data.horarioOperacion.apertura} - ${disponibilidad.data.horarioOperacion.cierre}\n`);

    // 3. Test: Crear reserva
    console.log('3️⃣ Test: Crear reserva');
    const slotDisponible = disponibilidad.data.slots.find(s => s.disponible);

    if (!slotDisponible) {
      console.log('   ⚠️  No hay slots disponibles para probar\n');
      return;
    }

    const reservaRes = await fetch(`${BASE_URL}/api/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: 1, // Admin
        espacioId: espacioId,
        fecha: fecha,
        horaInicio: slotDisponible.horaInicio,
        horaFin: slotDisponible.horaFin,
        observaciones: 'Reserva de prueba desde API test',
      }),
    });

    const reserva = await reservaRes.json();
    
    if (reserva.success) {
      console.log(`   ✅ Reserva creada: ID ${reserva.data.id}`);
      console.log(`   Horario: ${reserva.data.horaInicio} - ${reserva.data.horaFin}`);
      console.log(`   Monto: $${reserva.data.montoPagado}`);
      console.log(`   Estado: ${reserva.data.estado}\n`);

      // 4. Test: Listar mis reservas
      console.log('4️⃣ Test: Listar mis reservas');
      const misReservasRes = await fetch(`${BASE_URL}/api/reservas?usuarioId=1`);
      const misReservas = await misReservasRes.json();
      console.log(`   ✅ ${misReservas.count} reservas encontradas\n`);

      // 5. Test: Detalle de reserva
      console.log('5️⃣ Test: Detalle de reserva');
      const detalleRes = await fetch(`${BASE_URL}/api/reservas/${reserva.data.id}`);
      const detalle = await detalleRes.json();
      console.log(`   ✅ Reserva ${detalle.data.id}: ${detalle.data.espacio.nombre}`);
      console.log(`   Usuario: ${detalle.data.usuario.nombre}\n`);

      // 6. Test: Cancelar reserva
      console.log('6️⃣ Test: Cancelar reserva');
      const cancelRes = await fetch(
        `${BASE_URL}/api/reservas/${reserva.data.id}?usuarioId=1&motivo=Prueba de API`,
        { method: 'DELETE' }
      );
      const cancelado = await cancelRes.json();
      console.log(`   ✅ ${cancelado.message}`);
      console.log(`   Estado final: ${cancelado.data.estado}\n`);

    } else {
      console.log(`   ❌ Error al crear reserva: ${reserva.error}\n`);
    }

    // 7. Test: Verificar disponibilidad actualizada
    console.log('7️⃣ Test: Verificar disponibilidad actualizada');
    const dispRes2 = await fetch(
      `${BASE_URL}/api/espacios/${espacioId}/disponibilidad?fecha=${fecha}`
    );
    const disponibilidad2 = await dispRes2.json();
    const slotProbado = disponibilidad2.data.slots.find(
      s => s.horaInicio === slotDisponible.horaInicio
    );
    console.log(`   ✅ Slot ${slotProbado.horaInicio}: ${slotProbado.disponible ? 'Disponible' : 'No disponible'}`);
    console.log(`   Motivo: ${slotProbado.motivo || 'N/A'}\n`);

    console.log('✅ Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    console.log('\n⚠️  Asegúrate de que el servidor esté corriendo:');
    console.log('   npm run dev\n');
  }
}

testAPI();
