const API_URL = "http://localhost:8000/api";

// Función interna para manejar todas las peticiones igual
const request = async (endpoint, method, body = null) => {
    const token = localStorage.getItem("token");
    
    const headers = {
        "Content-Type": "application/json",
    };

    // ¡AQUÍ ESTÁ LA MAGIA! Si hay token, lo pegamos siempre.
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        console.log(`📡 ${method} ${endpoint}`);
        const response = await fetch(`${API_URL}${endpoint}`, config);

        // Si el token venció (401), cerramos sesión automáticamente para evitar bugs
        if (response.status === 401) {
            console.warn("Sesión expirada o inválida");
            // Opcional: localStorage.clear(); window.location.href = '/login';
            // Por ahora solo lanzamos el error para que lo veas en consola
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Error en la petición");
        }

        return result;
    } catch (error) {
        console.error("❌ Error API:", error);
        throw error;
    }
};

export const api = {
  get: (endpoint) => request(endpoint, "GET"),
  post: (endpoint, body) => request(endpoint, "POST", body),
  put: (endpoint, body) => request(endpoint, "PUT", body),
  delete: (endpoint) => request(endpoint, "DELETE"),
};