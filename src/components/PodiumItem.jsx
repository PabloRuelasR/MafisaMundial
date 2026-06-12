import React from 'react';
import AnimatedCounter from './AnimatedCounter';

export default function PodiumItem({ user, rank, maxPuntos, mounted, onClick }) {
  const isFirst = rank === 0;
  const isSecond = rank === 1;
  const isThird = rank === 2;

  // Alturas ajustadas para la nueva vista sin scroll
  const MAX_BAR_HEIGHT = 230; 
  const MIN_BAR_HEIGHT = 15;
  const ratio = maxPuntos > 0 ? user.puntos / maxPuntos : 0;
  const dynamicHeight = MIN_BAR_HEIGHT + ratio * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT);
  const finalHeight = mounted ? dynamicHeight : 0;

  // Estilos por defecto (resto de posiciones)
  let barGradient = 'bg-gradient-to-t from-slate-900 via-slate-700/80 to-slate-500/80 border-slate-400/50';
  let borderAvatar = 'border-slate-400/50 shadow-[0_0_15px_rgba(148,163,184,0.3)]';
  let badgeColor = 'bg-slate-700 text-slate-200 border-slate-500';
  let badge = rank + 1;

  if (isFirst) {
    barGradient = 'bg-gradient-to-t from-yellow-900 via-yellow-600/90 to-yellow-300 border-yellow-300/80 shadow-[0_0_35px_rgba(250,204,21,0.4)]';
    borderAvatar = 'border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.6)]';
    badgeColor = 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-black border-yellow-200';
    badge = '🥇';
  } else if (isSecond) {
    barGradient = 'bg-gradient-to-t from-slate-900 via-slate-400/80 to-slate-200 border-slate-300/80 shadow-[0_0_25px_rgba(226,232,240,0.3)]';
    borderAvatar = 'border-slate-300 shadow-[0_0_20px_rgba(226,232,240,0.5)]';
    badgeColor = 'bg-gradient-to-br from-slate-200 to-slate-400 text-black border-white';
    badge = '🥈';
  } else if (isThird) {
    barGradient = 'bg-gradient-to-t from-orange-950 via-orange-600/80 to-orange-400 border-orange-400/80 shadow-[0_0_25px_rgba(249,115,22,0.3)]';
    borderAvatar = 'border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.5)]';
    badgeColor = 'bg-gradient-to-br from-orange-300 to-orange-600 text-black border-orange-200';
    badge = '🥉';
  }

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center shrink-0 cursor-pointer group"
    >
      {/* SECCIÓN DEL AVATAR Y TARJETA */}
      <div className={`relative z-20 flex flex-col items-center transition-all duration-300 group-hover:-translate-y-4 ${isFirst ? 'mb-4' : 'mb-2'}`}>
        
        {/* CORONA DEL 1ER LUGAR */}
        {isFirst && (
          <div className="absolute -top-10 text-4xl sm:text-5xl animate-bounce z-30 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]">
            👑
          </div>
        )}

        {/* CONTENEDOR FOTO DE PERFIL */}
        <div className={`relative rounded-full overflow-hidden border-[3px] bg-slate-900 transition-all duration-300 group-hover:scale-110 ${isFirst ? 'w-20 h-20 sm:w-24 sm:h-24 z-20' : 'w-16 h-16 sm:w-20 sm:h-20 z-10'} ${borderAvatar}`}>
          <img
            src={user.img}
            alt={user.nombre}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Sombra interna para darle profundidad al borde */}
          <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] pointer-events-none rounded-full" />
        </div>

        {/* ETIQUETA COMPACTA: NOMBRE Y PUNTOS */}
        <div className="relative -mt-4 z-30 bg-[#081226]/90 backdrop-blur-md border border-slate-600/50 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-center shadow-[0_10px_20px_rgba(0,0,0,0.6)] min-w-[85px] sm:min-w-[110px] group-hover:border-slate-400/80 transition-colors">
          {/* Insignia de Posición */}
          <div className={`absolute -top-2.5 -right-2.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black shadow-lg border ${badgeColor}`}>
            {badge}
          </div>
          
          <div className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-200 truncate max-w-[70px] sm:max-w-[90px] mx-auto">
            {user.nombre}
          </div>
          
          <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
            <span className="text-sm sm:text-lg font-black leading-none text-white drop-shadow-md">
              <AnimatedCounter value={user.puntos} />
            </span>
            <span className="text-[7px] sm:text-[9px] font-bold text-slate-400">PTS</span>
          </div>
        </div>
      </div>

      {/* BARRA DEL PODIO (Pilar) */}
      <div
        className={`relative overflow-hidden rounded-t-[16px] sm:rounded-t-[24px] border-t-[3px] border-l border-r border-opacity-50 transition-all duration-[1500ms] cubic-bezier(0.4,0,0.2,1) group-hover:brightness-125 w-[75px] sm:w-[110px] ${barGradient}`}
        style={{ height: `${finalHeight}px` }}
      >
        {/* Textura interna (Fibra de carbono o cuadrícula) */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        {/* Reflejo de luz superior (Efecto Cristal) */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent" />
        
        {/* Sombra base profunda en la parte inferior */}
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Resplandor central al pasar el cursor */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-transparent via-white/10 to-white/20" />
        
        {/* Líneas de luz laterales (estilo LED) */}
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-white/40 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </div>
  );
}