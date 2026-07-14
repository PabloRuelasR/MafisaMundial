import React, { useState, useEffect, useRef } from 'react';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from './services/firebase';
import { paisesMundial } from './data/mockData';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import PodiumItem from './components/PodiumItem';
import Platform from './components/Platform';
import UserModal from './components/UserModal';
import LoginScreen from './components/LoginScreen';
import PredictionPanel from './components/PredictionPanel';
import AdminPanel from './components/AdminPanel';
import MyPredictionsModal from './components/MyPredictionsModal';
import GroupPicksModal from './components/GroupPicksModal';
import './styles/animations.css';
import TodayPredictionsModal from './components/TodayPredictionsModal';
import AdminEditPredictionsModal from './components/AdminEditPredictionsModal';
import { traducirPais } from './js/Utils/traductor';
import AdminSeeder from './components/AdminSeeder';
import LiveMatchModal from './components/LiveMatchModal';
import GeneralSummaryModal from './components/GeneralSummaryModal';

export default function App() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [mounted, setMounted] = useState(true);
  const [paisRandom, setPaisRandom] = useState(null);
  const [shootBall, setShootBall] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [participantes, setParticipantes] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showMyPredictions, setShowMyPredictions] = useState(false);
  const [showGroupPicks, setShowGroupPicks] = useState(false);
  const [showTodayPicks, setShowTodayPicks] = useState(false);
  const [tickerItems, setTickerItems] = useState([]);
  const [showAdminEditPicks, setShowAdminEditPicks] = useState(false);
  const [showLiveMatch, setShowLiveMatch] = useState(false);
  const [showGeneralSummary, setShowGeneralSummary] = useState(false); // <-- Añade esta línea
  const participantesRef = useRef(participantes);

  useEffect(() => {
    participantesRef.current = participantes;
  }, [participantes]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) {
          setCurrentUser({ ...userDoc.data(), uid: user.uid });
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'usuarios'),
      (snapshot) => {
        try {
          const usuarios = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              uid: data.uid,
              nombre: data.nombre,
              img: data.img,
              puntos: data.puntosTotal || 0,
              rol: data.rol || 'user'
            };
          });

          usuarios.sort((a, b) => b.puntos - a.puntos);
          setParticipantes(usuarios);

          if (currentUser) {
            const currentInRank = usuarios.find(u => u.uid === currentUser.uid);
            if (currentInRank && currentInRank.puntos !== currentUser.puntosTotal) {
              setCurrentUser(prev => ({ ...prev, puntosTotal: currentInRank.puntos }));
            }
          }
        } catch (error) {
          console.error('Error procesando usuarios:', error);
        }
      },
      (error) => {
        console.error('Error escuchando usuarios:', error);
      }
    );
    return () => unsubscribe();
  }, [currentUser?.uid]);

  useEffect(() => {

    const qPartidos = query(collection(db, 'partidos'), where('estado', '==', 'finalizado'));

    const unsubscribe = onSnapshot(qPartidos, async (snapshot) => {
      if (snapshot.empty) {
        const emptyMsg = [{ id: 'sys1', jugador: 'SISTEMA', puntos: 0, msg: 'Aún no hay partidos auditados.' }];
        setTickerItems([...emptyMsg, ...emptyMsg, ...emptyMsg]);
        return;
      }

      try {
        const finalizados = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        finalizados.sort((a, b) => {
          if (a.fechaPartido === b.fechaPartido) return (b.horaPartido || '').localeCompare(a.horaPartido || '');
          return (b.fechaPartido || '').localeCompare(a.fechaPartido || '');
        });

        const lastMatch = finalizados[0];
        const eq1 = traducirPais(lastMatch.equipo1);
        const eq2 = traducirPais(lastMatch.equipo2);

        const qPronos = query(collection(db, 'pronosticos'), where('partidoId', '==', lastMatch.id));
        const pronosSnap = await getDocs(qPronos);

        const items = [];
        pronosSnap.forEach(docSnap => {
          const p = docSnap.data();
          const user = participantesRef.current.find(u => u.uid === p.uid);
          const nombre = user ? user.nombre : 'Jugador';

          let msg = '';
          if (p.puntosTotales === 4) {
            msg = `clavó el marcador exacto (${lastMatch.marcador1}-${lastMatch.marcador2}) en el ${eq1} vs ${eq2} y sumó +4 pts`;
          } else if (p.puntosTotales > 0) {
            msg = `acertó la tendencia del ${eq1} vs ${eq2} y sumó +${p.puntosTotales} pts`;
          } else {
            msg = `no sumó puntos en el ${eq1} vs ${eq2} (0 pts)`;
          }

          items.push({ id: docSnap.id, jugador: nombre, puntos: p.puntosTotales, msg });
        });

        const displayItems = items.length > 0
          ? items.sort((a, b) => b.puntos - a.puntos)
          : [{ id: 'nobody', jugador: 'SISTEMA', puntos: 0, msg: `Nadie sumó puntos en el ${eq1} vs ${eq2}.` }];

        const repeated = [];
        for (let i = 0; i < 4; i++) {
          repeated.push(...displayItems.map(item => ({ ...item, uniqueKey: `${item.id}_${i}` })));
        }
        setTickerItems(repeated);

      } catch (error) {
        console.error('Error generando ticker:', error);
      }
    });

    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return <div className="h-[100dvh] bg-[#020617] flex items-center justify-center text-white font-bold tracking-widest animate-pulse">Cargando...</div>;
  }

  if (!currentUser) {
    return <LoginScreen onLoginComplete={(profile) => setCurrentUser(profile)} />;
  }

  const activarBocina = () => {
    const pais = paisesMundial[Math.floor(Math.random() * paisesMundial.length)];
    setPaisRandom(pais);
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/air_horn.ogg');
    audio.volume = 0.3;
    audio.play().catch(() => { });
    confetti({ particleCount: 220, spread: 130, origin: { y: 0.6 }, colors: pais.colores, zIndex: 9999 });
    setTimeout(() => {
      confetti({ particleCount: 120, angle: 60, spread: 90, origin: { x: 0 }, colors: pais.colores });
      confetti({ particleCount: 120, angle: 120, spread: 90, origin: { x: 1 }, colors: pais.colores });
    }, 250);
    setTimeout(() => setPaisRandom(null), 4000);
  };

  const activarGol = () => {
    setShootBall(true);
    confetti({ particleCount: 80, spread: 90, origin: { y: 0.7 }, colors: ['#ffffff', '#22c55e'] });
    setTimeout(() => setShootBall(false), 1200);
  };

  const sorted = [...participantes].sort((a, b) => b.puntos - a.puntos);
  const displayOrder = sorted;
  const maxPuntos = sorted[0]?.puntos || 1;

  return (
    <div className="relative min-h-[100dvh] sm:h-[100dvh] w-full overflow-x-hidden overflow-y-auto sm:overflow-hidden bg-[#020617] text-white selection:bg-cyan-500 flex flex-col">

      {/* ANIMACIÓN DEL CARRUSEL (Velocidad suave 38s) */}
      <style>{`
        @keyframes ticker-slide {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-ticker { animation: ticker-slide 38s linear infinite; }
        .animate-ticker:hover { animation-play-state: paused; }
      `}</style>

      {/* FONDO ANIMADO ESTADIO */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2070&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center', transform: 'scale(1.08)', filter: 'blur(5px) brightness(0.35)', zIndex: 0, animation: 'stadium-pan 25s ease-in-out infinite alternate' }} />
      <div className="absolute inset-0 bg-[#020617]/75 z-[1] pointer-events-none" />
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] z-[2] animate-pulse pointer-events-none" />

      {/* TOP NAVBAR (Usuario y Salir) - Estructura limpia y textos proporcionales */}
      <div className="absolute top-0 w-full h-16 px-4 sm:px-6 flex justify-between items-center z-[200]">
        <div className="flex items-center gap-3 pointer-events-auto">
          <img src={currentUser.img || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} alt="Avatar" className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-slate-700 shadow-[0_0_15px_rgba(255,255,255,0.1)] object-cover" />
          <div className="leading-tight mt-0.5">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Bienvenido,</p>
            <p className="text-sm sm:text-base font-bold text-white tracking-wide">{currentUser.nombre}</p>
          </div>
        </div>
        <button onClick={() => auth.signOut()} className="pointer-events-auto text-[10px] sm:text-xs font-bold text-slate-400 hover:text-red-400 bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50 shadow-md transition-colors tracking-widest uppercase">
          SALIR
        </button>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="relative z-10 flex-1 flex flex-col w-full pt-16 sm:pt-20 pb-0 min-h-0">

        {/* === SECCIÓN SUPERIOR: TÍTULO, PUNTOS Y BOTONES === */}
        <div className="shrink-0 w-full mx-auto px-4 flex flex-col items-center gap-2 relative z-20">

          <Header />

          {/* TARJETA UNIFICADA (Puntos + Controles) */}
          <div className="w-full max-w-4xl bg-slate-900/80 backdrop-blur-xl p-2 sm:p-3 rounded-2xl border border-slate-700/60 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 relative">

            {/* Puntos de Usuario */}
            <div className="flex items-center gap-3 px-5 py-2 bg-black/30 rounded-xl border border-white/5 w-full sm:w-auto justify-center">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Tus Puntos</span>
              <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 leading-none drop-shadow-sm">
                {currentUser.puntosTotal || 0}
              </div>
            </div>

            {/* Menú de Botones */}
            <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
              <button onClick={() => setShowPredictions(true)} className="flex-1 sm:w-[100px] py-2 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 hover:from-blue-600 hover:to-cyan-600 border border-slate-700 hover:border-cyan-400 flex flex-col items-center justify-center transition-all group">
                <span className="text-base group-hover:scale-110 transition-transform">⚽</span>
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Pronósticos</span>
              </button>

              <button onClick={() => setShowMyPredictions(true)} className="flex-1 sm:w-[100px] py-2 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 hover:from-indigo-600 hover:to-purple-600 border border-slate-700 hover:border-indigo-400 flex flex-col items-center justify-center transition-all group">
                <span className="text-base group-hover:scale-110 transition-transform">📜</span>
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Historial</span>
              </button>

              {/*<button onClick={() => setShowGroupPicks(true)} className="flex-1 sm:w-[100px] py-2 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 hover:from-emerald-600 hover:to-teal-600 border border-slate-700 hover:border-emerald-400 flex flex-col items-center justify-center transition-all group">
                <span className="text-base group-hover:scale-110 transition-transform">📊</span>
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Fase Grupos</span>
              </button>*/}

              {/* <button onClick={() => setShowLiveMatch(true)} className="flex-1 sm:w-[100px] py-2 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 hover:from-amber-600 hover:to-orange-600 border border-slate-700 hover:border-amber-400 flex flex-col items-center justify-center transition-all group relative">
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]"></span>
                <span className="text-base group-hover:scale-110 transition-transform">📺</span>
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Vivo</span>
              </button> */}

              <button onClick={() => setShowTodayPicks(true)} className="flex-1 sm:w-[100px] py-2 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 hover:from-orange-600 hover:to-red-600 border border-slate-700 hover:border-orange-400 flex flex-col items-center justify-center transition-all group">
                <span className="text-base group-hover:scale-110 transition-transform">🎯</span>
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Hoy</span>
              </button>

              <button onClick={() => setShowGeneralSummary(true)} className="flex-1 sm:w-[100px] py-2 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 hover:from-emerald-600 hover:to-teal-600 border border-slate-700 hover:border-emerald-400 flex flex-col items-center justify-center transition-all group">
                <span className="text-base group-hover:scale-110 transition-transform">📊</span>
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Resumen</span>
              </button>

              {currentUser?.rol === 'admin' && (

                <>

                  <button onClick={() => setShowAdmin(true)} className="flex-1 sm:w-[100px] py-2 rounded-xl bg-red-950/40 border border-red-900/30 hover:bg-red-900 flex flex-col items-center justify-center transition-all group">
                    <span className="text-base group-hover:scale-110 transition-transform">🛠</span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-red-400 uppercase tracking-wider mt-0.5">Auditar</span>
                  </button>
                  <button onClick={() => setShowAdminEditPicks(true)} className="flex-1 sm:w-[85px] py-2 rounded-xl bg-purple-950/40 border border-purple-900/30 hover:bg-purple-900 flex flex-col items-center justify-center transition-all group">
                    <span className="text-base group-hover:scale-110 transition-transform">📝</span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-purple-400 uppercase tracking-wider mt-0.5">Editar Picks</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* === SECCIÓN CENTRAL: PODIO Y PLATAFORMA (Crece de forma flexible) === */}
        <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col justify-end mt-4 sm:mt-6 relative min-h-[340px] sm:min-h-0 z-10">

          <div className="shrink-0 flex flex-col items-center mb-1">
            <h2 className="text-xs sm:text-sm font-black text-slate-300 tracking-[0.2em] uppercase flex items-center gap-3">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-slate-500"></span>
              🏆 Ranking Global
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-slate-500"></span>
            </h2>
          </div>

          <div className="flex-1 w-full flex items-end justify-start md:justify-center gap-2 sm:gap-6 overflow-x-auto overflow-y-hidden custom-scrollbar px-2 pb-0">
            {displayOrder.map((user) => {
              const rank = sorted.findIndex((p) => p.id === user.id);
              return (
                <PodiumItem
                  key={user.id}
                  user={user}
                  rank={rank}
                  maxPuntos={maxPuntos}
                  mounted={mounted}
                  onClick={() => { activarGol(); setSelectedUser(user); }}
                />
              );
            })}
          </div>
        </div>

        {/* === SECCIÓN INFERIOR: TICKER NOTICIAS (Siempre pegado abajo) === */}
        <div className="shrink-0 w-full h-10 sm:h-12 bg-slate-950/90 border-t border-slate-800 flex items-center overflow-hidden z-[100] shadow-[0_-10px_20px_rgba(0,0,0,0.5)] mt-auto">
          <div className="w-max flex items-center whitespace-nowrap animate-ticker pl-4">
            {tickerItems.map((item) => (
              <div key={item.uniqueKey} className="inline-flex items-center mx-6 sm:mx-10 text-[10px] sm:text-xs font-medium tracking-wide">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 shadow-md ${item.puntos === 4 ? 'bg-yellow-400' : item.puntos === 0 ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                <span className={`font-black uppercase mr-1.5 ${item.puntos === 4 ? 'text-yellow-400' : item.puntos === 0 ? 'text-red-400' : 'text-cyan-400'}`}>
                  {item.jugador}
                </span>
                <span className="text-slate-300">{item.msg}</span>
                {item.puntos === 4 && <span className="ml-1.5 text-sm animate-bounce">🔥</span>}
                {item.puntos === 0 && <span className="ml-1.5 text-sm opacity-70">💀</span>}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* EFECTOS FLOTANTES */}
      {shootBall && (
        <div className="fixed inset-0 pointer-events-none z-[300] overflow-hidden">
          <div className="shoot-ball">⚽</div>
        </div>
      )}

      {/* BOTÓN ALERTA / BOCINA FLOTANTE */}
      <div className="fixed bottom-14 right-3 sm:bottom-16 sm:right-6 z-[150] flex flex-col items-end pointer-events-auto">
        {paisRandom && (
          <div className="mb-2 bg-slate-900/95 backdrop-blur-md border border-emerald-500 text-white px-3 py-1.5 rounded-xl shadow-lg animate-fade-in-down flex items-center gap-2">
            <span className="font-bold uppercase tracking-widest text-[9px]">¡Confeti de {paisRandom.nombre}!</span>
            <img src={`https://flagcdn.com/w40/${paisRandom.flag}.png`} alt="" className="w-5 h-3 rounded" />
          </div>
        )}
        <button onClick={activarBocina} className="group relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-indigo-300 shadow-xl hover:scale-110 transition-all">
          <span className="text-xl sm:text-2xl group-hover:-rotate-12 transition-transform">📣</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-red-500 animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-red-500 border-2 border-white" />
        </button>
      </div>

      {/* MODALES */}
      <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      {showPredictions && (<div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4" onClick={() => setShowPredictions(false)}><div className="w-full max-w-6xl max-h-[95dvh] overflow-y-auto rounded-3xl border border-slate-700 bg-[#081226] p-4 sm:p-8 custom-scrollbar" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between mb-6 sm:mb-8"><div><h2 className="text-2xl sm:text-4xl font-black">Pronósticos</h2><p className="text-slate-400 mt-1 text-xs sm:text-sm">Registra tus resultados estimados</p></div><button onClick={() => setShowPredictions(false)} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-xl flex items-center justify-center">×</button></div><PredictionPanel currentUser={currentUser} /></div></div>)}
      {showAdmin && (<div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4" onClick={() => setShowAdmin(false)}><div className="w-full max-w-7xl max-h-[95dvh] overflow-y-auto rounded-3xl border border-slate-700 bg-[#081226] p-4 sm:p-8 custom-scrollbar" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between mb-6 sm:mb-8"><div><h2 className="text-2xl sm:text-4xl font-black">Panel Admin</h2><p className="text-slate-400 mt-1 text-xs sm:text-sm">Auditoría oficial de marcadores</p></div><button onClick={() => setShowAdmin(false)} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-xl flex items-center justify-center">×</button></div><AdminPanel /></div></div>)}
      {showAdminEditPicks && (
        <AdminEditPredictionsModal
          participantes={participantes}
          onClose={() => setShowAdminEditPicks(false)}
        />
      )}
      {showMyPredictions && <MyPredictionsModal currentUser={currentUser} onClose={() => setShowMyPredictions(false)} />}
      {showGroupPicks && <GroupPicksModal onClose={() => setShowGroupPicks(false)} />}
      {showTodayPicks && <TodayPredictionsModal onClose={() => setShowTodayPicks(false)} participantes={participantes} />}
      {showLiveMatch && <LiveMatchModal onClose={() => setShowLiveMatch(false)} />}
      {showGeneralSummary && <GeneralSummaryModal onClose={() => setShowGeneralSummary(false)} participantes={participantes} />}

      {/* {currentUser?.rol === 'admin' && (
        <AdminSeeder></AdminSeeder>
      )} */}
    </div>
  );
}