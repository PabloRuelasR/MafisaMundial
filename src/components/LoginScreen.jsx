import React, { useState } from 'react';
import { auth, googleProvider, db } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs
} from 'firebase/firestore';

// Pokemones disponibles
const POKEMONES = [
    {
        id: 25,
        nombre: 'Pikachu',
        img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
    },
    {
        id: 6,
        nombre: 'Charizard',
        img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png'
    },
    {
        id: 9,
        nombre: 'Blastoise',
        img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png'
    },
    {
        id: 59,
        nombre: 'Arcanine',
        img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/59.png'
    },
    {
        id: 94,
        nombre: 'Gengar',
        img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png'
    },
    {
        id: 150,
        nombre: 'Mewtwo',
        img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png'
    },
    {
        id: 143,
        nombre: 'Snorlax',
        img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png'
    },
    {
        id: 149,
        nombre: 'Dragonite',
        img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png'
    },
    {
        id: 448,
        nombre: 'Lucario',
        img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png'
    },
    {
        id: 493,
        nombre: 'Greninja',
        img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/493.png'
    }
];

export default function LoginScreen({ onLoginComplete }) {
    const [googleUser, setGoogleUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const [nombre, setNombre] = useState('');
    const [pokemonSeleccionado, setPokemonSeleccionado] = useState(null);

    // LOGIN GOOGLE
    const handleGoogleLogin = async () => {
        try {
            setLoading(true);

            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Verificamos si ya existe
            const userDoc = await getDoc(doc(db, 'usuarios', user.uid));

            if (userDoc.exists()) {
                onLoginComplete(userDoc.data());
                return;
            }

            setGoogleUser(user);

        } catch (error) {
            console.error(error);
            alert('Error iniciando sesión');
        } finally {
            setLoading(false);
        }
    };

    // GUARDAR PERFIL
    const handleSaveProfile = async () => {
        try {
            if (!nombre.trim()) {
                alert('Ingresa tu nombre');
                return;
            }

            if (!pokemonSeleccionado) {
                alert('Selecciona un Pokémon');
                return;
            }

            setLoading(true);

            // Validar nombre repetido
            const snapshot = await getDocs(collection(db, 'usuarios'));

            const nombresExistentes = snapshot.docs.map(doc =>
                doc.data().nombre?.toLowerCase()
            );

            if (nombresExistentes.includes(nombre.trim().toLowerCase())) {
                alert('Ese nombre ya está en uso');
                setLoading(false);
                return;
            }

            const profile = {
                uid: googleUser.uid,
                email: googleUser.email,

                nombre: nombre.trim(),

                pokemon: pokemonSeleccionado.nombre,

                img: pokemonSeleccionado.img,

                puntosTotal: 0,

                rol: 'user'
            };

            await setDoc(doc(db, 'usuarios', googleUser.uid), profile);

            onLoginComplete(profile);

        } catch (error) {
            console.error(error);
            alert('Error guardando perfil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-2xl w-full shadow-2xl text-center">

                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-6 uppercase">
                    Polla Mundialista
                </h1>

                {!googleUser ? (
                    <>
                        <p className="text-slate-400 mb-8">
                            Inicia sesión para ingresar tus pronósticos.
                        </p>

                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-bold py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <img
                                src="https://www.svgrepo.com/show/475656/google-color.svg"
                                alt="Google"
                                className="w-5 h-5"
                            />

                            {loading
                                ? 'Cargando...'
                                : 'Ingresar con Google'}
                        </button>
                    </>
                ) : (
                    <div className="animate-fade-in-down">

                        <p className="text-white font-bold mb-2">
                            ¡Hola, {googleUser.displayName}!
                        </p>

                        <p className="text-slate-400 mb-6 text-sm">
                            Completa tu perfil
                        </p>

                        {/* NOMBRE */}
                        <div className="mb-8 text-left">
                            <label className="block text-sm text-slate-300 mb-2">
                                Tu nombre
                            </label>

                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ejemplo: Juan"
                                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>

                        {/* POKEMONES */}
                        <div className="mb-8">

                            <p className="text-sm text-slate-300 mb-4">
                                Escoge tu Pokémon
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">

                                {POKEMONES.map((pokemon) => {
                                    const selected =
                                        pokemonSeleccionado?.id === pokemon.id;

                                    return (
                                        <button
                                            key={pokemon.id}
                                            onClick={() => setPokemonSeleccionado(pokemon)}
                                            className={`
                                                relative rounded-2xl border p-3 transition-all
                                                ${selected
                                                    ? 'border-yellow-400 bg-yellow-500/10 scale-105'
                                                    : 'border-slate-700 bg-slate-800 hover:border-slate-500'
                                                }
                                            `}
                                        >
                                            <img
                                                src={pokemon.img}
                                                alt={pokemon.nombre}
                                                className="w-full h-24 object-contain"
                                            />

                                            <p className="text-xs font-bold mt-2">
                                                {pokemon.nombre}
                                            </p>

                                            {selected && (
                                                <div className="absolute top-2 right-2">
                                                    ✅
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black py-3 px-4 rounded-xl hover:scale-105 transition-transform"
                        >
                            {loading
                                ? 'Guardando...'
                                : 'Entrar al torneo'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}