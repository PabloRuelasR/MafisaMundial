import React from 'react';

export default function LiveMatchModal({ onClose }) {
    return (
        <div
            className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={onClose}
        >
            <div
                className="w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-3xl border border-slate-700 bg-[#081226] p-6 sm:p-8 custom-scrollbar relative flex flex-col items-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* BOTÓN DE CIERRE */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-2xl flex items-center justify-center transition-colors text-slate-300 hover:text-white z-10"
                >
                    ×
                </button>

                {/* CABECERA */}
                <div className="w-full mb-6 text-center pr-8 sm:pr-0">
                    <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 flex items-center justify-center gap-3">
                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                        Alineaciones en Vivo
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm">
                        Información actualizada en tiempo real
                    </p>
                </div>

                {/* CONTENEDOR DEL WIDGET (Fondo blanco para coincidir con widgetTheme=light) */}
                <div className="w-full bg-white rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    {/* WIDGET DE SOFASCORE */}
                    <iframe 
                        id="sofa-lineups-embed-15186710" 
                        src="https://widgets.sofascore.com/embed/lineups?id=15186710&widgetTheme=light" 
                        style={{ height: '786px', maxWidth: '800px', width: '100%', border: '0' }}
                        scrolling="no"
                        title="Alineaciones del partido"
                    />
                </div>

                {/* FOOTER WIDGET */}
                <div className="mt-5 text-sm font-bold font-sans text-slate-400 hover:text-cyan-400 transition-colors">
                    <a 
                        href="https://www.sofascore.com/football/match/mexico-south-africa/LUbsGVb#id:15186710" 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800"
                    >
                        Mexico - South Africa Live Score ↗
                    </a>
                </div>

            </div>
        </div>
    );
}