import React, { useEffect, useState } from 'react';
import { getAllMatches, getUserPredictions, savePrediction } from '../services/predictions';
import { traducirPais } from '../js/Utils/traductor';
import Toast from './Toast';

// Obtenemos la fecha actual exacta en Perú
const getPeruDate = () => {
    const date = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Lima" }));
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export default function PredictionPanel({ currentUser }) {
    const [groupedMatches, setGroupedMatches] = useState({});
    const [dates, setDates] = useState([]);
    const [activeDate, setActiveDate] = useState('');
    const [predictions, setPredictions] = useState([]);
    const [scores, setScores] = useState({});
    const [loading, setLoading] = useState(true);
    const [savingMatchId, setSavingMatchId] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [showWarning, setShowWarning] = useState(true);
    const todayPeru = getPeruDate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [matchesData, predictionsData] = await Promise.all([
                getAllMatches(),
                getUserPredictions(currentUser.uid)
            ]);

            const grouped = {};
            matchesData.forEach(m => {
                if (!grouped[m.fechaPartido]) grouped[m.fechaPartido] = [];
                grouped[m.fechaPartido].push(m);
            });

            const sortedDates = Object.keys(grouped).sort();
            setGroupedMatches(grouped);
            setDates(sortedDates);

            // Seleccionar por defecto la fecha de hoy o la más próxima disponible
            setActiveDate(prevDate => {
                // 1. Si ya estamos en una fecha válida, nos quedamos ahí (evita saltos al guardar)
                if (prevDate && sortedDates.includes(prevDate)) return prevDate;
                
                // 2. Si venimos de abrir el modal, leemos de la memoria del navegador
                const savedDate = localStorage.getItem('activePredictionDate');
                if (savedDate && sortedDates.includes(savedDate)) return savedDate;
                
                // 3. Por defecto: hoy o el próximo disponible
                return sortedDates.find(d => d >= todayPeru) || sortedDates[sortedDates.length - 1] || '';
            });
            setPredictions(predictionsData);

            // Llenar scores actuales para edición
            setScores(prevScores => {
                const updatedScores = { ...prevScores };
                predictionsData.forEach(p => {
                    updatedScores[`${p.partidoId}_1`] = p.score1;
                    updatedScores[`${p.partidoId}_2`] = p.score2;
                });
                return updatedScores;
            });

        } catch (error) {
            console.error(error);
            setToast({ show: true, message: 'Error cargando partidos', type: 'error' });
        } finally {
            setLoading(false);
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
                uid: currentUser.uid,
                partido: match,
                score1,
                score2
            });
            await loadData();
            setToast({ show: true, message: 'Pronóstico registrado exitosamente', type: 'success' });
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
            </div>
        );
    }

    const activeMatches = groupedMatches[activeDate] || [];

    return (
        <>
            <div className="w-full">
                {showWarning && (
                    <div className="mb-8 bg-blue-900/20 border border-blue-500/30 p-5 rounded-2xl flex gap-4 items-start relative">
                        <div className="text-blue-400 text-2xl shrink-0">⚠️</div>
                        <div className="pr-6">
                            <h3 className="text-blue-400 font-bold mb-1">Bloqueo de Partidos</h3>
                            <p className="text-slate-400 text-sm">
                                Los partidos se bloquearán el mismo día que se juegan. Por ende, debes hacer o editar tu registro hasta un día antes. De lo contrario, tu pronóstico figurará como inválido.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowWarning(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* CALENDARIO TABS */}
                <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-4 mb-6">
                    {dates.map(date => {
                        const isActive = activeDate === date;
                        return (
                            <button
                                key={date}
                                onClick={() => {
                                    setActiveDate(date);
                                    localStorage.setItem('activePredictionDate', date);
                                }}
                                className={`px-6 py-4 rounded-2xl font-black whitespace-nowrap transition-all ${isActive
                                        ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(250,204,21,0.3)]'
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
                        const isLocked = todayPeru >= match.fechaPartido;
                        const prediction = getPrediction(match.id);
                        const hasPredicted = !!prediction;
                        const isSaving = savingMatchId === match.id;

                        return (
                            <div key={match.id} className="bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-xl">
                                {isLocked && (
                                    <div className="absolute inset-0 bg-slate-950/60 z-0 pointer-events-none backdrop-blur-[1px]" />
                                )}

                                <div className="relative z-10 flex flex-col items-center w-full">

                                    {/* HORA */}
                                    <div className="text-slate-400 font-bold mb-4 bg-slate-950 border border-slate-800 px-5 py-1.5 rounded-full text-xs sm:text-sm tracking-wide">
                                        {match.horaPartido} (Hora Perú)
                                    </div>

                                    {/* EQUIPOS Y SCORE (Fila Horizontal) */}
                                    <div className="flex flex-row items-center justify-between w-full max-w-xl mb-6 gap-2 sm:gap-6">

                                        {/* EQUIPO 1 */}
                                        <div className="flex flex-col items-center text-center w-[90px] sm:w-[140px]">
                                            <img src={`https://flagcdn.com/w80/${match.flag1}.png`} className={`w-12 h-8 sm:w-20 sm:h-14 rounded sm:rounded-md mb-2 sm:mb-3 shadow-lg object-cover ${isLocked ? 'grayscale opacity-60' : ''}`} />
                                            <div className="font-black text-xs sm:text-lg leading-tight uppercase text-slate-300">{traducirPais(match.equipo1)}</div>
                                        </div>

                                        {/* SCORE */}
                                        <div className="flex items-center justify-center gap-2 sm:gap-4 shrink-0">
                                            <input
                                                type="number"
                                                min="0"
                                                disabled={isLocked || isSaving}
                                                value={scores[`${match.id}_1`] ?? ''}
                                                onChange={(e) => setScores(prev => ({ ...prev, [`${match.id}_1`]: e.target.value }))}
                                                className="w-12 h-14 sm:w-20 sm:h-20 bg-slate-950 border border-slate-700 rounded-xl sm:rounded-2xl text-center text-2xl sm:text-4xl font-black outline-none focus:border-yellow-500 transition-all disabled:opacity-50"
                                            />
                                            <span className="text-2xl sm:text-4xl font-black text-slate-600">-</span>
                                            <input
                                                type="number"
                                                min="0"
                                                disabled={isLocked || isSaving}
                                                value={scores[`${match.id}_2`] ?? ''}
                                                onChange={(e) => setScores(prev => ({ ...prev, [`${match.id}_2`]: e.target.value }))}
                                                className="w-12 h-14 sm:w-20 sm:h-20 bg-slate-950 border border-slate-700 rounded-xl sm:rounded-2xl text-center text-2xl sm:text-4xl font-black outline-none focus:border-yellow-500 transition-all disabled:opacity-50"
                                            />
                                        </div>

                                        {/* EQUIPO 2 */}
                                        <div className="flex flex-col items-center text-center w-[90px] sm:w-[140px]">
                                            <img src={`https://flagcdn.com/w80/${match.flag2}.png`} className={`w-12 h-8 sm:w-20 sm:h-14 rounded sm:rounded-md mb-2 sm:mb-3 shadow-lg object-cover ${isLocked ? 'grayscale opacity-60' : ''}`} />
                                            <div className="font-black text-xs sm:text-lg leading-tight uppercase text-slate-300">{traducirPais(match.equipo2)}</div>
                                        </div>

                                    </div>

                                    {/* ESTADO CON LÍNEAS VERTICALES */}
                                    <div className="mb-4">
                                        {isLocked ? (
                                            hasPredicted ? (
                                                <div className="border-l-2 border-r-2 border-slate-500 px-5 py-1 text-slate-400 text-xs sm:text-sm font-black tracking-widest uppercase text-center">
                                                    Pronóstico Bloqueado
                                                </div>
                                            ) : (
                                                <div className="border-l-2 border-r-2 border-red-500 px-5 py-1 text-red-500 text-xs sm:text-sm font-black tracking-widest uppercase text-center">
                                                    Inválido - No Registró
                                                </div>
                                            )
                                        ) : (
                                            <div className={`border-l-2 border-r-2 px-5 py-1 text-xs sm:text-sm font-black tracking-widest uppercase text-center ${hasPredicted ? 'border-emerald-500 text-emerald-400' : 'border-yellow-500 text-yellow-400'}`}>
                                                {hasPredicted ? 'Guardado - Puede Editar' : 'Pendiente'}
                                            </div>
                                        )}
                                    </div>

                                    {/* BOTÓN DE GUARDADO */}
                                    {!isLocked && (
                                        <button
                                            disabled={isSaving}
                                            onClick={() => handleSave(match)}
                                            className="w-full sm:w-auto min-w-[240px] mt-2 px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base transition-all bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] disabled:opacity-50 disabled:hover:scale-100"
                                        >
                                            {isSaving ? 'Guardando...' : hasPredicted ? 'Actualizar Pronóstico' : 'Registrar Pronóstico'}
                                        </button>
                                    )}

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, show: false }))} />
        </>
    );
}