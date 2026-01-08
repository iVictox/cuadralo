const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.235:8000/api";

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
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: getHeaders(),
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
            "Authorization": `Bearer ${token}` // No enviamos Content-Type, fetch lo pone automático para FormData
        },
        body: formData
    });

    if (!res.ok) throw new Error("Error subiendo imagen");
    const data = await res.json();
    return data.url;
  }
};