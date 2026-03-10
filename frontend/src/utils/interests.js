import { 
    Music, Gamepad2, Plane, Coffee, Dumbbell, Film, Palette, 
    Book, Dog, Wine, Camera, Laptop, Mountain, Heart, Code, 
    Briefcase, Utensils, Zap, Bike, Tent, Trees, Mic, Tv, Smile 
} from "lucide-react";

export const INTERESTS_LIST = [
    // 🎨 Creatividad y Arte
    { id: "art", slug: "art", name: "Arte", category: "Creatividad", icon: <Palette size={16} /> },
    { id: "photo", slug: "photo", name: "Fotografía", category: "Creatividad", icon: <Camera size={16} /> },
    { id: "writing", slug: "writing", name: "Escritura", category: "Creatividad", icon: <Book size={16} /> },
    
    // 🎵 Entretenimiento
    { id: "music", slug: "music", name: "Música", category: "Entretenimiento", icon: <Music size={16} /> },
    { id: "movies", slug: "movies", name: "Cine", category: "Entretenimiento", icon: <Film size={16} /> },
    { id: "games", slug: "games", name: "Gaming", category: "Entretenimiento", icon: <Gamepad2 size={16} /> },
    { id: "podcasts", slug: "podcasts", name: "Podcasts", category: "Entretenimiento", icon: <Mic size={16} /> },
    { id: "anime", slug: "anime", name: "Anime", category: "Entretenimiento", icon: <Tv size={16} /> },

    // 💪 Salud y Deporte
    { id: "gym", slug: "gym", name: "Fitness", category: "Deportes", icon: <Dumbbell size={16} /> },
    { id: "health", slug: "health", name: "Salud", category: "Deportes", icon: <Heart size={16} /> },
    { id: "cycling", slug: "cycling", name: "Ciclismo", category: "Deportes", icon: <Bike size={16} /> },
    { id: "soccer", slug: "soccer", name: "Fútbol", category: "Deportes", icon: <Smile size={16} /> },

    // ✈️ Aventura y Viajes
    { id: "travel", slug: "travel", name: "Viajes", category: "Aventura", icon: <Plane size={16} /> },
    { id: "hiking", slug: "hiking", name: "Senderismo", category: "Aventura", icon: <Mountain size={16} /> },
    { id: "camping", slug: "camping", name: "Camping", category: "Aventura", icon: <Tent size={16} /> },
    { id: "nature", slug: "nature", name: "Naturaleza", category: "Aventura", icon: <Trees size={16} /> },

    // 🍔 Estilo de Vida
    { id: "coffee", slug: "coffee", name: "Café", category: "Estilo de Vida", icon: <Coffee size={16} /> },
    { id: "cooking", slug: "cooking", name: "Cocina", category: "Estilo de Vida", icon: <Utensils size={16} /> },
    { id: "wine", slug: "wine", name: "Vino", category: "Estilo de Vida", icon: <Wine size={16} /> },
    { id: "dogs", slug: "dogs", name: "Perros", category: "Estilo de Vida", icon: <Dog size={16} /> },

    // 💻 Profesión y Tech
    { id: "tech", slug: "tech", name: "Tecnología", category: "Profesión", icon: <Laptop size={16} /> },
    { id: "crypto", slug: "crypto", name: "Crypto", category: "Profesión", icon: <Zap size={16} /> },
    { id: "programming", slug: "programming", name: "Programación", category: "Profesión", icon: <Code size={16} /> },
    { id: "business", slug: "business", name: "Emprendimiento", category: "Profesión", icon: <Briefcase size={16} /> }
];

export const getInterestInfo = (slug) => {
    // Si viene vacío o nulo
    if (!slug) return { id: "unknown", name: "Interés", icon: <Smile size={16}/>, category: "Otros" };
    
    // Convertir de objeto a string si hace falta
    const slugStr = typeof slug === 'object' ? (slug.slug || slug.id || "") : String(slug);
    const cleanSlug = slugStr.toLowerCase().trim();
    
    // Buscar coincidencia exacta en nuestra lista estricta
    const found = INTERESTS_LIST.find((i) => i.id === cleanSlug || i.slug === cleanSlug);
    
    if (found) return found;
    
    // Si es un interés que alguien metió manualmente y no está en la lista, lo formateamos para que no rompa el diseño
    const formattedLabel = cleanSlug.replace(/-/g, ' ');
    return { 
        id: cleanSlug, 
        name: formattedLabel.charAt(0).toUpperCase() + formattedLabel.slice(1), 
        icon: <Zap size={16}/>,
        category: "Otros"
    };
};