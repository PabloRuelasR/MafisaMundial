
import React, {
  useEffect,
  useState
} from 'react';

import {
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';

import { db } from '../services/firebase';
import { traducirPais } from '../js/Utils/traductor';


export default function UserModal({
  user,
  onClose
}) {

  const [predictions, setPredictions] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (!user) return;

    loadPredictions();

  }, [user]);

  const loadPredictions = async () => {

    try {

      setLoading(true);
      console.log('Loading predictions for user:', user.nombre);
      const q = query(
        collection(db, 'pronosticos'),
        where('uid', '==', user.id),
        where('auditado', '==', true)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      data.sort((a, b) =>
        b.fechaPartido.localeCompare(a.fechaPartido)
      );

      setPredictions(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  };

  if (!user) return null;

  return (
    <div
      className="
                fixed inset-0 z-[200]
                flex items-center justify-center
                p-4
                bg-black/80 backdrop-blur-md
            "
      onClick={onClose}
    >

      <div
        className="
                    w-full max-w-5xl
                    h-[95vh] md:h-auto
                    max-h-[95vh]

                    overflow-hidden

                    bg-slate-900
                    border border-slate-700
                    rounded-3xl
                "
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="
                    p-4 md:p-6
                    border-b border-slate-700
                    flex items-center justify-between
                ">

          <div className="
                        flex flex-col md:flex-row
                        items-center
                        gap-5
                    ">

            <img
              src={user.img}
              alt=""
              className="
                                w-20 h-20 md:w-24 md:h-24
                                rounded-full
                                bg-slate-800
                                p-2
                                border-4 border-slate-700
                            "
            />

            <div className="text-center md:text-left">

              <p className="
                                text-emerald-400
                                text-sm
                                uppercase
                                tracking-widest
                                font-bold
                            ">
                Participante
              </p>

              <h3 className="
                                text-2xl md:text-4xl
                                font-black
                                uppercase
                            ">
                {user.nombre}
              </h3>

              <p className="
                                mt-2
                                text-yellow-400
                                font-bold
                                text-lg
                            ">
                {user.puntos || 0} puntos
              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="
                            w-12 h-12
                            rounded-full
                            bg-slate-800
                            hover:bg-slate-700
                            text-2xl
                            shrink-0
                        "
          >
            ×
          </button>

        </div>

        {/* CONTENT */}
        <div className="
                    p-4 md:p-6
                    overflow-y-auto
                    h-[calc(95vh-120px)]
                    md:max-h-[650px]
                    custom-scrollbar
                ">

          {loading && (

            <div className="
                            flex items-center justify-center
                            py-20
                        ">

              <div className="
                                w-10 h-10
                                border-4 border-yellow-500/30
                                border-t-yellow-500
                                rounded-full
                                animate-spin
                            " />

            </div>

          )}

          {!loading && predictions.length === 0 && (

            <div className="
                            py-20
                            text-center
                            opacity-60
                        ">

              <div className="text-6xl mb-5">
                ⚽
              </div>

              <p className="
                                font-black
                                uppercase
                                text-xl
                            ">
                No hay partidos auditados
              </p>

            </div>

          )}

          {!loading && predictions.length > 0 && (

            <div className="space-y-5">

              {predictions.map((pred) => (

                <div
                  key={pred.id}
                  className="
                                        p-4 md:p-6
                                        rounded-3xl

                                        border

                                        bg-slate-800/60

                                        border-slate-700
                                    "
                >

                  {/* MATCH */}
                  <div className="
                                        flex flex-col md:flex-row
                                        items-center
                                        justify-between
                                        gap-6
                                    ">

                    {/* TEAM 1 */}
                    <div className="
                                            flex flex-col items-center
                                            text-center
                                            w-full md:w-[180px]
                                        ">

                      <img
                        src={`https://flagcdn.com/w80/${pred.flag1}.png`}
                        className="
                                                    w-14 h-10
                                                    rounded
                                                    mb-2
                                                "
                      />

                      <div className="
                                                font-black
                                                text-lg
                                            ">
                        {traducirPais(pred.equipo1)}
                      </div>

                    </div>

                    {/* CENTER */}
                    <div className="
                                            flex flex-col items-center
                                            w-full
                                        ">

                      {/* PRONOSTICO */}
                      <div className="mb-6">

                        <div className="
                                                    text-xs uppercase
                                                    tracking-widest
                                                    text-slate-400
                                                    mb-3
                                                    text-center
                                                ">
                          Pronóstico
                        </div>

                        <div className="
                                                    flex items-center
                                                    justify-center
                                                    gap-3
                                                ">

                          <div className="
                                                        w-14 h-14
                                                        rounded-2xl

                                                        bg-yellow-500/20
                                                        border border-yellow-500

                                                        flex items-center justify-center

                                                        text-2xl font-black
                                                    ">
                            {pred.score1}
                          </div>

                          <div className="
                                                        text-3xl font-black
                                                    ">
                            -
                          </div>

                          <div className="
                                                        w-14 h-14
                                                        rounded-2xl

                                                        bg-yellow-500/20
                                                        border border-yellow-500

                                                        flex items-center justify-center

                                                        text-2xl font-black
                                                    ">
                            {pred.score2}
                          </div>

                        </div>

                      </div>

                      {/* OFICIAL */}
                      <div className="mb-6">

                        <div className="
                                                    text-xs uppercase
                                                    tracking-widest
                                                    text-slate-400
                                                    mb-3
                                                    text-center
                                                ">
                          Resultado Oficial
                        </div>

                        <div className="
                                                    flex items-center
                                                    justify-center
                                                    gap-3
                                                ">

                          <div className="
                                                        w-14 h-14
                                                        rounded-2xl

                                                        bg-emerald-500/20
                                                        border border-emerald-500

                                                        flex items-center justify-center

                                                        text-2xl font-black
                                                    ">
                            {pred.marcadorOficial1}
                          </div>

                          <div className="
                                                        text-3xl font-black
                                                    ">
                            -
                          </div>

                          <div className="
                                                        w-14 h-14
                                                        rounded-2xl

                                                        bg-emerald-500/20
                                                        border border-emerald-500

                                                        flex items-center justify-center

                                                        text-2xl font-black
                                                    ">
                            {pred.marcadorOficial2}
                          </div>

                        </div>

                      </div>

                      {/* RESULT */}
                      <div className="
                                                grid grid-cols-1 md:grid-cols-3
                                                gap-4
                                                w-full
                                            ">

                        <div className="
                                                    rounded-2xl
                                                    p-4
                                                    bg-slate-950/60
                                                    text-center
                                                ">

                          <div className="
                                                        text-xs
                                                        uppercase
                                                        tracking-widest
                                                        text-slate-400
                                                        mb-2
                                                    ">
                            Ganador
                          </div>

                          <div className={`
                                                        text-lg font-black
                                                        ${pred.acertoGanador
                              ? 'text-emerald-400'
                              : 'text-red-400'
                            }
                                                    `}>
                            {
                              pred.acertoGanador
                                ? '✓ Acertó'
                                : '✗ Falló'
                            }
                          </div>

                        </div>

                        <div className="
                                                    rounded-2xl
                                                    p-4
                                                    bg-slate-950/60
                                                    text-center
                                                ">

                          <div className="
                                                        text-xs
                                                        uppercase
                                                        tracking-widest
                                                        text-slate-400
                                                        mb-2
                                                    ">
                            Score Exacto
                          </div>

                          <div className={`
                                                        text-lg font-black
                                                        ${pred.acertoScoreExacto
                              ? 'text-emerald-400'
                              : 'text-red-400'
                            }
                                                    `}>
                            {
                              pred.acertoScoreExacto
                                ? '✓ Acertó'
                                : '✗ Falló'
                            }
                          </div>

                        </div>

                        <div className="
                                                    rounded-2xl
                                                    p-4
                                                    bg-yellow-500/10
                                                    border border-yellow-500/30
                                                    text-center
                                                ">

                          <div className="
                                                        text-xs
                                                        uppercase
                                                        tracking-widest
                                                        text-yellow-300
                                                        mb-2
                                                    ">
                            Puntos
                          </div>

                          <div className="
                                                        text-3xl
                                                        font-black
                                                        text-yellow-400
                                                    ">
                            +{pred.puntosTotales}
                          </div>

                        </div>

                      </div>

                    </div>

                    {/* TEAM 2 */}
                    <div className="
                                            flex flex-col items-center
                                            text-center
                                            w-full md:w-[180px]
                                        ">

                      <img
                        src={`https://flagcdn.com/w80/${pred.flag2}.png`}
                        className="
                                                    w-14 h-10
                                                    rounded
                                                    mb-2
                                                "
                      />

                      <div className="
                                                font-black
                                                text-lg
                                            ">
                        {traducirPais(pred.equipo2)}
                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

