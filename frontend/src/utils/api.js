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
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
        }
        throw new Error("Sesión expirada o inválida");
    }

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        // ✅ AHORA ARROJAMOS EL OBJETO COMPLETO PARA PODER LEER "needs_prime"
        throw errorData; 
    }

    return res.json();
};

export const api = {
  get: async (endpoint) => {
    const separator = endpoint.includes('?') ? '&' : '?';
    const noCacheUrl = `${API_URL}${endpoint}${separator}_t=${Date.now()}`;

    const res = await fetch(noCacheUrl, {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
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