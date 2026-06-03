import React, { useState, useEffect, useRef } from 'react';

// --- DATOS ---
const participantesIniciales = [
  {
    id: 1,
    nombre: 'Anthony',
    puntos: 165,
    img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    predicciones: [
      {
        eq1: 'BRA',
        flag1: 'br',
        eq2: 'ARG',
        flag2: 'ar',
        pronostico: '2-1',
        resultado: '2-1',
        acierto: true,
        puntosGanados: 15
      },
    ]
  },
  {
    id: 2,
    nombre: 'Frank',
    puntos: 145,
    img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    predicciones: []
  },
  {
    id: 3,
    nombre: 'Hector',
    puntos: 130,
    img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png',
    predicciones: []
  },
  {
    id: 4,
    nombre: 'Miguel',
    puntos: 110,
    img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/59.png',
    predicciones: []
  },
  {
    id: 5,
    nombre: 'Jhoan',
    puntos: 95,
    img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png',
    predicciones: []
  },
  {
    id: 6,
    nombre: 'Juan',
    puntos: 80,
    img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
    predicciones: []
  },
  {
    id: 7,
    nombre: 'Pablo',
    puntos: 152,
    img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png',
    predicciones: []
  },
];

const AnimatedCounter = ({ value }) => {

  const [count, setCount] = useState(0);

  useEffect(() => {

    let start = 0;

    const duration = 1800;
    const frames = 60;

    const increment =
      value / (duration / (1000 / frames));

    const timer = setInterval(() => {

      start += increment;

      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      }
      else {
        setCount(Math.ceil(start));
      }

    }, 1000 / frames);

    return () => clearInterval(timer);

  }, [value]);

  return (
    <span className="font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
      {count}
    </span>
  );
};

