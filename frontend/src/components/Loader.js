export default function Loader({ size = "md", fullScreen = false }) {
    const sizeClasses = {
        sm: "w-6 h-6 border-[2px]",
        md: "w-10 h-10 border-[3px]",
        lg: "w-16 h-16 border-[4px]"
    };

    const loaderElement = (
        <div className="flex flex-col items-center justify-center gap-4">
            {/* Square Loader matching 'Cuadralo' */}
            <div className={`
                ${sizeClasses[size] || sizeClasses.md}
                border-cuadralo-pink
                animate-[spin_1.5s_linear_infinite]
                shadow-[0_0_15px_rgba(242,19,142,0.3)]
            `} />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-cuadralo-pink animate-pulse">Cargando...</span>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-cuadralo-bgLight/80 dark:bg-cuadralo-bgDark/80 backdrop-blur-sm pb-16">
                {loaderElement}
            </div>
        );
    }

    return (
        <div className="flex justify-center p-8">
            {loaderElement}
        </div>
    );
}
