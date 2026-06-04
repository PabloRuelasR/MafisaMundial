import {
  collection,
  addDoc
} from 'firebase/firestore';

import { db } from './firebase';

export const seedMatches = async () => {

  const matches = [
    {
      fechaPartido: '2026-06-11',
      horaPartido: '19:00',

      equipo1: 'México',
      equipo2: 'Sudáfrica',

      flag1: 'mx',
      flag2: 'za',

      marcador1: null,
      marcador2: null,

      resultadoOficial: null,

      estado: 'pendiente',

      createdAt: Date.now()
    },

    {
      fechaPartido: '2026-06-11',
      horaPartido: '22:00',

      equipo1: 'Corea del Sur',
      equipo2: 'República Checa',

      flag1: 'kr',
      flag2: 'cz',

      marcador1: null,
      marcador2: null,

      resultadoOficial: null,

      estado: 'pendiente',

      createdAt: Date.now()
    }
  ];

  for (const match of matches) {
    await addDoc(collection(db, 'partidos'), match);
  }

  console.log('Partidos creados');
};