import React, { useEffect } from 'react';

const SplashScreen = ({ onFinish, branding }) => {
    const [progress, setProgress] = React.useState(0);

    useEffect(() => {
        // Increment progress from 0 to 100 over 2.5 seconds
        const step = 2500 / 100; // time per 1%
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 1;
            });
        }, step);

        const timer = setTimeout(() => {
            onFinish();
        }, 2600); // Slightly after 100% for smooth finish

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [onFinish]);

    const renderLogo = (isFilling = false) => {
        if (branding?.portalLogo) {
            return (
                <img
                    src={branding.portalLogo}
                    alt="Portal Logo"
                    className={`w-full h-full object-contain mb-2 ${!isFilling ? 'opacity-20 grayscale' : ''}`}
                />
            );
        }

        return (
            <div className={!isFilling ? 'opacity-20 grayscale' : ''}>
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2">
                    <defs>
                        <path id="chevron" d="M 50 15 L 75 28 L 65 44 L 50 35 L 35 44 L 25 28 Z" />
                    </defs>
                    <use href="#chevron" fill="#F47C20" />
                    <use href="#chevron" fill="#8DC63F" transform="rotate(120 50 50)" />
                    <use href="#chevron" fill="#9C2A8C" transform="rotate(240 50 50)" />
                </svg>
                <div className="text-center w-full mt-2">
                    <h1 className="text-3xl font-extrabold tracking-widest text-[#212121] mb-1">VISHNU</h1>
                    <p className="text-[9px] font-bold tracking-[0.2em] text-[#212121]">UNIVERSAL LEARNING</p>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center justify-between min-h-screen bg-white py-12 font-sans">
            {/* Top spacer */}
            <div className="flex-1"></div>

            {/* Main Content */}
            <div className="flex flex-col items-center flex-1 w-full max-w-sm px-6">

                {/* Logo Box with Fill Animation */}
                <div className="w-56 h-56 bg-[#f7f8f8] flex flex-col items-center justify-center p-6 mb-12 mt-8 overflow-hidden relative">
                    {/* Background "Empty" Logo */}
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                        {renderLogo(false)}
                    </div>

                    {/* Foreground "Filling" Logo */}
                    <div
                        className="absolute inset-0 flex items-center justify-center p-6 transition-all duration-100 ease-linear"
                        style={{
                            clipPath: `inset(${100 - progress}% 0 0 0)`
                        }}
                    >
                        {renderLogo(true)}
                    </div>
                </div>

                {/* Title & Subtitle */}
                <h2 className="text-4xl font-bold text-[#1f2937] mb-2 tracking-tight">
                    Vishnu <span className="text-[#f47c20]">Pass</span>
                </h2>
                <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mt-1">
                    Digital College Identity
                </p>

            </div>

            {/* Footer */}
            <div className="flex-1 flex items-end pb-8">
                <p className="text-[11px] font-medium text-gray-400">
                    Powered by <span className="text-gray-600 font-bold">Vishnu Institute</span>
                </p>
            </div>
        </div>
    );
};

export default SplashScreen;
