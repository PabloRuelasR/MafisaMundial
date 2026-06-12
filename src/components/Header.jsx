import React from 'react';

export default function Header() {
  return (
    <div className="text-center w-full px-2">
      <div className="flex justify-center items-center gap-2 sm:gap-4 md:gap-5">
        <span className="text-2xl sm:text-4xl md:text-5xl">⚽</span>
        
        {/* SOLUCIÓN RESPONSIVE: Tipografía fluida usando clamp() */}
        <h1 
          className="font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700"
          style={{ fontSize: 'clamp(1.2rem, 5vw + 0.5rem, 3.5rem)' }}
        >
          La Polla Mundialista
        </h1>
        
        <span className="text-2xl sm:text-4xl md:text-5xl">⚽</span>
      </div>
      
      <h2 
        className="mt-1 sm:mt-2 font-black uppercase text-slate-200"
        style={{ 
          fontSize: 'clamp(0.8rem, 2vw + 0.5rem, 1.8rem)',
          letterSpacing: 'clamp(0.15em, 1vw, 0.35em)' 
        }}
      >
        MAFISA MOTORS
      </h2>
    </div>
  );
}