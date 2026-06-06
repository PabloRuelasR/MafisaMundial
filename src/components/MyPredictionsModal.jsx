import React, {
    useEffect,
    useState
} from 'react';

import {
    collection,
    query,
    where,
    getDocs
} from 'firebase/firestore';

import { db } from '../services/firebase';

// Obtenemos la fecha actual exacta en Perú
const getPeruDate = () => {
    const date = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Lima" }));
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export default function MyPredictionsModal({
    currentUser,
    onClose
}) {
    const [groupedPredictions, setGroupedPredictions] = useState({});
    const [dates, setDates] = useState([]);
    const [activeDate, setActiveDate] = useState('');
    const [loading, setLoading] = useState(true);

    const todayPeru = getPeruDate();

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

            // Agrupar pronósticos por fecha
            const grouped = {};
            data.forEach(p => {
                if (!grouped[p.fechaPartido]) grouped[p.fechaPartido] = [];
                grouped[p.fechaPartido].push(p);
            });

            // Ordenar fechas
            const sortedDates = Object.keys(grouped).sort();
            setGroupedPredictions(grouped);
            setDates(sortedDates);

            // Seleccionar por defecto la fecha de hoy o la más próxima disponible
            const nextDate = sortedDates.find(d => d >= todayPeru) || sortedDates[sortedDates.length - 1] || '';
            setActiveDate(nextDate);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTab = (dateString) => {
        const options = { month: 'short', day: 'numeric', timeZone: 'UTC' };
        return new Date(dateString).toLocaleDateString('es-ES', options).toUpperCase();
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-md">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    const activeMatches = groupedPredictions[activeDate] || [];

    return (
        <div
            className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-700 bg-[#081226] p-6 sm:p-8 custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                            Mis Pronósticos
                        </h2>
                        <p className="text-slate-400 mt-2 text-sm sm:text-base">
                            Historial completo de tus partidos
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-2xl flex items-center justify-center transition-colors"
                    >
                        ×
                    </button>
                </div>

                {/* EMPTY STATE */}
                {dates.length === 0 && (
                    <div className="text-center py-20 text-slate-400">
                        <div className="text-5xl mb-4">📜</div>
                        <div className="font-bold">No tienes pronósticos aún</div>
                    </div>
                )}

                {/* CALENDARIO TABS */}
                {dates.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-4 mb-6">
                        {dates.map(date => {
                            const isActive = activeDate === date;
                            return (
                                <button
                                    key={date}
                                    onClick={() => setActiveDate(date)}
                                    className={`px-6 py-4 rounded-2xl font-black whitespace-nowrap transition-all ${
                                        isActive
                                            ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                                >
                                    {formatDateTab(date)}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* LISTA DE PRONÓSTICOS DEL DÍA */}
                <div className="space-y-6">
                    {activeMatches.map((pred) => {
                        const finalizado = pred.auditado;

                        return (
                            <div
                                key={pred.id}
                                className="bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-xl"
                            >
                                <div className="relative z-10 flex flex-col items-center w-full">
                                    
                                    {/* EQUIPOS Y SCORE (Fila Horizontal) */}
                                    <div className="flex flex-row items-center justify-between w-full max-w-xl mb-4 gap-2 sm:gap-6 mt-2">
                                        
                                        {/* EQUIPO 1 */}
                                        <div className="flex flex-col items-center text-center w-[90px] sm:w-[140px]">
                                            <img
                                                src={`https://flagcdn.com/w80/${pred.flag1}.png`}
                                                className={`w-12 h-8 sm:w-20 sm:h-14 rounded sm:rounded-md mb-2 sm:mb-3 shadow-lg object-cover ${finalizado ? 'grayscale opacity-60' : ''}`}
                                            />
                                            <div className="font-black text-xs sm:text-lg leading-tight uppercase text-slate-300">
                                                {pred.equipo1}
                                            </div>
                                        </div>

                                        {/* SCORE PRONOSTICADO */}
                                        <div className="flex items-center justify-center gap-2 sm:gap-4 shrink-0">
                                            <div className="w-12 h-14 sm:w-20 sm:h-20 bg-slate-950 border border-slate-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-4xl font-black text-white">
                                                {pred.score1}
                                            </div>
                                            <span className="text-2xl sm:text-4xl font-black text-slate-600">-</span>
                                            <div className="w-12 h-14 sm:w-20 sm:h-20 bg-slate-950 border border-slate-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-4xl font-black text-white">
                                                {pred.score2}
                                            </div>
                                        </div>

                                        {/* EQUIPO 2 */}
                                        <div className="flex flex-col items-center text-center w-[90px] sm:w-[140px]">
                                            <img
                                                src={`https://flagcdn.com/w80/${pred.flag2}.png`}
                                                className={`w-12 h-8 sm:w-20 sm:h-14 rounded sm:rounded-md mb-2 sm:mb-3 shadow-lg object-cover ${finalizado ? 'grayscale opacity-60' : ''}`}
                                            />
                                            <div className="font-black text-xs sm:text-lg leading-tight uppercase text-slate-300">
                                                {pred.equipo2}
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECCIÓN INFERIOR: RESULTADOS O PENDIENTE */}
                                    {!finalizado ? (
                                        <div className="mt-2 border-l-2 border-r-2 border-yellow-500 px-5 py-1 text-yellow-400 text-xs sm:text-sm font-black tracking-widest uppercase text-center">
                                            Pendiente de Auditoría
                                        </div>
                                    ) : (
                                        <div className="w-full max-w-xl mt-4 pt-5 border-t border-slate-700/50 flex flex-col items-center">
                                            
                                            {/* RESULTADO OFICIAL */}
                                            <div className="flex items-center gap-4 mb-5 bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800">
                                                <div className="text-slate-400 text-xs sm:text-sm uppercase tracking-widest font-bold">
                                                    Resultado Oficial
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="w-8 h-10 sm:w-12 sm:h-12 bg-emerald-500/10 border border-emerald-500/50 rounded-lg flex items-center justify-center text-lg sm:text-xl font-black text-emerald-400">
                                                        {pred.marcadorOficial1}
                                                    </div>
                                                    <div className="w-8 h-10 sm:w-12 sm:h-12 bg-emerald-500/10 border border-emerald-500/50 rounded-lg flex items-center justify-center text-lg sm:text-xl font-black text-emerald-400">
                                                        {pred.marcadorOficial2}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* STATS DE ACIERTOS */}
                                            <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
                                                {/* Ganador */}
                                                <div className="bg-slate-950/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-slate-800/50">
                                                    <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-1">
                                                        Acertó Ganador
                                                    </div>
                                                    <div className={`text-sm sm:text-lg font-black ${pred.acertoGanador ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {pred.acertoGanador ? '✓ Sí' : '✗ No'}
                                                    </div>
                                                </div>

                                                {/* Score Exacto */}
                                                <div className="bg-slate-950/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-slate-800/50">
                                                    <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-1">
                                                        Score Exacto
                                                    </div>
                                                    <div className={`text-sm sm:text-lg font-black ${pred.acertoScoreExacto ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {pred.acertoScoreExacto ? '✓ Sí' : '✗ No'}
                                                    </div>
                                                </div>

                                                {/* Puntos Ganados */}
                                                <div className="bg-indigo-500/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-indigo-500/30">
                                                    <div className="text-[10px] sm:text-xs text-indigo-300 uppercase tracking-wider mb-1">
                                                        Puntos
                                                    </div>
                                                    <div className="text-xl sm:text-3xl font-black text-indigo-400">
                                                        +{pred.puntosTotales}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    )}

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}