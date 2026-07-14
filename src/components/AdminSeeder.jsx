// src/components/AdminSeeder.jsx
import React, { useState } from 'react';
import { seedKnockoutMatches } from '../services/matches';

// Copiamos el array aquí directamente para facilitar la ejecución limpia de un solo clic
export const partidosFaseFinal = [
    // Domingo 28 de junio
    { round: "Round of 4", date: "2026-07-14", time: "14:00", team1: "France", team2: "Spain" }, // Partido 73
    { round: "Round of 4", date: "2026-07-15", time: "14:00", team1: "England", team2: "Argentina" }, // Partido 73
];

export default function AdminSeeder() {
    const [status, setStatus] = useState({ loading: false, type: '', message: '' });

    const handleSeed = async () => {
        setStatus({ loading: true, type: '', message: '' });
        try {
            await seedKnockoutMatches(partidosFaseFinal);
            setStatus({
                loading: false,
                type: 'success',
                message: '¡Partidos de la Fase Final insertados correctamente sin duplicados!'
            });
        } catch (error) {
            console.error(error);
            setStatus({
                loading: false,
                type: 'error',
                message: 'Hubo un error al insertar los partidos. Revisa la consola.'
            });
        }
    };

    return (
        <div className="w-full max-w-md mx-auto my-8 p-6 bg-gradient-to-br from-slate-900 to-slate-950 border border-purple-500/30 rounded-3xl text-center shadow-lg relative overflow-hidden">
            {/* Brillo decorativo superior */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
            
            <h3 className="text-white font-black text-lg mb-2 uppercase tracking-wide">
                Panel de Control / Mantenimiento
            </h3>
            <p className="text-slate-400 text-xs mb-6">
                Presiona el botón para inicializar las llaves de la Fase Final (Round of 32) en la base de datos de Firestore.
            </p>

            <button
                onClick={handleSeed}
                disabled={status.loading}
                className="w-full px-6 py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105 hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:hover:scale-100"
            >
                {status.loading ? 'Insertando en Firebase...' : 'Cargar Partidos Fase Final'}
            </button>

            {status.message && (
                <div className={`mt-4 p-3 rounded-xl text-xs font-bold border ${
                    status.type === 'success' 
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' 
                        : 'bg-red-950/30 border-red-500/30 text-red-400'
                }`}>
                    {status.message}
                </div>
            )}
        </div>
    );
}