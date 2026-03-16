import React, { useEffect } from 'react';
import AnimatedLogo from './AnimatedLogo';

const SplashScreen = ({ onFinish, branding }) => {
    const [progress, setProgress] = React.useState(0);
    const hasCustomLogo = Boolean(branding?.portalLogo);

    useEffect(() => {
        // Increment progress from 0 to 100 over 2.5 seconds (mainly for custom logos now)
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

    return (
        <div className="flex flex-col items-center justify-between min-h-screen bg-white py-12 font-sans">
            {/* Top spacer */}
            <div className="flex-1"></div>

            {/* Main Content */}
            <div className="flex flex-col items-center flex-1 w-full max-w-sm px-6">

                {/* Logo Box with Animation */}
                <div className="w-64 h-64 bg-[#f7f8f8] flex flex-col items-center justify-center p-6 mb-12 mt-8 overflow-hidden relative">
                    {hasCustomLogo ? (
                        <>
                            {/* Background "Empty" Logo */}
                            <div className="absolute inset-0 flex items-center justify-center p-6">
                                <img
                                    src={branding.portalLogo}
                                    alt="Portal Logo"
                                    className="w-full h-full object-contain mb-2 opacity-20 grayscale"
                                />
                            </div>

                            {/* Foreground "Filling" Logo */}
                            <div
                                className="absolute inset-0 flex items-center justify-center p-6 transition-all duration-100 ease-linear"
                                style={{
                                    clipPath: `inset(${100 - progress}% 0 0 0)`
                                }}
                            >
                                <img
                                    src={branding.portalLogo}
                                    alt="Portal Logo"
                                    className="w-full h-full object-contain mb-2"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                            <AnimatedLogo />
                        </div>
                    )}
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