export default function App() {

  const [selectedUser, setSelectedUser] = useState(null);

  const [mounted, setMounted] = useState(false);

  const [paisRandom, setPaisRandom] = useState(null);

  const [shootBall, setShootBall] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {

    const script = document.createElement('script');

    script.src =
      'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';

    script.async = true;

    document.body.appendChild(script);

    setTimeout(() => {

      setMounted(true);

      if (scrollRef.current) {

        const { scrollWidth, clientWidth } =
          scrollRef.current;

        scrollRef.current.scrollLeft =
          (scrollWidth - clientWidth) / 2;
      }

    }, 300);

  }, []);

  const paisesMundial = [
    {
      nombre: 'Argentina',
      colores: ['#43A1D5', '#ffffff', '#F6B40E'],
      flag: 'ar'
    },
    {
      nombre: 'Francia',
      colores: ['#002395', '#ffffff', '#ED2939'],
      flag: 'fr'
    },
    {
      nombre: 'España',
      colores: ['#AA151B', '#F1BF00', '#AA151B'],
      flag: 'es'
    },
    {
      nombre: 'Colombia',
      colores: ['#FCD116', '#0038A8', '#CE1126'],
      flag: 'co'
    },
    {
      nombre: 'Alemania',
      colores: ['#000000', '#FF0000', '#FFCC00'],
      flag: 'de'
    },
    {
      nombre: 'Japón',
      colores: ['#ffffff', '#BC002D', '#ffffff'],
      flag: 'jp'
    },
    {
      nombre: 'Portugal',
      colores: ['#BC002D', '#0b5c12'],
      flag: 'pt'
    }
  ];

  const activarBocina = () => {

    if (!window.confetti) return;

    const pais =
      paisesMundial[
      Math.floor(Math.random() * paisesMundial.length)
      ];

    setPaisRandom(pais);

    const audio = new Audio(
      'https://actions.google.com/sounds/v1/alarms/air_horn.ogg'
    );

    audio.volume = 0.3;

    audio.play().catch(() => { });

    window.confetti({
      particleCount: 220,
      spread: 130,
      origin: { y: 0.6 },
      colors: pais.colores,
      zIndex: 9999
    });

    setTimeout(() => setPaisRandom(null), 4000);
  };

  const activarGol = () => {

    setShootBall(true);

    if (window.confetti) {

      window.confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.7 },
        colors: ['#ffffff', '#22c55e']
      });
    }

    setTimeout(() => {
      setShootBall(false);
    }, 1200);
  };

  const sorted = [...participantesIniciales].sort(
    (a, b) => b.puntos - a.puntos
  );

  const displayOrder = [
    sorted[6],
    sorted[4],
    sorted[2],
    sorted[0],
    sorted[1],
    sorted[3],
    sorted[5]
  ].filter(Boolean);

  const maxPuntos = sorted[0]?.puntos || 1;

  return (

    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">

      {/* BACKGROUND */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: 'scale(1.08)',
          filter: 'blur(5px) brightness(0.35)',
          zIndex: 0,
          animation:
            'stadium-pan 25s ease-in-out infinite alternate'
        }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-[#020617]/65 z-[1]" />

      {/* LIGHTS */}
      <div className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] bg-emerald-500/10 rounded-full blur-[120px] z-[2]" />

      <div className="absolute bottom-[-120px] right-[-120px] w-[420px] h-[420px] bg-indigo-500/10 rounded-full blur-[120px] z-[2]" />

      {/* CONTENT */}
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-8">

        {/* HEADER */}
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

            <span className="text-3xl sm:text-5xl">
              ⚽
            </span>

            <h1 className="text-[2rem] sm:text-6xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700">
              La Polla Mundialista
            </h1>

            <span className="text-3xl sm:text-5xl">
              ⚽
            </span>

          </div>

          <h2 className="mt-3 text-xl sm:text-3xl font-black tracking-[0.35em] uppercase">
            MAFISA MOTORS
          </h2>

          <div className="mt-6 flex justify-center">

            <div className="inline-flex items-center px-7 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 shadow-[0_0_30px_rgba(250,204,21,0.45)]">

              <span className="text-xl mr-3">
                💰
              </span>

              <span className="font-black uppercase tracking-widest text-slate-950">
                Pozo Acumulado: S/ 140
              </span>

            </div>

          </div>
        </div>

        {/* BARRAS */}
        <div
          ref={scrollRef}
          className="
            mt-10
            w-full
            max-w-7xl
            flex
            items-end
            justify-start md:justify-center
            gap-4
            sm:gap-6
            overflow-x-auto
            custom-scrollbar
            pb-6
            px-4
            md:px-0
          "
          style={{
            height: '520px'
          }}
        >

          {displayOrder.map((user) => {

            const rank =
              sorted.findIndex((p) => p.id === user.id);

            const isFirst = rank === 0;
            const isSecond = rank === 1;
            const isThird = rank === 2;

            const MAX_BAR_HEIGHT = 220;
            const MIN_BAR_HEIGHT = 140;

            const ratio =
              user.puntos / maxPuntos;

            const dynamicHeight =
              MIN_BAR_HEIGHT +
              ratio *
              (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT);

            const finalHeight =
              mounted ? dynamicHeight : 0;

            let barGradient =
              'bg-gradient-to-t from-slate-900 via-slate-700 to-slate-400 border-slate-300';

            let borderAvatar =
              'border-slate-300';

            let badge = rank + 1;

            if (isFirst) {

              barGradient =
                'bg-gradient-to-t from-yellow-950 via-yellow-600 to-yellow-300 border-yellow-200 shadow-[0_0_30px_rgba(250,204,21,0.5)]';

              borderAvatar =
                'border-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.5)]';

              badge = '🥇';
            }

            else if (isSecond) {

              barGradient =
                'bg-gradient-to-t from-slate-900 via-slate-400 to-slate-200 border-slate-100';

              badge = '🥈';
            }

            else if (isThird) {

              barGradient =
                'bg-gradient-to-t from-orange-950 via-orange-700 to-orange-400 border-orange-200';

              badge = '🥉';
            }

            return (

              <div
                key={user.id}
                onClick={() => {
                  activarGol();
                  setSelectedUser(user);
                }}
                className="
                  relative
                  flex
                  flex-col
                  items-center
                  shrink-0
                  cursor-pointer
                  group
                "
              >

                {/* AVATAR */}
                <div
                  className={`
                    relative z-20 flex flex-col items-center
                    transition-all duration-300
                    group-hover:-translate-y-3
                    ${isFirst ? 'mb-5' : 'mb-3'}
                  `}
                >

                  {isFirst && (
                    <div className="absolute -top-12 text-5xl animate-bounce z-30">
                      🏆
                    </div>
                  )}

                  <div
                    className={`
                      relative
                      rounded-full
                      overflow-hidden
                      border-4
                      bg-slate-900
                      transition-all duration-300
                      group-hover:scale-110
                      group-hover:rotate-3
                      ${isFirst
                        ? 'w-20 h-20 sm:w-24 sm:h-24 scale-110'
                        : 'w-16 h-16 sm:w-20 sm:h-20'}
                      ${borderAvatar}
                    `}
                  >

                    <img
                      src={user.img}
                      alt={user.nombre}
                      className="
                        w-full
                        h-full
                        object-contain
                        p-2
                        transition-all
                        duration-500
                        group-hover:scale-125
                        group-hover:-translate-y-1
                        animate-float-pokemon
                      "
                    />

                  </div>

                  <div className="relative mt-3 bg-[#081226]/95 border border-slate-700 rounded-2xl px-4 py-3 text-center shadow-2xl min-w-[110px]">

                    <div className="
                      absolute
                      -top-3
                      -right-3
                      w-7
                      h-7
                      rounded-full
                      bg-slate-700
                      flex
                      items-center
                      justify-center
                      text-xs
                      font-bold
                    ">
                      {badge}
                    </div>

                    <div className="text-sm font-black uppercase tracking-wider">
                      {user.nombre}
                    </div>

                    <div className="mt-1 text-3xl font-black leading-none">

                      <AnimatedCounter value={user.puntos} />

                      <span className="text-xs ml-1 text-slate-400">
                        PTS
                      </span>

                    </div>

                  </div>

                </div>

                {/* BARRA */}
                <div
                  className={`
                    relative
                    overflow-hidden
                    rounded-t-[28px]
                    border-t-4
                    border-l
                    border-r
                    transition-all
                    duration-[1800ms]
                    ease-out
                    hover:scale-[1.04]
                    hover:-translate-y-2
                    hover:shadow-[0_0_45px_rgba(255,255,255,0.15)]
                    ${barGradient}
                  `}
                  style={{
                    width:
                      window.innerWidth < 640
                        ? '95px'
                        : '125px',

                    height: `${finalHeight}px`
                  }}
                >

                  {/* TEXTURA */}
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                  {/* BRILLO */}
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />

                  {/* GLOW */}
                  <div className="absolute bottom-0 inset-x-0 h-14 bg-black/20 blur-lg" />

                  {/* HOVER */}
                  <div className="
                    absolute inset-0
                    opacity-0
                    group-hover:opacity-100
                    transition-opacity duration-300
                    bg-white/10
                  " />

                </div>
              </div>
            );
          })}
        </div>

        {/* PISO */}
        <div className="relative w-full max-w-7xl -mt-4 px-6">

          {/* SOMBRA */}
          <div className="
            absolute
            inset-x-10
            top-6
            h-10
            bg-black/40
            blur-2xl
            rounded-full
          " />

          {/* PLATAFORMA */}
          <div className="
            relative
            h-24
            rounded-[40px]
            overflow-hidden
            border
            border-slate-700
            bg-gradient-to-b
            from-slate-700
            via-slate-800
            to-slate-950
            shadow-[0_20px_50px_rgba(0,0,0,0.6)]
          ">

            {/* LINEAS */}
            <div className="absolute inset-0 opacity-10">

              <div className="
                absolute
                left-1/2
                top-0
                bottom-0
                w-[2px]
                bg-white
              " />

              <div className="
                absolute
                left-1/2
                top-1/2
                w-24
                h-24
                border-2
                border-white
                rounded-full
                -translate-x-1/2
                -translate-y-1/2
              " />

            </div>

            {/* BRILLO */}
            <div className="
              absolute
              inset-x-0
              top-0
              h-1/2
              bg-gradient-to-b
              from-white/10
              to-transparent
            " />

          </div>
        </div>

      </div>

      {/* PELOTA */}
      {shootBall && (
        <div className="fixed inset-0 pointer-events-none z-[300] overflow-hidden">

          <div className="shoot-ball">
            ⚽
          </div>

        </div>
      )}

      {/* BOTON */}
      <div className="fixed bottom-6 right-6 z-[150] flex flex-col items-end">

        {paisRandom && (

          <div className="mb-4 bg-slate-900/95 backdrop-blur-md border-2 border-emerald-500 text-white px-5 py-3 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-fade-in-down flex items-center gap-3">

            <span className="font-bold uppercase tracking-widest text-sm">
              ¡Confeti de {paisRandom.nombre}!
            </span>

            <img
              src={`https://flagcdn.com/w40/${paisRandom.flag}.png`}
              alt={paisRandom.nombre}
              className="w-8 h-6 rounded"
            />

          </div>
        )}

        <button
          onClick={activarBocina}
          className="
            group
            relative
            w-16
            h-16
            rounded-full
            flex
            items-center
            justify-center
            bg-gradient-to-br
            from-indigo-500
            to-purple-600
            border-2
            border-indigo-300
            shadow-[0_0_25px_rgba(99,102,241,0.7)]
            hover:scale-110
            transition-all
          "
        >

          <span className="text-3xl group-hover:-rotate-12 transition-transform">
            📣
          </span>

          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 animate-ping" />

          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white" />

        </button>
      </div>

      {/* MODAL */}
      {selectedUser && (

        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setSelectedUser(null)}
        >

          <div
            className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="p-6 border-b border-slate-700 flex items-center justify-between">

              <div className="flex items-center gap-5">

                <img
                  src={selectedUser.img}
                  alt=""
                  className="w-24 h-24 rounded-full bg-slate-800 p-2 border-4 border-slate-700"
                />

                <div>

                  <p className="text-emerald-400 text-sm uppercase tracking-widest font-bold">
                    Entrenador
                  </p>

                  <h3 className="text-4xl font-black uppercase">
                    {selectedUser.nombre}
                  </h3>

                  <p className="mt-2 text-yellow-400 font-bold">
                    {selectedUser.puntos} puntos
                  </p>

                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="text-3xl text-slate-400 hover:text-white"
              >
                ×
              </button>

            </div>

            <div className="p-6 max-h-[450px] overflow-y-auto custom-scrollbar">

              {selectedUser.predicciones.length > 0
                ? (
                  <div className="space-y-4">

                    {selectedUser.predicciones.map((pred, i) => (

                      <div
                        key={i}
                        className={`
                          p-5 rounded-2xl border
                          ${pred.acierto
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-slate-800/60 border-slate-700'
                          }
                        `}
                      >

                        <div className="flex items-center justify-center gap-5">

                          <div className="text-center">

                            <img
                              src={`https://flagcdn.com/w40/${pred.flag1}.png`}
                              className="w-10 h-7 rounded mx-auto mb-2"
                            />

                            <span className="font-bold text-sm">
                              {pred.eq1}
                            </span>

                          </div>

                          <div className="text-center">

                            <div className="text-xs text-slate-400 uppercase mb-1">
                              Pronóstico
                            </div>

                            <div className="text-3xl font-black bg-slate-950 px-4 py-2 rounded-xl">
                              {pred.pronostico}
                            </div>

                          </div>

                          <div className="text-center">

                            <img
                              src={`https://flagcdn.com/w40/${pred.flag2}.png`}
                              className="w-10 h-7 rounded mx-auto mb-2"
                            />

                            <span className="font-bold text-sm">
                              {pred.eq2}
                            </span>

                          </div>

                        </div>

                      </div>
                    ))}

                  </div>
                )
                : (
                  <div className="py-16 text-center opacity-60">

                    <div className="text-5xl mb-3">
                      🤷‍♂️
                    </div>

                    <p className="font-bold uppercase">
                      No hay predicciones
                    </p>

                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style
        dangerouslySetInnerHTML={{
          __html: `

          @keyframes stadium-pan {
            0% {
              transform: scale(1.08) translate(0%, 0%);
            }
            100% {
              transform: scale(1.12) translate(-2%, 1%);
            }
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 999px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }

          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in-down {
            animation: fadeInDown .4s ease;
          }

          @keyframes floatPokemon {

            0% {
              transform: translateY(0px);
            }

            50% {
              transform: translateY(-6px);
            }

            100% {
              transform: translateY(0px);
            }
          }

          .animate-float-pokemon {
            animation:
              floatPokemon 3s ease-in-out infinite;
          }

          @keyframes shootBall {

            0% {
              transform:
                translate(-200px, 250px)
                scale(0.5)
                rotate(0deg);

              opacity: 0;
            }

            20% {
              opacity: 1;
            }

            100% {
              transform:
                translate(120vw, -40vh)
                scale(1.8)
                rotate(1080deg);

              opacity: 0;
            }
          }

          .shoot-ball {
            position: absolute;
            left: 0;
            bottom: 0;
            font-size: 5rem;
            animation:
              shootBall 1.2s ease-out forwards;
          }

        `
        }}
      />
    </div>
  );
}