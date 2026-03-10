export const INTERESTS_LIST = [
    { id: "music", label: "Música", icon: "🎵" },
    { id: "movies", label: "Cine", icon: "🎬" },
    { id: "sports", label: "Deportes", icon: "⚽" },
    { id: "travel", label: "Viajes", icon: "✈️" },
    { id: "gaming", label: "Gaming", icon: "🎮" },
    { id: "reading", label: "Lectura", icon: "📚" },
    { id: "photography", label: "Fotografía", icon: "📷" },
    { id: "art", label: "Arte", icon: "🎨" },
    { id: "food", label: "Cocina", icon: "🍳" },
    { id: "fitness", label: "Fitness", icon: "💪" },
    { id: "gym", label: "Gym", icon: "🏋️" },
    { id: "pets", label: "Mascotas", icon: "🐶" },
    { id: "dogs", label: "Perros", icon: "🐕" },
    { id: "tech", label: "Tecnología", icon: "💻" },
    { id: "coffee", label: "Café", icon: "☕" },
    { id: "wine", label: "Vino", icon: "🍷" },
    { id: "party", label: "Fiesta", icon: "🎉" },
    { id: "guitar", label: "Guitarra", icon: "🎸" },
    { id: "hiking", label: "Senderismo", icon: "⛰️" },
    { id: "crypto", label: "Crypto", icon: "🪙" }
];

// Esta es la función que faltaba y causaba el error
export const getInterestInfo = (slug) => {
    const found = INTERESTS_LIST.find((i) => i.id === slug);
    if (found) return found;
    
    // Si el usuario tiene un interés viejo que no está en la lista, lo formatea bonito por defecto
    const formattedLabel = slug.replace(/-/g, ' ');
    return { 
        id: slug, 
        label: formattedLabel.charAt(0).toUpperCase() + formattedLabel.slice(1), 
        icon: "✨" 
    };
};