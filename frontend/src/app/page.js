import CardStack from "@/components/CardStack";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-cuadralo-dark overflow-hidden">
      {/* Header / Barra Superior */}
      <header className="w-full flex justify-between items-center p-4 max-w-md mx-auto">
        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border-2 border-white">
             {/* Aquí iría la foto del usuario logueado */}
             <div className="w-full h-full bg-cuadralo-purple"></div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple">
          cuadralo
        </h1>
        
        <button className="p-2 bg-gray-800 rounded-full text-gray-300 hover:text-white hover:bg-gray-700">
          ⚙️
        </button>
      </header>

      {/* Área de Swipes */}
      <section className="flex-1 w-full max-w-md mx-auto relative">
        <CardStack />
      </section>
      
    </main>
  );
}