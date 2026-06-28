import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

import { db } from './firebase';

export const getAllMatches = async () => {
  const q = query(
    collection(db, 'partidos'),
    orderBy('fechaPartido', 'asc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  }));
};

export const getUserPredictions = async (uid) => {
  const q = query(
    collection(db, 'pronosticos'),
    where('uid', '==', uid)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  }));
};

export const savePrediction = async ({
  uid,
  partido,
  score1,
  score2
}) => {

  const predictionId = `${uid}_${partido.id}`;

  const resultadoPronosticado =
    score1 > score2
      ? 'LOCAL'
      : score1 < score2
        ? 'VISITA'
        : 'EMPATE';

  const predictionData = {
    uid,
    partidoId: partido.id,
    fechaPartido: partido.fechaPartido,
    equipo1: partido.equipo1,
    equipo2: partido.equipo2,
    flag1: partido.flag1,
    flag2: partido.flag2,
    score1,
    score2,
    resultadoPronosticado,
    acertoGanador: false,
    acertoScoreExacto: false,
    puntosGanador: 0,
    puntosScore: 0,
    puntosTotales: 0,
    auditado: false,
    createdAt: serverTimestamp()
  };

  await setDoc(
    doc(db, 'pronosticos', predictionId),
    predictionData
  );
};