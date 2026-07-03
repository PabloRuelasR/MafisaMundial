import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { traducirPais } from '../js/Utils/traductor';

const getPeruDate = () => {
    const date = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Lima" }));
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export default function GeneralSummaryModal({ onClose, participantes }) {
    const [summaryData, setSummaryData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para los acordeones
    const [expandedDate, setExpandedDate] = useState(null);
    const [expandedPlayer, setExpandedPlayer] = useState(null);

    useEffect(() => {
        loadSummaryData();
    }, []);

    const loadSummaryData = async () => {
        try {
            // Obtener la fecha de hoy
            const today = getPeruDate();

            // 1. Traer todos los partidos
            const snapPartidos = await getDocs(collection(db, 'partidos'));
            const matchesMap = {};
            snapPartidos.docs.forEach(doc => {
                matchesMap[doc.id] = { id: doc.id, ...doc.data() };
            });

            // 2. Traer todos los pronósticos
            const snapPronos = await getDocs(collection(db, 'pronosticos'));
            const pronosData = snapPronos.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // 3. Agrupar la información por Fecha -> Jugador -> Pronósticos
            const datesMap = {};

            pronosData.forEach(pr => {
                const matchData = matchesMap[pr.partidoId];
                if (!matchData) return; 

                const date = matchData.fechaPartido;
                if (!date) return;
                
                // EXCLUIR EL DÍA ACTUAL: Si la fecha del partido es hoy, ignoramos este registro
                if (date === today) return;

                if (!datesMap[date]) datesMap[date] = {};
                if (!datesMap[date][pr.uid]) datesMap[date][pr.uid] = { totalPoints: 0, details: [] };

                // Hacemos el mapeo más robusto (acepta minúsculas o variaciones por si acaso)
                const realScore1 = matchData.marcadorOficial1 ?? matchData.marcadoroficial1 ?? matchData.resultado1;
                const realScore2 = matchData.marcadorOficial2 ?? matchData.marcadoroficial2 ?? matchData.resultado2;
                
                // Creamos una copia del partido para no mutar el original en cada iteración
                const match = { 
                    ...matchData, 
                    realScore1: realScore1, 
                    realScore2: realScore2 
                };

                let pts = 0;
                
                // Buscamos puntosTotales, aceptando también minúsculas
                const puntosRegistrados = pr.puntosTotales ?? pr.puntostotales;

                // Si ya guardas los puntos totales en la BD, los usa
                if (puntosRegistrados != null && puntosRegistrados !== "") {
                    pts = Number(puntosRegistrados);
                } 
                // Fallback: cálculo dinámico si el partido tiene marcador pero no hay puntos guardados
                else if (realScore1 != null && realScore2 != null && realScore1 !== "" && realScore2 !== "") {
                    const r1 = Number(realScore1);
                    const r2 = Number(realScore2);
                    const p1 = Number(pr.score1);
                    const p2 = Number(pr.score2);

                    if (r1 === p1 && r2 === p2) {
                        pts = 3; // EXACTO
                    } else if (
                        (r1 > r2 && p1 > p2) || 
                        (r1 < r2 && p1 < p2) || 
                        (r1 === r2 && p1 === p2) 
                    ) {
                        pts = 1; // TENDENCIA
                    }
                }
                
                datesMap[date][pr.uid].totalPoints += pts;
                datesMap[date][pr.uid].details.push({
                    match,
                    prediction: pr,
                    points: pts
                });
            });

            // 4. Transformar a un array ordenado por fecha (de más antiguo a más reciente)
            const sortedDatesArray = Object.keys(datesMap).sort((a, b) => a.localeCompare(b)).map(date => {
                const playersData = participantes.map(user => {
                    const pData = datesMap[date][user.uid] || { totalPoints: 0, details: [] };
                    return {
                        ...user,
                        totalPoints: pData.totalPoints,
                        details: pData.details
                    };
                });

                // Ordenar jugadores por puntos obtenidos en ese día (de mayor a menor)
                playersData.sort((a, b) => b.totalPoints - a.totalPoints);

                return {
                    date,
                    players: playersData
                };
            });

            setSummaryData(sortedDatesArray);
        } catch (error) {
            console.error("Error cargando resumen general:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDate = (date) => {
        setExpandedDate(expandedDate === date ? null : date);
        setExpandedPlayer(null); 
    };

    const togglePlayer = (playerId) => {
        setExpandedPlayer(expandedPlayer === playerId ? null : playerId);
    };

    return (
        <div className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6" onClick={onClose}>
            <div className="w-full max-w-5xl h-[95vh] sm:h-[90vh] flex flex-col rounded-[2rem] border border-slate-700 bg-[#081226] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>

                {/* CABECERA */}
                <div className="relative shrink-0 p-5 sm:p-8 border-b border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center text-center">
                    <h2 className="text-xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                        Resumen General por Día
                    </h2>
                    <p className="text-slate-400 mt-1 sm:mt-2 text-xs sm:text-sm">
                        Desglose de puntos obtenidos por cada jugador desde el inicio.
                    </p>
                    <button onClick={onClose} className="absolute top-4 right-4 sm:top-8 sm:right-8 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-lg sm:text-xl flex items-center justify-center transition-colors text-white">
                        ×
                    </button>
                </div>

                {/* CONTENIDO */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-6 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                        </div>
                    ) : summaryData.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 font-bold">Aún no hay datos registrados.</div>
                    ) : (
                        <div className="space-y-4">
                            {summaryData.map((dayData) => (
                                <div key={dayData.date} className="border border-slate-700 bg-slate-900/50 rounded-2xl overflow-hidden transition-all">
                                    {/* BOTÓN DE FECHA */}
                                    <button 
                                        onClick={() => toggleDate(dayData.date)}
                                        className="w-full px-4 sm:px-6 py-4 flex items-center justify-between bg-slate-800 hover:bg-slate-700/80 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl sm:text-2xl">📅</span>
                                            <span className="text-base sm:text-lg font-black text-slate-200">
                                                {dayData.date}
                                            </span>
                                        </div>
                                        <span className={`text-lg transition-transform ${expandedDate === dayData.date ? 'rotate-180' : ''} text-white`}>
                                            ▼
                                        </span>
                                    </button>

                                    {/* CONTENIDO DE LA FECHA (JUGADORES) */}
                                    {expandedDate === dayData.date && (
                                        <div className="p-2 sm:p-4 space-y-3 bg-slate-900">
                                            {dayData.players.map((player) => (
                                                <div key={player.uid} className="border border-slate-700/50 rounded-xl bg-slate-800/40 overflow-hidden">
                                                    
                                                    {/* BOTÓN DEL JUGADOR */}
                                                    <button 
                                                        onClick={() => togglePlayer(player.uid)}
                                                        className="w-full p-3 flex items-center justify-between hover:bg-slate-700/40 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <img src={player.img} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-slate-600" alt="" />
                                                            <span className="text-sm sm:text-base font-bold text-slate-300 truncate max-w-[100px] sm:max-w-none">{player.nombre}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 sm:gap-4">
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">Total Día</span>
                                                                <span className="text-base sm:text-lg font-black text-emerald-400">+{player.totalPoints} pts</span>
                                                            </div>
                                                            <span className={`text-xs sm:text-sm text-slate-500 transition-transform ${expandedPlayer === player.uid ? 'rotate-180' : ''}`}>
                                                                ▼
                                                            </span>
                                                        </div>
                                                    </button>

                                                    {/* DETALLES DE LOS PRONÓSTICOS DEL JUGADOR */}
                                                    {expandedPlayer === player.uid && (
                                                        <div className="p-3 sm:p-4 border-t border-slate-700/50 bg-[#0b1320]">
                                                            {player.details.length === 0 ? (
                                                                <p className="text-center text-sm text-slate-500 py-4">No registró pronósticos este día.</p>
                                                            ) : (
                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                                    {player.details.map((detail, idx) => {
                                                                        
                                                                        // Validamos de manera segura si debemos mostrar el marcador o el '- : -'
                                                                        const hasRealScore = detail.match.realScore1 != null && detail.match.realScore1 !== "" && 
                                                                                             detail.match.realScore2 != null && detail.match.realScore2 !== "";

                                                                        return (
                                                                            <div key={idx} className="flex flex-col bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden shadow-sm">
                                                                                
                                                                                {/* Cabecera del partido (Equipos) */}
                                                                                <div className="bg-slate-900/60 p-2 flex items-center justify-center gap-2 border-b border-slate-700/50">
                                                                                    <div className="flex items-center gap-2 justify-end w-2/5">
                                                                                        <span className="text-xs font-bold text-slate-300 truncate">{traducirPais(detail.match.equipo1)}</span>
                                                                                        <img src={`https://flagcdn.com/w40/${detail.match.flag1}.png`} className="w-5 h-3.5 rounded-sm object-cover" alt="" />
                                                                                    </div>
                                                                                    <span className="text-[10px] font-black text-slate-500 w-1/5 text-center">VS</span>
                                                                                    <div className="flex items-center gap-2 justify-start w-2/5">
                                                                                        <img src={`https://flagcdn.com/w40/${detail.match.flag2}.png`} className="w-5 h-3.5 rounded-sm object-cover" alt="" />
                                                                                        <span className="text-xs font-bold text-slate-300 truncate">{traducirPais(detail.match.equipo2)}</span>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Resultados y Puntos (3 Columnas) */}
                                                                                <div className="p-3 flex items-center justify-between">
                                                                                    {/* Real */}
                                                                                    <div className="flex flex-col items-center flex-1">
                                                                                        <span className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">Real</span>
                                                                                        <span className="text-sm font-black text-white bg-slate-950/50 px-3 py-1 rounded-lg border border-slate-700/50">
                                                                                            {hasRealScore 
                                                                                                ? `${detail.match.realScore1} - ${detail.match.realScore2}` 
                                                                                                : '- : -'}
                                                                                        </span>
                                                                                    </div>
                                                                                    
                                                                                    {/* Pronóstico */}
                                                                                    <div className="flex flex-col items-center flex-1 border-x border-slate-700/50">
                                                                                        <span className="text-[9px] text-cyan-500 uppercase tracking-wider mb-1">Tu Pick</span>
                                                                                        <span className="text-sm font-black text-cyan-400 bg-cyan-950/30 px-3 py-1 rounded-lg border border-cyan-900/50 shadow-[0_0_8px_rgba(6,182,212,0.1)]">
                                                                                            {detail.prediction.score1} - {detail.prediction.score2}
                                                                                        </span>
                                                                                    </div>

                                                                                    {/* Puntos */}
                                                                                    <div className="flex flex-col items-center flex-1">
                                                                                        <span className="text-[9px] text-emerald-500 uppercase tracking-wider mb-1">Puntos</span>
                                                                                        <span className={`text-sm font-black px-3 py-1 rounded-lg border shadow-sm ${detail.points > 0 ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60 shadow-emerald-500/10' : 'text-slate-500 bg-slate-900/50 border-slate-800'}`}>
                                                                                            +{detail.points}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>

                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}