import React, { useState } from 'react';
import { auth, googleProvider, db } from '../services/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginScreen({ onLoginComplete }) {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // LOGIN GOOGLE
    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setErrorMsg(''); // Limpiar errores previos

            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Verificamos si el usuario ya existe en la base de datos
            const userDoc = await getDoc(doc(db, 'usuarios', user.uid));

            if (userDoc.exists()) {
                // Si existe, le permitimos el ingreso normal
                onLoginComplete(userDoc.data());
            } else {
                // Si NO existe, lo deslogueamos de Firebase y le mostramos el mensaje
                await signOut(auth);
                setErrorMsg('El torneo ya inició. Las inscripciones se encuentran cerradas.');
            }

        } catch (error) {
            console.error(error);
            setErrorMsg('Ocurrió un error al intentar iniciar sesión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-md w-full shadow-2xl text-center">

                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-6 uppercase">
                    Polla Mundialista
                </h1>

                <p className="text-slate-400 mb-8">
                    Inicia sesión para ingresar tus pronósticos.
                </p>

                {/* MENSAJE DE ERROR */}
                {errorMsg && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm font-bold animate-fade-in-down">
                        ⚠️ {errorMsg}
                    </div>
                )}

                {/* BOTÓN ÚNICO DE GOOGLE */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-bold py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                        className="w-5 h-5"
                    />

                    {loading ? 'Validando...' : 'Ingresar con Google'}
                </button>

            </div>
        </div>
    );
}