

interface LoadingOverlayProps {
    message?: string;
    fullScreen?: boolean;
}

export function LoadingOverlay({ message = "Chargement des données...", fullScreen = false }: LoadingOverlayProps) {
    const containerClasses = fullScreen
        ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
        : "w-full h-full min-h-[400px] flex flex-col items-center justify-center rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20";

    return (
        <div className={containerClasses}>
            <div className="relative flex items-center justify-center">
                {/* Outer glowing ring */}
                <div className="absolute w-24 h-24 border-4 border-[#0d3d3d]/20 rounded-full animate-ping opacity-75"></div>
                {/* Inner spinning gradient ring */}
                <div className="w-16 h-16 border-4 border-transparent border-t-[#0d3d3d] border-r-[#c4a35a] rounded-full animate-spin"></div>
                {/* Center element */}
                <div className="absolute w-10 h-10 bg-gradient-to-br from-[#0d3d3d] to-[#1a7a7a] rounded-full animate-pulse shadow-lg shadow-[#0d3d3d]/30"></div>
            </div>
            <p className="mt-6 text-[#0d3d3d] font-medium tracking-wide animate-pulse">
                {message}
            </p>
        </div>
    );
}
