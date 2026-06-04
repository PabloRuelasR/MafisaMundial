import React, {
    useEffect,
    useState
} from 'react';

import {
    collection,
    getDocs,
    query,
    where,
    updateDoc,
    doc
} from 'firebase/firestore';

import { db } from '../services/firebase';

import { auditMatch } from '../services/audit';

export default function AdminPanel() {

    const [matches, setMatches] = useState([]);

    const [scores, setScores] = useState({});

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadTodayMatches();

    }, []);

    const loadTodayMatches = async () => {

        try {

            const today = new Date();

            const yyyy = today.getFullYear();

            const mm = String(
                today.getMonth() + 1
            ).padStart(2, '0');

            const dd = String(
                today.getDate()
            ).padStart(2, '0');

            const fechaHoy =
                `${yyyy}-${mm}-${dd}`;

            const q = query(
                collection(db, 'partidos'),
                where('fechaPartido', '==', fechaHoy)
            );

            const snapshot = await getDocs(q);

            const data = snapshot.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data()
            }));

            setMatches(data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }
    };

    const handleAudit = async (match) => {

        const score1 =
            Number(scores[`${match.id}_1`]);

        const score2 =
            Number(scores[`${match.id}_2`]);

        if (
            isNaN(score1) ||
            isNaN(score2)
        ) {
            alert('Ingresa ambos scores');
            return;
        }

        try {

            // Actualizar partido
            await updateDoc(
                doc(db, 'partidos', match.id),
                {
                    marcador1: score1,
                    marcador2: score2,

                    resultadoOficial:
                        score1 > score2
                            ? 'LOCAL'
                            : score1 < score2
                                ? 'VISITA'
                                : 'EMPATE',

                    estado: 'finalizado'
                }
            );

            // Auditar
            await auditMatch(
                match.id,
                score1,
                score2
            );

            alert('Partido auditado');

            await loadTodayMatches();

        } catch (error) {

            console.error(error);

            alert('Error auditando');
        }
    };

    if (loading) {

        return (
            <div className="text-white">
                Cargando admin...
            </div>
        );
    }

    return (
        <div className="w-full">

            {matches.length === 0 && (

                <div className="text-slate-400 text-center py-10">
                    No hay partidos hoy
                </div>

            )}

            <div className="space-y-6">

                {matches.map((match) => {

                    const auditado =
                        match.estado === 'finalizado';

                    return (
                        <div
                            key={match.id}
                            className="bg-slate-900 border border-slate-700 rounded-3xl p-6"
                        >

                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                                {/* EQUIPO 1 */}
                                <div className="flex items-center gap-4">

                                    <img
                                        src={`https://flagcdn.com/w80/${match.flag1}.png`}
                                        className="w-14 h-10 rounded"
                                    />

                                    <div>

                                        <div className="font-black text-xl">
                                            {match.equipo1}
                                        </div>

                                    </div>

                                </div>

                                {/* SCORE */}
                                <div className="flex items-center gap-4">

                                    <input
                                        type="number"
                                        min="0"
                                        disabled={auditado}
                                        defaultValue={match.marcador1 ?? ''}
                                        onChange={(e) =>
                                            setScores(prev => ({
                                                ...prev,
                                                [`${match.id}_1`]:
                                                    e.target.value
                                            }))
                                        }
                                        className="w-24 bg-slate-800 border border-slate-600 rounded-xl p-4 text-center text-3xl font-black"
                                    />

                                    <span className="text-3xl font-black">
                                        -
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        disabled={auditado}
                                        defaultValue={match.marcador2 ?? ''}
                                        onChange={(e) =>
                                            setScores(prev => ({
                                                ...prev,
                                                [`${match.id}_2`]:
                                                    e.target.value
                                            }))
                                        }
                                        className="w-24 bg-slate-800 border border-slate-600 rounded-xl p-4 text-center text-3xl font-black"
                                    />

                                </div>

                                {/* EQUIPO 2 */}
                                <div className="flex items-center gap-4">

                                    <img
                                        src={`https://flagcdn.com/w80/${match.flag2}.png`}
                                        className="w-14 h-10 rounded"
                                    />

                                    <div>

                                        <div className="font-black text-xl">
                                            {match.equipo2}
                                        </div>

                                    </div>

                                </div>

                            </div>

                            {/* FOOTER */}
                            <div className="mt-8 flex items-center justify-between">

                                <div>

                                    <div className="text-slate-400 text-sm">
                                        Hora
                                    </div>

                                    <div className="font-bold">
                                        {match.horaPartido}
                                    </div>

                                </div>

                                {!auditado && (

                                    <button
                                        onClick={() =>
                                            handleAudit(match)
                                        }
                                        className="px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black transition-all"
                                    >
                                        Auditar Partido
                                    </button>

                                )}

                                {auditado && (

                                    <div className="px-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-bold">
                                        ✓ Partido auditado
                                    </div>

                                )}

                            </div>

                        </div>
                    );
                })}

            </div>

        </div>
    );
}