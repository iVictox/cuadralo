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

export const getInterestInfo = (slug) => {
    // 🛡️ ESCUDO: Si no hay slug, devolvemos algo por defecto
    if (!slug) return { id: "unknown", label: "Interés", icon: "✨" };
    
    // 🛡️ ESCUDO: Si por error pasamos un objeto entero, extraemos el slug
    const slugStr = typeof slug === 'object' ? (slug.slug || slug.id || "") : String(slug);
    
    const found = INTERESTS_LIST.find((i) => i.id === slugStr);
    if (found) return found;
    
    // Formateo por defecto si el interés viene de BD pero no está en la lista de arriba
    const formattedLabel = slugStr.replace(/-/g, ' ');
    return { 
        id: slugStr, 
        label: formattedLabel.charAt(0).toUpperCase() + formattedLabel.slice(1), 
        icon: "✨" 
    };
};