import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-pulse-slow delay-700" />

            <div className="glass-card p-12 rounded-3xl text-center max-w-lg w-full mx-4 border border-white/10 shadow-2xl relative z-10 backdrop-blur-xl animate-scale-in">
                <div className="relative mb-8">
                    <h1 className="text-[150px] font-black font-display leading-none bg-linear-to-b from-white/20 to-transparent bg-clip-text text-transparent select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl animate-bounce-subtle">🤔</span>
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-4 font-display">Page Not Found</h2>
                <p className="text-gray-400 mb-8 text-lg">
                    Oops! It looks like this plate is empty. The page you&apos;re looking for might have been moved or eaten.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-1 active:scale-95 group"
                >
                    <span className="group-hover:animate-bounce-subtle mr-2">🏠</span>
                    Return Home
                </Link>
            </div>
        </div>
    );
}
