import React, { useState } from 'react';
import { groupPicksData, excelFlagMap } from '../data/groupPicksData';

export default function GroupPicksModal({ onClose }) {
    const grupos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    const [activeGroup, setActiveGroup] = useState('A');

    return (
        <div
            className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={onClose}
        >
            {/* CONTENEDOR PRINCIPAL - Alto fijo para permitir scroll interno */}
            <div
                className="w-full max-w-6xl h-[90vh] flex flex-col rounded-[2rem] border border-slate-700/60 bg-[#060d1a] shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER Y TABS (FIJOS) */}
                <div className="relative shrink-0 p-6 sm:p-8 border-b border-slate-800 bg-gradient-to-b from-slate-900/80 to-transparent">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                                Pronósticos de Fase de Grupos
                            </h2>
                            <p className="text-slate-400 mt-2 text-sm sm:text-base font-medium">
                                Los favoritos de cada participante para avanzar a octavos.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-12 h-12 shrink-0 rounded-full bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 text-2xl flex items-center justify-center transition-all hover:scale-105 text-slate-300 hover:text-white"
                        >
                            ×
                        </button>
                    </div>

                    {/* SELECTOR DE GRUPOS */}
                    <div className="flex gap-2 sm:gap-3 overflow-x-auto custom-scrollbar mt-8 pb-2">
                        {grupos.map(grupo => {
                            const isActive = activeGroup === grupo;
                            return (
                                <button
                                    key={grupo}
                                    onClick={() => setActiveGroup(grupo)}
                                    className={`px-5 py-3 rounded-xl font-black text-sm sm:text-base whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                                        isActive
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] scale-105'
                                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                    }`}
                                >
                                    GRUPO {grupo}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ÁREA DE TARJETAS (SCROLLABLE) */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/20 via-[#060d1a] to-[#060d1a]">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {groupPicksData.map((participante, index) => {
                            const picks = participante.grupos[activeGroup];
                            const flag1 = excelFlagMap[picks?.primero] || 'un';
                            const flag2 = excelFlagMap[picks?.segundo] || 'un';

                            return (
                                <div
                                    key={index}
                                    className="group relative bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:bg-slate-800/60 hover:border-slate-500/50 transition-all duration-300"
                                >
                                    {/* CABECERA DE TARJETA: NOMBRE DEL PARTICIPANTE */}
                                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700/50">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-inner shrink-0">
                                            {participante.nombre.charAt(0)}
                                        </div>
                                        <div className="text-lg font-black text-slate-100 truncate">
                                            {participante.nombre}
                                        </div>
                                    </div>

                                    {/* PREDICCIONES */}
                                    <div className="flex gap-4 w-full">
                                        
                                        {/* 1ER LUGAR */}
                                        <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/50 p-4 rounded-xl border-l-2 border-r-2 border-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] transition-transform duration-300 group-hover:-translate-y-1">
                                            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-2">
                                                1° Puesto
                                            </span>
                                            <img
                                                src={`https://flagcdn.com/w80/${flag1}.png`}
                                                alt={picks?.primero}
                                                className="w-12 h-8 sm:w-14 sm:h-10 rounded shadow-md object-cover mb-2"
                                            />
                                            <span className="text-xs sm:text-sm font-bold text-white text-center leading-tight truncate w-full">
                                                {picks?.primero}
                                            </span>
                                        </div>

                                        {/* 2DO LUGAR */}
                                        <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/50 p-4 rounded-xl border-l-2 border-r-2 border-slate-500 transition-transform duration-300 group-hover:-translate-y-1">
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">
                                                2° Puesto
                                            </span>
                                            <img
                                                src={`https://flagcdn.com/w80/${flag2}.png`}
                                                alt={picks?.segundo}
                                                className="w-12 h-8 sm:w-14 sm:h-10 rounded shadow-md object-cover mb-2"
                                            />
                                            <span className="text-xs sm:text-sm font-bold text-slate-300 text-center leading-tight truncate w-full">
                                                {picks?.segundo}
                                            </span>
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}