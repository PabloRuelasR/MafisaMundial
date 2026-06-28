// src/services/audit.js
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  increment
} from 'firebase/firestore';
import { db } from './firebase';

export const auditMatch = async (
  partidoId,
  marcador1,
  marcador2,
  huboAlargueOficial // Nuevo parámetro: true o false
) => {

  const resultadoOficial =
    marcador1 > marcador2
      ? 'LOCAL'
      : marcador1 < marcador2
        ? 'VISITA'
        : 'EMPATE';

  const q = query(
    collection(db, 'pronosticos'),
    where('partidoId', '==', partidoId)
  );

  const snapshot = await getDocs(q);
  const batch = writeBatch(db);

  snapshot.docs.forEach((docSnap) => {
    const pred = docSnap.data();

    // 1. Cálculo de puntos por Score y Ganador
    const acertoGanador = pred.resultadoPronosticado === resultadoOficial;
    const acertoScoreExacto = pred.score1 === marcador1 && pred.score2 === marcador2;

    const puntosGanador = acertoGanador ? 1 : 0;
    const puntosScore = acertoScoreExacto ? 3 : 0;

    // 2. Nueva lógica: Validación de Tiempo de Alargue
    // Se asume que pred.pronosticoAlargue viene como true o false desde el cliente
    const acertoAlargue = pred.pronosticoAlargue === huboAlargueOficial;
    const puntosAlargue = acertoAlargue ? 2 : -2;

    // Puntos obtenidos en este partido en específico
    const puntosTotalesPartido = puntosGanador + puntosScore + puntosAlargue;

    batch.update(docSnap.ref, {
      acertoGanador,
      acertoScoreExacto,
      acertoAlargue,
      puntosGanador,
      puntosScore,
      puntosAlargue,
      puntosTotales: puntosTotalesPartido,
      auditado: true,
      marcadorOficial1: marcador1,
      marcadorOficial2: marcador2,
      huboAlargueOficial
    });

    const userRef = doc(db, 'usuarios', pred.uid);
    
    // Se incrementa (o decrementa si es negativo) el acumulado global del usuario
    batch.update(userRef, {
      puntosTotal: increment(puntosTotalesPartido)
    });
  });

  await batch.commit();
};