import React, {
    useEffect,
    useState
} from 'react';

import {
    collection,
    query,
    where,
    getDocs,
    orderBy
} from 'firebase/firestore';

import { db } from '../services/firebase';

export default function MyPredictionsModal({
    currentUser,
    onClose
}) {

    const [predictions, setPredictions] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadPredictions();

    }, []);

    const loadPredictions = async () => {

        try {

            const q = query(
                collection(db, 'pronosticos'),
                where('uid', '==', currentUser.uid)
            );

            const snapshot = await getDocs(q);

            const data = snapshot.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data()
            }));

            data.sort((a, b) =>
                b.fechaPartido.localeCompare(a.fechaPartido)
            );

            setPredictions(data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }
    };

    if (loading) {

        return (
            <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-md">
                <div className="text-white text-xl">
                    Cargando...
                </div>
            </div>
        );
    }

    return (
        <div
            className="
                fixed inset-0 z-[600]
                bg-black/80 backdrop-blur-md
                flex items-center justify-center
                p-4
            "
            onClick={onClose}
        >

            <div
                className="
                    w-full max-w-6xl
                    max-h-[90vh]
                    overflow-y-auto
                    rounded-3xl
                    border border-slate-700
                    bg-[#081226]
                    p-8
                    custom-scrollbar
                "
                onClick={(e) => e.stopPropagation()}
            >

                {/* HEADER */}
                <div className="flex items-center justify-between mb-10">

                    <div>

                        <h2 className="text-4xl font-black">
                            Mis Pronósticos
                        </h2>

                        <p className="text-slate-400 mt-2">
                            Historial completo de partidos
                        </p>

                    </div>

                    <button
                        onClick={onClose}
                        className="
                            w-12 h-12 rounded-full
                            bg-slate-800 hover:bg-slate-700
                            text-2xl
                        "
                    >
                        ×
                    </button>

                </div>

                {/* EMPTY */}
                {
                    predictions.length === 0 && (
                        <div className="text-center py-20 text-slate-400">
                            No tienes pronósticos aún
                        </div>
                    )
                }

                {/* LIST */}
                <div className="space-y-6">

                    {predictions.map((pred) => {

                        const finalizado =
                            pred.auditado;

                        return (
                            <div
                                key={pred.id}
                                className="
                                    bg-slate-900
                                    border border-slate-700
                                    rounded-3xl
                                    p-6
                                "
                            >

                                {/* TOP */}
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

                                    {/* EQUIPO 1 */}
                                    <div className="flex items-center gap-4">

                                        <img
                                            src={`https://flagcdn.com/w80/${pred.flag1}.png`}
                                            className="w-14 h-10 rounded"
                                        />

                                        <div>

                                            <div className="font-black text-xl">
                                                {pred.equipo1}
                                            </div>

                                        </div>

                                    </div>

                                    {/* RESULTADOS */}
                                    <div className="text-center">

                                        <div className="text-slate-400 text-sm mb-3">
                                            Tu Pronóstico
                                        </div>

                                        <div className="flex items-center justify-center gap-3">

                                            <div className="
                                                w-16 h-16 rounded-2xl
                                                bg-yellow-500/20
                                                border border-yellow-500
                                                flex items-center justify-center
                                                text-3xl font-black
                                            ">
                                                {pred.score1}
                                            </div>

                                            <div className="text-3xl font-black">
                                                -
                                            </div>

                                            <div className="
                                                w-16 h-16 rounded-2xl
                                                bg-yellow-500/20
                                                border border-yellow-500
                                                flex items-center justify-center
                                                text-3xl font-black
                                            ">
                                                {pred.score2}
                                            </div>

                                        </div>

                                    </div>

                                    {/* EQUIPO 2 */}
                                    <div className="flex items-center gap-4">

                                        <img
                                            src={`https://flagcdn.com/w80/${pred.flag2}.png`}
                                            className="w-14 h-10 rounded"
                                        />

                                        <div>

                                            <div className="font-black text-xl">
                                                {pred.equipo2}
                                            </div>

                                        </div>

                                    </div>

                                </div>

                                {/* RESULTADO OFICIAL */}
                                {
                                    finalizado && (
                                        <div className="
                                            mt-8
                                            bg-slate-800/70
                                            rounded-2xl
                                            p-6
                                        ">

                                            <div className="grid md:grid-cols-4 gap-6">

                                                {/* SCORE OFICIAL */}
                                                <div>

                                                    <div className="text-slate-400 text-sm mb-2">
                                                        Resultado Oficial
                                                    </div>

                                                    <div className="text-3xl font-black">
                                                        {pred.marcadorOficial1}
                                                        {' '}
                                                        -
                                                        {' '}
                                                        {pred.marcadorOficial2}
                                                    </div>

                                                </div>

                                                {/* GANADOR */}
                                                <div>

                                                    <div className="text-slate-400 text-sm mb-2">
                                                        Acertó Ganador
                                                    </div>

                                                    <div className={`
                                                        text-xl font-black
                                                        ${pred.acertoGanador
                                                            ? 'text-emerald-400'
                                                            : 'text-red-400'
                                                        }
                                                    `}>
                                                        {
                                                            pred.acertoGanador
                                                                ? '✓ Sí'
                                                                : '✗ No'
                                                        }
                                                    </div>

                                                </div>

                                                {/* SCORE */}
                                                <div>

                                                    <div className="text-slate-400 text-sm mb-2">
                                                        Score Exacto
                                                    </div>

                                                    <div className={`
                                                        text-xl font-black
                                                        ${pred.acertoScoreExacto
                                                            ? 'text-emerald-400'
                                                            : 'text-red-400'
                                                        }
                                                    `}>
                                                        {
                                                            pred.acertoScoreExacto
                                                                ? '✓ Sí'
                                                                : '✗ No'
                                                        }
                                                    </div>

                                                </div>

                                                {/* PUNTOS */}
                                                <div>

                                                    <div className="text-slate-400 text-sm mb-2">
                                                        Puntos Ganados
                                                    </div>

                                                    <div className="
                                                        text-4xl font-black
                                                        text-yellow-400
                                                    ">
                                                        +{pred.puntosTotales}
                                                    </div>

                                                </div>

                                            </div>

                                        </div>
                                    )
                                }

                                {/* PENDIENTE */}
                                {
                                    !finalizado && (
                                        <div className="
                                            mt-8
                                            px-5 py-4
                                            rounded-2xl
                                            bg-yellow-500/10
                                            border border-yellow-500/30
                                            text-yellow-300
                                            font-bold
                                        ">
                                            ⏳ Pendiente de auditoría
                                        </div>
                                    )
                                }

                            </div>
                        );
                    })}

                </div>

            </div>

        </div>
    );
}