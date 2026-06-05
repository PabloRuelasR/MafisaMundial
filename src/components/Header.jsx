import React from 'react';

export default function Header() {
  return (
    <div className="text-center w-full max-w-6xl">
      <div className="flex justify-center mb-4">
        <div className="inline-flex items-center px-5 py-2 rounded-full border border-yellow-500/30 bg-slate-900/80 backdrop-blur-xl">
          <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse mr-3" />
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-yellow-400">
            Inicia - 11 de Junio
          </span>
        </div>
      </div>
      <div className="flex justify-center items-center gap-3 sm:gap-5">
        <span className="text-3xl sm:text-5xl">⚽</span>
        <h1 className="text-[2rem] sm:text-6xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700">
          La Polla Mundialista
        </h1>
        <span className="text-3xl sm:text-5xl">⚽</span>
      </div>
      <h2 className="mt-3 text-xl sm:text-3xl font-black tracking-[0.35em] uppercase">
        MAFISA MOTORS
      </h2>
      <div className="mt-6 flex justify-center">
        <div className="inline-flex items-center px-7 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 shadow-[0_0_30px_rgba(250,204,21,0.45)]">
          <span className="text-xl mr-3">💰</span>
          <span className="font-black uppercase tracking-widest text-slate-950">
            Pozo Acumulado: S/ 210
          </span>
        </div>
      </div>
    </div>
  );
}