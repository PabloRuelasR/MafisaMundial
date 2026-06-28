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
  marcador2
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

    const acertoGanador =
      pred.resultadoPronosticado === resultadoOficial;

    const acertoScoreExacto =
      pred.score1 === marcador1 && pred.score2 === marcador2;

    const puntosGanador = acertoGanador ? 1 : 0;
    const puntosScore = acertoScoreExacto ? 3 : 0;
    const puntosTotales = puntosGanador + puntosScore;

    batch.update(docSnap.ref, {
      acertoGanador,
      acertoScoreExacto,
      puntosGanador,
      puntosScore,
      puntosTotales,
      auditado: true,
      marcadorOficial1: marcador1,
      marcadorOficial2: marcador2,
    });

    const userRef = doc(db, 'usuarios', pred.uid);

    batch.update(userRef, {
      puntosTotal: increment(puntosTotales)
    });
  });

  await batch.commit();
};