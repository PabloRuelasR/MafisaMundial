import React from 'react';

export default function Platform() {
  return (
    <div className="relative w-full max-w-7xl -mt-4 px-6">
      <div className="absolute inset-x-10 top-6 h-10 bg-black/40 blur-2xl rounded-full" />
      <div className="relative h-24 rounded-[40px] overflow-hidden border border-slate-700 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white" />
          <div className="absolute left-1/2 top-1/2 w-24 h-24 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
      </div>
    </div>
  );
}