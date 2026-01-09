import { 
    Dumbbell, Trophy, Bike, Waves, Activity, 
    Palette, PenTool, Camera, Music, Scissors, 
    Cpu, Gamepad2, Code, Bitcoin, Rocket, 
    Plane, Utensils, Coffee, Wine, Flower2, 
    PartyPopper, Globe, MessageCircle, Clapperboard, 
    Mountain, Tent, Sun, PawPrint, Leaf
} from "lucide-react";

// Mapeo de Iconos por Nombre (Exacto como está en la DB del Backend)
const ICON_MAP = {
    // Deportes
    "Fútbol": Trophy, "Gym": Dumbbell, "Baloncesto": Activity, 
    "Tenis": Activity, "Natación": Waves, "Ciclismo": Bike, 
    "Yoga": Flower2, "Running": Activity, "Crossfit": Dumbbell,

    // Creatividad
    "Arte": Palette, "Diseño": PenTool, "Fotografía": Camera, 
    "Escritura": PenTool, "Música": Music, "Baile": Music, 
    "Moda": Scissors, "Maquillaje": Palette, "Arquitectura": PenTool,

    // Tecnología
    "Programación": Code, "Gaming": Gamepad2, "IA": Cpu, 
    "Cripto": Bitcoin, "Startups": Rocket, "Diseño Web": Code, 
    "Robótica": Cpu, "Gadgets": Cpu,

    // Estilo de Vida
    "Viajes": Plane, "Cocina": Utensils, "Café": Coffee, 
    "Vino": Wine, "Jardinería": Leaf, "Minimalismo": Leaf, 
    "Tatuajes": PenTool, "Astrología": Sun,

    // Social
    "Fiesta": PartyPopper, "Voluntariado": Globe, "Política": MessageCircle, 
    "Debate": MessageCircle, "Idiomas": Globe, "Juegos de Mesa": Gamepad2, 
    "Cine": Clapperboard, "Series": Clapperboard,

    // Naturaleza
    "Senderismo": Mountain, "Camping": Tent, "Playa": Sun, 
    "Animales": PawPrint, "Ecología": Leaf, "Surf": Waves, "Pesca": Waves
};

/**
 * Obtiene el icono y etiqueta para un interés.
 * Acepta el objeto completo de la base de datos o un string.
 */
export const getInterestInfo = (interest) => {
    // Si viene del backend como objeto, usamos interest.name
    // Si viene como string (legacy), usamos el string directo
    const name = typeof interest === 'object' ? interest.name : interest;
    
    // Icono por defecto si no encuentra match
    const Icon = ICON_MAP[name] || Activity; 

    return { label: name, Icon };
};