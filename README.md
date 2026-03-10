# Cuadralo 💘

**Cuadralo** es una aplicación moderna y completa de citas y red social. Diseñada para conectar personas a través de un sistema de "matches" interactivo, la plataforma va un paso más allá integrando funciones sociales completas como un feed de publicaciones, historias y chat en tiempo real. 

---

## 🚀 Características Principales

### 💖 Sistema de Citas (Dating)
* **Card Stack (Swipe):** Interfaz fluida para explorar perfiles, dar "Me gusta" o descartar.
* **Sistema de Matches:** Notificaciones y habilitación de chat automático cuando hay un interés mutuo.
* **Filtros Avanzados:** Búsqueda personalizada de perfiles basada en intereses y preferencias.

### 📱 Red Social Integrada
* **Feed Social:** Publicación de fotos, estados y actualizaciones.
* **Historias (Stories):** Comparte momentos efímeros con tus matches y seguidores.
* **Comentarios y Likes:** Interacción completa en el feed de publicaciones.

### 💬 Comunicación en Tiempo Real
* **Chat en Vivo:** Mensajería instantánea potenciada por WebSockets.
* **Videollamadas:** Función de llamadas en video integradas para conectar cara a cara.
* **Notificaciones Push:** Alertas en tiempo real sobre nuevos matches, mensajes y actividad social.

### 💎 Monetización y Premium
* **Suscripciones Prime/Premium:** Funciones exclusivas para usuarios de pago.
* **Boosts:** Opción para destacar el perfil temporalmente y conseguir más visibilidad.
* **Tienda Integrada:** Sistema de pagos para adquirir mejoras y características adicionales.

---

## 🛠️ Tecnologías Utilizadas

El proyecto está dividido en una arquitectura Cliente-Servidor.

### Frontend (`/frontend`)
* **Framework:** [Next.js](https://nextjs.org/) (React)
* **Estilos:** Tailwind CSS
* **Gestión de Estado:** React Context API
* **Real-time:** WebSockets Client

### Backend (`/backend`)
* **Lenguaje:** [Go (Golang)](https://go.dev/)
* **Framework Web:** [Gin Gonic](https://gin-gonic.com/)
* **Base de Datos:** GORM (Compatible con PostgreSQL, MySQL, etc.)
* **Comunicación Real-time:** WebSockets (`gorilla/websocket`)
* **Autenticación:** JWT (JSON Web Tokens)

---

## 📦 Dependencias y Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener instaladas las siguientes herramientas en tu sistema:

1. **[Node.js](https://nodejs.org/)** (v18 o superior): Necesario para ejecutar el frontend y gestionar paquetes con `npm`.
2. **[Go](https://go.dev/dl/)** (v1.20 o superior): Necesario para compilar y ejecutar el backend.
3. **Base de Datos:** Un motor de base de datos compatible con GORM (PostgreSQL, MySQL o SQLite) instalado y en ejecución.
4. **Git:** Para clonar el repositorio.

---

## ⚙️ Instalación paso a paso

### 1. Clonar el repositorio
```bash
git clone [https://github.com/tu-usuario/cuadralo.git](https://github.com/tu-usuario/cuadralo.git)
cd cuadralo
```

### 2. Configurar el Backend (Servidor Go)
Abre una terminal en la carpeta del backend y descarga las dependencias:
```bash
cd backend
go mod tidy
```

Crea un archivo llamado `.env` en la raíz de la carpeta `backend/` y configura tus variables de conexión:
```env
DB_DSN="usuario:contraseña@tcp(127.0.0.1:3306)/cuadralo?charset=utf8mb4&parseTime=True&loc=Local"
JWT_SECRET="tu_clave_secreta_super_segura"
PORT=8080
```

### 3. Configurar el Frontend (Next.js)
Abre una **nueva pestaña** en tu terminal, dirígete a la carpeta del frontend e instala los paquetes:
```bash
cd frontend
npm install
```

Crea un archivo `.env.local` en la carpeta `frontend/` y define la URL de tu API para que pueda comunicarse con el servidor:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

---

## 🚀 Cómo ejecutar la aplicación

### Opción A: Ejecución mediante Terminal (Recomendado)
1. **Levantar el Backend:**
   ```bash
   cd backend
   go run main.go
   ```
2. **Levantar el Frontend** (en una terminal separada):
   ```bash
   cd frontend
   npm run dev
   ```

### Opción B: Ejecución Rápida (Solo para Windows)
1. Dirígete a la carpeta `backend/` y haz doble clic en el archivo `start.bat`.
2. Dirígete a la carpeta `frontend/` y haz doble clic en el archivo `start.bat`.

La aplicación web estará disponible en tu navegador en **[http://localhost:3000](http://localhost:3000)** y el servidor API estará escuchando en el puerto `8080`.

---

## 📂 Estructura del Proyecto

```text
cuadralo/
├── backend/                # API RESTful en Go y servidor WebSocket
│   ├── controllers/        # Lógica de las rutas (Auth, Chat, Social, etc.)
│   ├── database/           # Configuración de conexión a la BD
│   ├── middleware/         # Middlewares de seguridad (Auth JWT)
│   ├── models/             # Esquemas de GORM (Usuario, Match, Posts)
│   ├── routes/             # Definición de endpoints de la API
│   ├── websockets/         # Manejo de chat y salas en tiempo real
│   ├── main.go             # Punto de entrada del servidor
│   └── start.bat           # Script de inicio rápido
│
└── frontend/               # Aplicación web interactiva en Next.js
    ├── src/app/            # App Router (Páginas: Login, Register, Feed, etc.)
    ├── src/components/     # Componentes UI (Modales, Navbar, Cards)
    ├── src/context/        # Manejo de estado global (Sockets, Toasts)
    ├── src/utils/          # Llamadas a la API y funciones auxiliares
    └── start.bat           # Script de inicio rápido
```

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas para seguir mejorando Cuadralo!

1. Haz un *Fork* del proyecto.
2. Crea una nueva rama para tu funcionalidad (`git checkout -b feature/NuevaCaracteristica`).
3. Realiza tus cambios y haz *commit* (`git commit -m 'Añadir nueva característica'`).
4. Sube los cambios a la rama (`git push origin feature/NuevaCaracteristica`).
5. Abre un *Pull Request*.

---

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).
