// resources/js/Utils/traductor.js

const traducciones = {
    "Mexico": "México", "South Africa": "Sudáfrica", "South Korea": "Corea del Sur",
    "Czech Republic": "República Checa", "Canada": "Canadá", "Bosnia & Herzegovina": "Bosnia y Herzegovina",
    "Qatar": "Catar", "Switzerland": "Suiza", "Brazil": "Brasil", "Morocco": "Marruecos",
    "Haiti": "Haití", "Scotland": "Escocia", "USA": "EE. UU.", "Paraguay": "Paraguay",
    "Australia": "Australia", "Turkey": "Turquía", "Germany": "Alemania", "Curaçao": "Curazao",
    "Ivory Coast": "Costa de Marfil", "Ecuador": "Ecuador", "Netherlands": "Países Bajos",
    "Japan": "Japón", "Sweden": "Suecia", "Tunisia": "Túnez", "Belgium": "Bélgica",
    "Egypt": "Egipto", "Iran": "Irán", "New Zealand": "Nueva Zelanda", "Spain": "España",
    "Cape Verde": "Cabo Verde", "Saudi Arabia": "Arabia Saudita", "Uruguay": "Uruguay",
    "France": "Francia", "Senegal": "Senegal", "Iraq": "Irak", "Norway": "Noruega",
    "Argentina": "Argentina", "Algeria": "Argelia", "Austria": "Austria", "Jordan": "Jordania",
    "Portugal": "Portugal", "DR Congo": "R. D. del Congo", "Uzbekistan": "Uzbekistán",
    "Colombia": "Colombia", "England": "Inglaterra", "Croatia": "Croacia", "Ghana": "Ghana", "Panama": "Panamá"
};

// Normalizamos las llaves a minúsculas para prevenir errores por diferencias de caja (ej: "mexico" o "MEXICO")
const diccionarioNormalizado = Object.keys(traducciones).reduce((acc, key) => {
    acc[key.toLowerCase().trim()] = traducciones[key];
    return acc;
}, {});

/**
 * Traduce el nombre de un país al español utilizando el diccionario estático.
 * If el país no se encuentra en el mapa, retorna el string original.
 * * @param {string} pais - Nombre del país en inglés u original.
 * @returns {string} Nombre del país traducido o el original si no existe.
 */
export function traducirPais(pais) {
    if (!pais) return "";
    
    const paisLimpio = pais.toString().toLowerCase().trim();
    return diccionarioNormalizado[paisLimpio] || pais;
}