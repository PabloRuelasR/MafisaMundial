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

    useEffect(() => {
        loadTodayData();
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

    return (
        <div className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
            <div className="w-full max-w-6xl h-[90vh] flex flex-col rounded-[2rem] border border-slate-700 bg-[#081226] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                
                {/* CABECERA */}
                <div className="relative shrink-0 p-6 sm:p-8 border-b border-slate-800 bg-slate-900/50 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                            Pronósticos de Hoy
                        </h2>
                        <p className="text-slate-400 mt-2 text-sm">
                            Apuestas registradas para los partidos de la fecha actual.
                        </p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-xl flex items-center justify-center transition-colors">
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
                                // Filtrar las predicciones para este partido específico
                                const matchPredictions = predictions.filter(p => p.partidoId === match.id);

                                return (
                                    <div key={match.id} className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
                                        {/* HEADER DEL PARTIDO */}
                                        <div className="bg-slate-950 p-4 flex items-center justify-center gap-6 border-b border-slate-800">
                                            <div className="flex items-center gap-3 w-1/3 justify-end">
                                                <span className="font-black text-sm sm:text-lg uppercase text-slate-300 text-right">{traducirPais(match.equipo1)}</span>
                                                <img src={`https://flagcdn.com/w40/${match.flag1}.png`} className="w-8 h-6 rounded" alt="" />
                                            </div>
                                            <div className="font-black text-slate-500 text-xl">VS</div>
                                            <div className="flex items-center gap-3 w-1/3 justify-start">
                                                <img src={`https://flagcdn.com/w40/${match.flag2}.png`} className="w-8 h-6 rounded" alt="" />
                                                <span className="font-black text-sm sm:text-lg uppercase text-slate-300 text-left">{traducirPais(match.equipo2)}</span>
                                            </div>
                                        </div>

                                        {/* GRILLA DE PRONÓSTICOS */}
                                        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {participantes.map(user => {
                                                const pr = matchPredictions.find(p => p.uid === user.uid);
                                                return (
                                                    <div key={user.uid} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <img src={user.img} className="w-8 h-8 rounded-full border border-slate-600 shrink-0" alt="" />
                                                            <span className="text-xs font-bold text-slate-300 truncate">{user.nombre}</span>
                                                        </div>
                                                        <div className="bg-slate-950 px-3 py-1.5 rounded-lg text-sm font-black tracking-wider border border-slate-700 shrink-0">
                                                            {pr ? `${pr.score1} - ${pr.score2}` : <span className="text-red-500/50">S/R</span>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
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