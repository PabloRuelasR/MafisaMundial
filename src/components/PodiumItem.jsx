import React from 'react';
import AnimatedCounter from './AnimatedCounter';

export default function PodiumItem({ user, rank, maxPuntos, mounted, onClick }) {
  const isFirst = rank === 0;
  const isSecond = rank === 1;
  const isThird = rank === 2;

  const MAX_BAR_HEIGHT = 220;
  const MIN_BAR_HEIGHT = 140;
  const ratio = user.puntos / maxPuntos;
  const dynamicHeight = MIN_BAR_HEIGHT + ratio * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT);
  const finalHeight = mounted ? dynamicHeight : 0;

  let barGradient = 'bg-gradient-to-t from-slate-900 via-slate-700 to-slate-400 border-slate-300';
  let borderAvatar = 'border-slate-300';
  let badge = rank + 1;

  if (isFirst) {
    barGradient = 'bg-gradient-to-t from-yellow-950 via-yellow-600 to-yellow-300 border-yellow-200 shadow-[0_0_30px_rgba(250,204,21,0.5)]';
    borderAvatar = 'border-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.5)]';
    badge = '🥇';
  } else if (isSecond) {
    barGradient = 'bg-gradient-to-t from-slate-900 via-slate-400 to-slate-200 border-slate-100';
    badge = '🥈';
  } else if (isThird) {
    barGradient = 'bg-gradient-to-t from-orange-950 via-orange-700 to-orange-400 border-orange-200';
    badge = '🥉';
  }

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center shrink-0 cursor-pointer group"
    >
      {/* AVATAR */}
      <div className={`relative z-20 flex flex-col items-center transition-all duration-300 group-hover:-translate-y-3 ${isFirst ? 'mb-5' : 'mb-3'}`}>
        {isFirst && <div className="absolute -top-12 text-5xl animate-bounce z-30">🏆</div>}
        <div className={`relative rounded-full overflow-hidden border-4 bg-slate-900 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${isFirst ? 'w-20 h-20 sm:w-24 sm:h-24 scale-110' : 'w-16 h-16 sm:w-20 sm:h-20'} ${borderAvatar}`}>
          <img
            src={user.img}
            alt={user.nombre}
            className="w-full h-full object-contain p-2 transition-all duration-500 group-hover:scale-125 group-hover:-translate-y-1 animate-float-pokemon"
          />
        </div>
        <div className="relative mt-3 bg-[#081226]/95 border border-slate-700 rounded-2xl px-4 py-3 text-center shadow-2xl min-w-[110px]">
          <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">{badge}</div>
          <div className="text-sm font-black uppercase tracking-wider">{user.nombre}</div>
          <div className="mt-1 text-3xl font-black leading-none">
            <AnimatedCounter value={user.puntos} />
            <span className="text-xs ml-1 text-slate-400">PTS</span>
          </div>
        </div>
      </div>

      {/* BARRA */}
      <div
        className={`relative overflow-hidden rounded-t-[28px] border-t-4 border-l border-r transition-all duration-[1800ms] ease-out hover:scale-[1.04] hover:-translate-y-2 hover:shadow-[0_0_45px_rgba(255,255,255,0.15)] ${barGradient}`}
        style={{ width: window.innerWidth < 640 ? '95px' : '125px', height: `${finalHeight}px` }}
      >
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-14 bg-black/20 blur-lg" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10" />
      </div>
    </div>
  );
}