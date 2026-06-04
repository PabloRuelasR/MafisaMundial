import React, { useState, useEffect, useRef } from 'react';
import { auth } from './services/firebase';
import { seedMatches } from './services/matches';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  collection,
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
import './styles/animations.css';



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
  const scrollRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) {
          setCurrentUser(userDoc.data());
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const cargarParticipantes = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'usuarios'));

        const usuarios = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            nombre: data.nombre,
            img: data.img,
            puntos: data.puntosTotal || 0,
            predicciones: data.predicciones || [],
            rol: data.rol || 'user'
          };
        });

        setParticipantes(usuarios);

      } catch (error) {
        console.error('Error cargando usuarios:', error);
      }
    };

    cargarParticipantes();
  }, []);

//   useEffect(() => {
//   seedMatches();
// }, []);


  if (authLoading) {
    return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Cargando...</div>;
  }

  // Si no hay usuario logueado o no ha completado su perfil, mostramos el Login
  if (!currentUser) {
    return <LoginScreen onLoginComplete={(profile) => setCurrentUser(profile)} />;
  }

  const activarBocina = () => {
    const pais =
      paisesMundial[
      Math.floor(Math.random() * paisesMundial.length)
      ];

    setPaisRandom(pais);

    // SONIDO
    const audio = new Audio(
      'https://actions.google.com/sounds/v1/alarms/air_horn.ogg'
    );

    audio.volume = 0.3;

    audio.play().catch(() => { });

    // CONFETTI
    confetti({
      particleCount: 220,
      spread: 130,
      origin: { y: 0.6 },
      colors: pais.colores,
      zIndex: 9999
    });

    // EXTRA EXPLOSIÓN
    setTimeout(() => {
      confetti({
        particleCount: 120,
        angle: 60,
        spread: 90,
        origin: { x: 0 },
        colors: pais.colores
      });

      confetti({
        particleCount: 120,
        angle: 120,
        spread: 90,
        origin: { x: 1 },
        colors: pais.colores
      });
    }, 250);

    setTimeout(() => setPaisRandom(null), 4000);
  };

  const activarGol = () => {
    setShootBall(true);

    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.7 },
      colors: ['#ffffff', '#22c55e']
    });

    setTimeout(() => setShootBall(false), 1200);
  };

  // Lógica de ordenamiento
  const sorted = [...participantes].sort((a, b) => b.puntos - a.puntos);
  const displayOrder = sorted;
  const maxPuntos = sorted[0]?.puntos || 1;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">

      <button
        onClick={() => auth.signOut()}
        className="absolute top-4 right-4 z-[200] text-sm text-slate-400 hover:text-white"
      >
        Cerrar Sesión
      </button>

      <div className="fixed top-4 left-4 z-[200] flex gap-3">

        <button
          onClick={() => setShowPredictions(true)}
          className="
              px-5 py-3 rounded-2xl
              bg-gradient-to-r from-yellow-500 to-amber-500
              text-black font-black
              shadow-[0_0_20px_rgba(250,204,21,0.4)]
              hover:scale-105 transition-all
            "
        >
          ⚽ Pronósticos
        </button>

        <button
          onClick={() => setShowMyPredictions(true)}
          className="
            px-5 py-3 rounded-2xl
            bg-gradient-to-r from-indigo-500 to-purple-600
            text-white font-black
            shadow-[0_0_20px_rgba(99,102,241,0.4)]
            hover:scale-105 transition-all
          "
        >
          📜 Mis Pronósticos
        </button>

        {
          currentUser?.rol === 'admin' && (
            <button
              onClick={() => setShowAdmin(true)}
              className="
          px-5 py-3 rounded-2xl
          bg-gradient-to-r from-red-500 to-rose-600
          text-white font-black
          shadow-[0_0_20px_rgba(239,68,68,0.4)]
          hover:scale-105 transition-all
        "
            >
              🛠 Auditar
            </button>
          )
        }

      </div>
      {/* BACKGROUND & OVERLAYS */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: 'cover', backgroundPosition: 'center', transform: 'scale(1.08)',
          filter: 'blur(5px) brightness(0.35)', zIndex: 0,
          animation: 'stadium-pan 25s ease-in-out infinite alternate'
        }}
      />
      <div className="absolute inset-0 bg-[#020617]/65 z-[1]" />
      <div className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] bg-emerald-500/10 rounded-full blur-[120px] z-[2]" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[420px] h-[420px] bg-indigo-500/10 rounded-full blur-[120px] z-[2]" />

      {/* CONTENT */}
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-8">
        <Header />

        {/* BARRAS */}
        <div ref={scrollRef} className="mt-10 w-full max-w-7xl flex items-end justify-start md:justify-center gap-4 sm:gap-6 overflow-x-auto custom-scrollbar pb-6 px-4 md:px-0" style={{ height: '520px' }}>
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

        <Platform />
      </div>

      {/* PELOTA */}
      {shootBall && (
        <div className="fixed inset-0 pointer-events-none z-[300] overflow-hidden">
          <div className="shoot-ball">⚽</div>
        </div>
      )}

      {/* BOTON BOCINA */}
      <div className="fixed bottom-6 right-6 z-[150] flex flex-col items-end">
        {paisRandom && (
          <div className="mb-4 bg-slate-900/95 backdrop-blur-md border-2 border-emerald-500 text-white px-5 py-3 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-fade-in-down flex items-center gap-3">
            <span className="font-bold uppercase tracking-widest text-sm">¡Confeti de {paisRandom.nombre}!</span>
            <img src={`https://flagcdn.com/w40/${paisRandom.flag}.png`} alt={paisRandom.nombre} className="w-8 h-6 rounded" />
          </div>
        )}
        <button
          onClick={activarBocina}
          className="group relative w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-indigo-300 shadow-[0_0_25px_rgba(99,102,241,0.7)] hover:scale-110 transition-all"
        >
          <span className="text-3xl group-hover:-rotate-12 transition-transform">📣</span>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 animate-ping" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white" />
        </button>
      </div>

      {/* MODAL */}
      <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />

      {
        showPredictions && (
          <div
            className="
        fixed inset-0 z-[400]
        bg-black/80 backdrop-blur-md
        flex items-center justify-center
        p-4
      "
            onClick={() => setShowPredictions(false)}
          >

            <div
              className="
          w-full max-w-6xl
          max-h-[90vh]
          overflow-y-auto
          rounded-3xl
          border border-slate-700
          bg-[#081226]
          p-8
          custom-scrollbar
        "
              onClick={(e) => e.stopPropagation()}
            >

              <div className="flex items-center justify-between mb-8">

                <div>

                  <h2 className="text-4xl font-black">
                    Pronósticos
                  </h2>

                  <p className="text-slate-400 mt-2">
                    Registra tus resultados
                  </p>

                </div>

                <button
                  onClick={() => setShowPredictions(false)}
                  className="
              w-12 h-12 rounded-full
              bg-slate-800 hover:bg-slate-700
              text-2xl
            "
                >
                  ×
                </button>

              </div>

              <PredictionPanel
                currentUser={currentUser}
              />

            </div>

          </div>
        )
      }

      {
        showAdmin && (
          <div
            className="
        fixed inset-0 z-[500]
        bg-black/80 backdrop-blur-md
        flex items-center justify-center
        p-4
      "
            onClick={() => setShowAdmin(false)}
          >

            <div
              className="
          w-full max-w-7xl
          max-h-[90vh]
          overflow-y-auto
          rounded-3xl
          border border-slate-700
          bg-[#081226]
          p-8
          custom-scrollbar
        "
              onClick={(e) => e.stopPropagation()}
            >

              <div className="flex items-center justify-between mb-8">

                <div>

                  <h2 className="text-4xl font-black">
                    Panel Admin
                  </h2>

                  <p className="text-slate-400 mt-2">
                    Auditoría de partidos
                  </p>

                </div>

                <button
                  onClick={() => setShowAdmin(false)}
                  className="
              w-12 h-12 rounded-full
              bg-slate-800 hover:bg-slate-700
              text-2xl
            "
                >
                  ×
                </button>

              </div>

              <AdminPanel />

            </div>

          </div>
        )
      }

      {
        showMyPredictions && (
          <MyPredictionsModal
            currentUser={currentUser}
            onClose={() => setShowMyPredictions(false)}
          />
        )
      }
    </div>
  );
}