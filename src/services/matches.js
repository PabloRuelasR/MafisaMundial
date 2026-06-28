import { collection, doc, setDoc } from 'firebase/firestore'; // <-- Cambiado aquí
import { db } from './firebase';
import worldcupData from '../data/worldcup.json';

const flagMap = {
    "Mexico": "mx", "South Africa": "za", "South Korea": "kr", "Czech Republic": "cz",
    "Canada": "ca", "Bosnia & Herzegovina": "ba", "Qatar": "qa", "Switzerland": "ch",
    "Brazil": "br", "Morocco": "ma", "Haiti": "ht", "Scotland": "gb-sct",
    "USA": "us", "Paraguay": "py", "Australia": "au", "Turkey": "tr",
    "Germany": "de", "Curaçao": "cw", "Ivory Coast": "ci", "Ecuador": "ec",
    "Netherlands": "nl", "Japan": "jp", "Sweden": "se", "Tunisia": "tn",
    "Belgium": "be", "Egypt": "eg", "Iran": "ir", "New Zealand": "nz",
    "Spain": "es", "Cape Verde": "cv", "Saudi Arabia": "sa", "Uruguay": "uy",
    "France": "fr", "Senegal": "sn", "Iraq": "iq", "Norway": "no",
    "Argentina": "ar", "Algeria": "dz", "Austria": "at", "Jordan": "jo",
    "Portugal": "pt", "DR Congo": "cd", "Uzbekistan": "uz", "Colombia": "co",
    "England": "gb-eng", "Croatia": "hr", "Ghana": "gh", "Panama": "pa"
};

export const seedMatches = async () => {
    const groupMatches = worldcupData.matches.filter(m => m.round.includes("Matchday"));

    for (const match of groupMatches) {
        const matchDoc = {
            fechaPartido: match.date,
            horaPartido: match.time,
            equipo1: match.team1,
            equipo2: match.team2,
            flag1: flagMap[match.team1] || "un",
            flag2: flagMap[match.team2] || "un",
            marcador1: null,
            marcador2: null,
            resultadoOficial: null,
            estado: 'pendiente',
            createdAt: Date.now()
        };

        // Creamos un ID ÚNICO juntando los nombres de los equipos (ej: Mexico_SouthAfrica)
        const matchId = `${match.team1}_${match.team2}`.replace(/\s+/g, '_');

        // Usamos setDoc para que, si el ID ya existe, solo lo actualice y no lo duplique
        await setDoc(doc(db, 'partidos', matchId), matchDoc);
    }
    
    console.log('Todos los partidos insertados correctamente (Cero duplicados).');
};

/**
 * Registra los partidos de la fase final en Firebase.
 * @param {Array} knockoutMatches - Arreglo con los partidos ya definidos.
 */
export const seedKnockoutMatches = async (knockoutMatches) => {
    try {
        for (const match of knockoutMatches) {
            const matchDoc = {
                fechaPartido: match.date,
                horaPartido: match.time,
                equipo1: match.team1,
                equipo2: match.team2,
                flag1: flagMap[match.team1] || "un",
                flag2: flagMap[match.team2] || "un",
                marcador1: null,
                marcador2: null,
                resultadoOficial: null,
                estado: 'pendiente',
                fase: match.round || 'Eliminatorias', // Campo opcional para identificar la fase
                createdAt: Date.now()
            };

            // Creamos el ID ÚNICO juntando los nombres de los equipos
            const matchId = `${match.team1}_${match.team2}`.replace(/\s+/g, '_');

            // Usamos setDoc para crear o actualizar sin duplicar
            await setDoc(doc(db, 'partidos', matchId), matchDoc);
        }
        
        console.log('✅ Partidos de la fase final insertados correctamente.');
    } catch (error) {
        console.error('❌ Error al insertar partidos de la fase final:', error);
    }
};