const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// Función genérica para manejar respuestas y errores 401
const handleResponse = async (res) => {
    if (res.status === 401) {
        // --- SEGURIDAD: Si el token es inválido o el usuario fue borrado ---
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Evitar bucles de redirección si ya estamos en login
        if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
        }
        throw new Error("Sesión expirada o inválida");
    }

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error en la petición");
    }

    return res.json();
};

export const api = {
  get: async (endpoint) => {
    // ✅ MAGIA ANTICACHÉ: Añadimos un timestamp único a cada GET para que Next.js y el navegador
    // se vean obligados a descargar la información fresca del servidor.
    const separator = endpoint.includes('?') ? '&' : '?';
    const noCacheUrl = `${API_URL}${endpoint}${separator}_t=${Date.now()}`;

    const res = await fetch(noCacheUrl, {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store", // Instrucción estricta para Next.js
    });
    return handleResponse(res);
  },

  post: async (endpoint, body) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  put: async (endpoint, body) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  delete: async (endpoint) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  upload: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}` 
        },
        body: formData
    });

    if (!res.ok) throw new Error("Error subiendo imagen");
    const data = await res.json();
    return data.url;
  }
};