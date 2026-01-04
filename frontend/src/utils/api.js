const API_URL = "http://localhost:8000/api";

// Función interna para manejar peticiones estándar (JSON)
const request = async (endpoint, method, body = null) => {
    const token = localStorage.getItem("token");
    
    const headers = {
        "Content-Type": "application/json",
    };

    // Inyectar Token si existe
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

        // Manejo de sesión expirada
        if (response.status === 401) {
            console.warn("Sesión expirada o inválida");
            // Opcional: localStorage.clear(); window.location.href = '/login';
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
  // Métodos estándar
  get: (endpoint) => request(endpoint, "GET"),
  post: (endpoint, body) => request(endpoint, "POST", body),
  put: (endpoint, body) => request(endpoint, "PUT", body),
  delete: (endpoint) => request(endpoint, "DELETE"),

  // MÉTODO ESPECIAL PARA SUBIR ARCHIVOS (Multipart)
  upload: async (file) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", file); // "image" debe coincidir con c.FormFile("image") en Go

    const headers = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    // NOTA: NO poner Content-Type: multipart/form-data manualmente,
    // fetch lo hace automáticamente con el boundary correcto.

    try {
        console.log(`📡 UPLOAD ${file.name}`);
        const response = await fetch(`${API_URL}/upload`, {
            method: "POST",
            headers: headers, 
            body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Error subiendo archivo");
        }

        return result.url; // Devuelve la URL pública del archivo
    } catch (error) {
        console.error("❌ Error Upload:", error);
        throw error;
    }
  }
};