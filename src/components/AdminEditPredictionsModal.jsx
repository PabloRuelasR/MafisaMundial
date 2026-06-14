// src/components/AdminEditPredictionsModal.jsx
import React, { useEffect, useState } from 'react';
import { getAllMatches, getUserPredictions, savePrediction } from '../services/predictions';
import Toast from './Toast';

export default function AdminEditPredictionsModal({ onClose, participantes }) {
    const [selectedUser, setSelectedUser] = useState('');
    const [groupedMatches, setGroupedMatches] = useState({});
    const [dates, setDates] = useState([]);
    const [activeDate, setActiveDate] = useState('');
    const [predictions, setPredictions] = useState([]);
    const [scores, setScores] = useState({});
    const [loadingMatches, setLoadingMatches] = useState(true);
    const [loadingUser, setLoadingUser] = useState(false);
    const [savingMatchId, setSavingMatchId] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        try {
            const matchesData = await getAllMatches();
            const grouped = {};
            matchesData.forEach(m => {
                if (!grouped[m.fechaPartido]) grouped[m.fechaPartido] = [];
                grouped[m.fechaPartido].push(m);
            });
            const sortedDates = Object.keys(grouped).sort();
            setGroupedMatches(grouped);
            setDates(sortedDates);
            setActiveDate(sortedDates[0] || '');
        } catch (error) {
            console.error(error);
            setToast({ show: true, message: 'Error cargando partidos', type: 'error' });
        } finally {
            setLoadingMatches(false);
        }
    };

    const handleUserSelect = async (uid) => {
        setSelectedUser(uid);
        if (!uid) {
            setPredictions([]);
            setScores({});
            return;
        }
        
        setLoadingUser(true);
        try {
            const predictionsData = await getUserPredictions(uid);
            setPredictions(predictionsData);
            
            // Rellenar los scores locales
            const newScores = {};
            predictionsData.forEach(p => {
                newScores[`${p.partidoId}_1`] = p.score1;
                newScores[`${p.partidoId}_2`] = p.score2;
            });
            setScores(newScores);
        } catch (error) {
            console.error(error);
            setToast({ show: true, message: 'Error cargando pronósticos del usuario', type: 'error' });
        } finally {
            setLoadingUser(false);
        }
    };

    const getPrediction = (matchId) => predictions.find(p => p.partidoId === matchId);

    const handleSave = async (match) => {
        const score1 = Number(scores[`${match.id}_1`]);
        const score2 = Number(scores[`${match.id}_2`]);

        if (scores[`${match.id}_1`] === undefined || scores[`${match.id}_2`] === undefined || scores[`${match.id}_1`] === '' || scores[`${match.id}_2`] === '' || isNaN(score1) || isNaN(score2)) {
            setToast({ show: true, message: 'Ingresa ambos scores', type: 'error' });
            return;
        }

        try {
            setSavingMatchId(match.id);
            await savePrediction({
                uid: selectedUser,
                partido: match,
                score1,
                score2
            });
            
            // Recargar predicciones del usuario tras guardar
            const predictionsData = await getUserPredictions(selectedUser);
            setPredictions(predictionsData);
            
            setToast({ show: true, message: 'Pronóstico del usuario actualizado', type: 'success' });
        } catch (error) {
            console.error(error);
            setToast({ show: true, message: 'Error al registrar', type: 'error' });
        } finally {
            setSavingMatchId(null);
        }
    };

    const formatDateTab = (dateString) => {
        const options = { month: 'short', day: 'numeric', timeZone: 'UTC' };
        return new Date(dateString).toLocaleDateString('es-ES', options).toUpperCase();
    };

    const activeMatches = groupedMatches[activeDate] || [];

    return (
        <div className="fixed inset-0 z-[700] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
            <div className="w-full max-w-6xl h-[95vh] flex flex-col rounded-[2rem] border border-purple-500/50 bg-[#081226] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                
                {/* CABECERA */}
                <div className="relative shrink-0 p-6 sm:p-8 border-b border-slate-800 bg-slate-900/50 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            Admin: Editar Usuarios
                        </h2>
                        <p className="text-slate-400 mt-2 text-sm">
                            Registra o edita los pronósticos de otros jugadores manualmente.
                        </p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-xl flex items-center justify-center transition-colors">
                        ×
                    </button>
                </div>

                {/* SELECTOR DE USUARIO */}
                <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center gap-4">
                    <label className="text-slate-300 font-bold uppercase tracking-widest text-xs">Participante a editar:</label>
                    <select
                        className="bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 outline-none focus:border-purple-500 w-full sm:w-auto font-bold"
                        value={selectedUser}
                        onChange={(e) => handleUserSelect(e.target.value)}
                    >
                        <option value="">-- Selecciona un participante --</option>
                        {participantes.map(p => (
                            <option key={p.uid} value={p.uid}>{p.nombre}</option>
                        ))}
                    </select>
                </div>

                {/* CONTENIDO (CALENDARIO + PARTIDOS) */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar relative">
                    {loadingMatches || loadingUser ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                        </div>
                    ) : !selectedUser ? (
                        <div className="text-center py-20 text-slate-500 font-bold text-lg">
                            Selecciona un usuario arriba para ver y editar sus pronósticos.
                        </div>
                    ) : (
                        <>
                            {/* CALENDARIO TABS */}
                            <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-4 mb-6">
                                {dates.map(date => {
                                    const isActive = activeDate === date;
                                    return (
                                        <button
                                            key={date}
                                            onClick={() => setActiveDate(date)}
                                            className={`px-6 py-4 rounded-2xl font-black whitespace-nowrap transition-all ${isActive
                                                    ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                }`}
                                        >
                                            {formatDateTab(date)}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* LISTA DE PARTIDOS DEL DÍA */}
                            <div className="space-y-6">
                                {activeMatches.map((match) => {
                                    const prediction = getPrediction(match.id);
                                    const hasPredicted = !!prediction;
                                    const isSaving = savingMatchId === match.id;

                                    return (
                                        <div key={match.id} className="bg-slate-900 border border-slate-700 hover:border-purple-500/50 transition-colors rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-xl">
                                            <div className="relative z-10 flex flex-col items-center w-full">
                                                
                                                <div className="text-slate-400 font-bold mb-4 bg-slate-950 border border-slate-800 px-5 py-1.5 rounded-full text-xs sm:text-sm tracking-wide">
                                                    {match.fechaPartido} • {match.horaPartido} (Hora Perú)
                                                </div>

                                                <div className="flex flex-row items-center justify-between w-full max-w-xl mb-6 gap-2 sm:gap-6">
                                                    {/* EQUIPO 1 */}
                                                    <div className="flex flex-col items-center text-center w-[90px] sm:w-[140px]">
                                                        <img src={`https://flagcdn.com/w80/${match.flag1}.png`} className="w-12 h-8 sm:w-20 sm:h-14 rounded sm:rounded-md mb-2 sm:mb-3 shadow-lg object-cover" alt={match.equipo1} />
                                                        <div className="font-black text-xs sm:text-lg leading-tight uppercase text-slate-300">{match.equipo1}</div>
                                                    </div>

                                                    {/* SCORE */}
                                                    <div className="flex items-center justify-center gap-2 sm:gap-4 shrink-0">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            disabled={isSaving}
                                                            value={scores[`${match.id}_1`] ?? ''}
                                                            onChange={(e) => setScores(prev => ({ ...prev, [`${match.id}_1`]: e.target.value }))}
                                                            className="w-12 h-14 sm:w-20 sm:h-20 bg-slate-950 border border-slate-700 rounded-xl sm:rounded-2xl text-center text-2xl sm:text-4xl font-black outline-none focus:border-purple-500 transition-all disabled:opacity-50"
                                                        />
                                                        <span className="text-2xl sm:text-4xl font-black text-slate-600">-</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            disabled={isSaving}
                                                            value={scores[`${match.id}_2`] ?? ''}
                                                            onChange={(e) => setScores(prev => ({ ...prev, [`${match.id}_2`]: e.target.value }))}
                                                            className="w-12 h-14 sm:w-20 sm:h-20 bg-slate-950 border border-slate-700 rounded-xl sm:rounded-2xl text-center text-2xl sm:text-4xl font-black outline-none focus:border-purple-500 transition-all disabled:opacity-50"
                                                        />
                                                    </div>

                                                    {/* EQUIPO 2 */}
                                                    <div className="flex flex-col items-center text-center w-[90px] sm:w-[140px]">
                                                        <img src={`https://flagcdn.com/w80/${match.flag2}.png`} className="w-12 h-8 sm:w-20 sm:h-14 rounded sm:rounded-md mb-2 sm:mb-3 shadow-lg object-cover" alt={match.equipo2} />
                                                        <div className="font-black text-xs sm:text-lg leading-tight uppercase text-slate-300">{match.equipo2}</div>
                                                    </div>
                                                </div>

                                                <div className={`border-l-2 border-r-2 px-5 py-1 text-xs sm:text-sm font-black tracking-widest uppercase text-center mb-4 ${hasPredicted ? 'border-purple-500 text-purple-400' : 'border-slate-500 text-slate-400'}`}>
                                                    {hasPredicted ? 'El usuario ya tiene pronóstico' : 'Sin pronóstico'}
                                                </div>

                                                <button
                                                    disabled={isSaving}
                                                    onClick={() => handleSave(match)}
                                                    className="w-full sm:w-auto min-w-[240px] px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base transition-all bg-purple-600 hover:bg-purple-500 text-white shadow-lg disabled:opacity-50"
                                                >
                                                    {isSaving ? 'Guardando...' : hasPredicted ? 'Sobrescribir Pronóstico' : 'Registrar para Usuario'}
                                                </button>

                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, show: false }))} />
        </div>
    );
}