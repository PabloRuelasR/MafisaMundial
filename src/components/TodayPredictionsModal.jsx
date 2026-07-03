import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { traducirPais } from '../js/Utils/traductor';

const getPeruDate = () => {
    const date = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Lima" }));
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export default function TodayPredictionsModal({ onClose, participantes }) {
    const [matches, setMatches] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        loadTodayData();

        // Refresco automático cada minuto (60000 ms)
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    const loadTodayData = async () => {
        try {
            const today = getPeruDate();

            // Partidos de hoy
            const qPartidos = query(
                collection(db, 'partidos'),
                where('fechaPartido', '==', today)
            );
            const snapPartidos = await getDocs(qPartidos);
            const matchesData = snapPartidos.docs.map(d => ({ id: d.id, ...d.data() }));

            // Ordenar los partidos por su hora de inicio (de más temprano a más tarde)
            matchesData.sort((a, b) => {
                const timeA = a.hora || a.horaPartido || "23:59";
                const timeB = b.hora || b.horaPartido || "23:59";
                return timeA.localeCompare(timeB);
            });

            // Pronósticos de hoy
            const qPronos = query(
                collection(db, 'pronosticos'),
                where('fechaPartido', '==', today)
            );
            const snapPronos = await getDocs(qPronos);
            const pronosData = snapPronos.docs.map(d => ({ id: d.id, ...d.data() }));

            setMatches(matchesData);
            setPredictions(pronosData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Función para evaluar si falta 1 hora o menos para el partido
    const canShowPredictions = (match) => {
        let matchDateStr;

        if (match.fecha_inicio) {
            matchDateStr = match.fecha_inicio;
        } else if (match.fechaPartido && match.hora) {
            matchDateStr = `${match.fechaPartido}T${match.hora}`;
            if (match.hora.length === 5) matchDateStr += ':00';
        } else if (match.fechaPartido && match.horaPartido) {
            matchDateStr = `${match.fechaPartido}T${match.horaPartido}`;
            if (match.horaPartido.length === 5) matchDateStr += ':00';
        }

        if (!matchDateStr) return false;

        const matchDate = new Date(matchDateStr);
        const now = currentTime;

        const oneHourInMs = 3600000;
        const timeDifference = matchDate.getTime() - now.getTime();

        return timeDifference <= oneHourInMs;
    };

    return (
        <div className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
            <div className="w-full max-w-6xl h-[90vh] flex flex-col rounded-[2rem] border border-slate-700 bg-[#081226] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>

                {/* CABECERA CENTRADA */}
                <div className="relative shrink-0 p-6 sm:p-8 border-b border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center text-center">
                    <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                        Pronósticos de Hoy
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm">
                        Apuestas registradas para los partidos de la fecha actual.
                    </p>
                    {/* Botón Cerrar en posición absoluta */}
                    <button onClick={onClose} className="absolute top-6 right-6 sm:top-8 sm:right-8 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-xl flex items-center justify-center transition-colors text-white">
                        ×
                    </button>
                </div>

                {/* CONTENIDO */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>
                    ) : matches.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 font-bold">No hay partidos programados para hoy.</div>
                    ) : (
                        <div className="space-y-8">
                            {matches.map(match => {
                                const matchPredictions = predictions.filter(p => p.partidoId === match.id);
                                const showPicks = canShowPredictions(match);

                                return (
                                    <div key={match.id} className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
                                        
                                        {/* HEADER DEL PARTIDO */}
                                        <div className="bg-slate-950 p-4 flex flex-col sm:flex-row items-center justify-center border-b border-slate-800">
                                            <div className="flex items-center justify-center gap-6 w-full sm:w-auto">
                                                <div className="flex items-center gap-3 w-1/3 justify-end min-w-[120px]">
                                                    <span className="font-black text-sm sm:text-lg uppercase text-slate-300 text-right">{traducirPais(match.equipo1)}</span>
                                                    <img src={`https://flagcdn.com/w40/${match.flag1}.png`} className="w-8 h-6 rounded" alt="" />
                                                </div>
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="font-black text-slate-500 text-xl">VS</div>
                                                    <div className="text-xs font-bold text-orange-400 mt-1">
                                                        {match.hora || match.horaPartido || ""}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 w-1/3 justify-start min-w-[120px]">
                                                    <img src={`https://flagcdn.com/w40/${match.flag2}.png`} className="w-8 h-6 rounded" alt="" />
                                                    <span className="font-black text-sm sm:text-lg uppercase text-slate-300 text-left">{traducirPais(match.equipo2)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* RENDERIZADO CONDICIONAL DE PRONÓSTICOS */}
                                        {showPicks ? (
                                            <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-slate-900">
                                                {participantes.map(user => {
                                                    const pr = matchPredictions.find(p => p.uid === user.uid);
                                                    return (
                                                        <div key={user.uid} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between hover:bg-slate-800 transition-colors">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <img src={user.img} className="w-8 h-8 rounded-full border border-slate-600 shrink-0" alt="" />
                                                                <span className="text-xs font-bold text-slate-300 truncate">{user.nombre}</span>
                                                            </div>
                                                            <div className="bg-slate-950 px-3 py-1.5 rounded-lg text-sm font-black tracking-wider border border-slate-700 shrink-0">
                                                                {pr ? <span className="text-white">{pr.score1} - {pr.score2}</span> : <span className="text-red-500/50">S/R</span>}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-8 flex flex-col items-center justify-center bg-slate-900/40">
                                                <span className="text-4xl mb-3">🔒</span>
                                                <p className="text-slate-400 text-sm text-center font-medium">
                                                    Los pronósticos están ocultos.<br />
                                                    <span className="text-orange-400/80 mt-1 inline-block">
                                                        Se revelarán 1 hora antes del inicio del partido.
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}