export function PremiumLoading() {
    return (
        <div className="fixed inset-0 z-100 bg-[#0a0a0f] flex flex-col items-center justify-center overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse-slow" />

            {/* Central Loader Container */}
            <div className="relative flex items-center justify-center">
                {/* Outer Rotating Ring */}
                <div className="w-32 h-32 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 border-b-cyan-500 animate-[spin_3s_linear_infinite]" />

                {/* Middle Counter-Rotating Ring */}
                <div className="absolute w-24 h-24 rounded-full border-4 border-transparent border-t-purple-500 border-l-blue-500 animate-[spin_2s_linear_infinite_reverse]" />

                {/* Inner Pulsing Core */}
                <div className="absolute w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-2xl">⚡</span>
                </div>

                {/* Orbiting Particle */}
                <div className="absolute w-40 h-40 animate-[spin_4s_linear_infinite]">
                    <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.8)] absolute top-0 left-1/2 -translate-x-1/2" />
                </div>
            </div>

            {/* Loading Text */}
            <div className="mt-12 text-center relative z-10">
                <h2 className="text-2xl font-bold font-display bg-linear-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                    Loading Snakk Admin...
                </h2>
                <p className="text-gray-500 text-sm mt-2 animate-bounce-subtle">
                    Preparing your dashboard
                </p>
            </div>
        </div>
    );
}
