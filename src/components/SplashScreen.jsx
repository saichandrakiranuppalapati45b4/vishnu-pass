import React, { useEffect, useState } from 'react';
import AnimatedLogo from './AnimatedLogo';

const SplashScreen = ({ onFinish, branding }) => {
    const [progress, setProgress] = useState(0);
    const [typedText, setTypedText] = useState('');
    const [isStarted, setIsStarted] = useState(false);
    const fullText = "VISHNU UNIVERSAL LEARNING";
    const hasCustomLogo = Boolean(branding?.portalLogo);

    useEffect(() => {
        // Simple progress loader - 1.5 seconds
        const duration = 1500;
        const step = 10;
        const increment = 100 / (duration / step);
        
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsStarted(true);
                    return 100;
                }
                return prev + increment;
            });
        }, step);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Sequential Typing starts after logo animation completes
        if (!isStarted) return;

        const typingDuration = 1500;
        const charStep = typingDuration / fullText.length;
        let charIndex = 0;
        
        const typingInterval = setInterval(() => {
            if (charIndex <= fullText.length) {
                setTypedText(fullText.substring(0, charIndex));
                charIndex++;
            } else {
                clearInterval(typingInterval);
                setTimeout(onFinish, 1200);
            }
        }, charStep);

        return () => clearInterval(typingInterval);
    }, [isStarted, onFinish]);

    return (
        <div className="flex flex-col items-center justify-between min-h-screen bg-white py-20 font-sans overflow-hidden">
            <div className="flex-1"></div>

            <div className="flex flex-col items-center flex-1 w-full max-w-sm px-8">
                {/* Logo Area */}
                <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                    {hasCustomLogo ? (
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            {/* Background "Empty" Logo */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <img
                                    src={branding.portalLogo}
                                    alt="Portal Logo"
                                    className="w-full h-full object-contain opacity-10 grayscale blur-[1px]"
                                />
                            </div>

                            {/* Foreground "Filling" Logo */}
                            <div
                                className="absolute inset-0 flex items-center justify-center transition-all duration-100 ease-linear"
                                style={{
                                    clipPath: `inset(${100 - progress}% 0 0 0)`
                                }}
                            >
                                <img
                                    src={branding.portalLogo}
                                    alt="Portal Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* Ring Loader Outline */}
                            <svg className="absolute inset-x-[-20%] inset-y-[-20%] w-[140%] h-[140%] -rotate-90 pointer-events-none opacity-20">
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="35%"
                                    stroke="currentColor"
                                    strokeWidth="1"
                                    fill="transparent"
                                    className="text-gray-200"
                                />
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="35%"
                                    stroke="#f47c20"
                                    strokeWidth="2"
                                    fill="transparent"
                                    strokeDasharray="220"
                                    strokeDashoffset={220 - (220 * progress) / 100}
                                    className="transition-all duration-300"
                                />
                            </svg>
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <AnimatedLogo />
                        </div>
                    )}
                </div>

                {/* Text Content */}
                <div className="text-center w-full h-24 flex flex-col items-center justify-start overflow-hidden">
                    <h1 className={`text-4xl font-black tracking-[0.4em] text-[#1e293b] mb-4 transition-all duration-1000 ${isStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        VISHNU
                    </h1>
                    <div className="h-10 flex items-center justify-center px-4">
                        <p className={`text-[12px] font-bold tracking-[0.5em] text-[#64748b] leading-none ${typedText.length > 0 ? 'border-r-2 border-[#f47c20] pr-2' : ''} whitespace-nowrap animate-cursor text-center`}>
                            {typedText}
                        </p>
                    </div>
                </div>

                <div className={`transition-all duration-1000 flex flex-col items-center mt-12 ${isStarted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <h2 className="text-4xl font-black text-[#1f2937] mb-2 tracking-tighter">
                        Vishnu <span className="text-[#f47c20]">Pass</span>
                    </h2>
                    <div className="flex items-center gap-4 w-full">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-gray-200"></div>
                        <span className="text-[10px] font-bold tracking-[0.6em] text-gray-400 uppercase whitespace-nowrap">
                            Digital Key
                        </span>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-gray-200"></div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex-1 flex items-end pb-12">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#f47c20]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-300 tracking-[0.3em] uppercase">
                        Sri Vishnu Educational Society
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes cursor-blink {
                    0%, 100% { border-color: transparent; }
                    50% { border-color: #f47c20; }
                }
                .animate-cursor {
                    animation: cursor-blink 0.6s step-end infinite;
                }
            `}</style>
        </div>
    );
};

export default SplashScreen;
