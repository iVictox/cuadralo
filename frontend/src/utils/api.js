const API_URL = "http://localhost:8000/api"; // <--- ¿Dice 8000?

export const api = {
  post: async (endpoint, data) => {
    try {
      // Imprimir en consola para depurar
      console.log(`📡 Enviando datos a: ${API_URL}${endpoint}`, data);

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error en la petición");
      }

      return result;
    } catch (error) {
      console.error("❌ Error de conexión:", error);
      throw error;
    }
  },
  
  get: async (endpoint) => {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}${endpoint}`, { headers });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result;
  }
};