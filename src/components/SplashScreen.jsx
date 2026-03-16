import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onFinish, branding }) => {
    const [progress, setProgress] = useState(0);
    const [typedText, setTypedText] = useState('');
    const [isStarted, setIsStarted] = useState(false);
    const fullText = "VISHNU UNIVERSAL LEARNING";

    useEffect(() => {
        // Simple fade-in and progress loader
        const duration = 1200;
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
        // Sequential Typing 
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
                setTimeout(onFinish, 1000);
            }
        }, charStep);

        return () => clearInterval(typingInterval);
    }, [isStarted, onFinish]);

    return (
        <div className="flex flex-col items-center justify-between min-h-screen bg-white py-20 font-sans overflow-hidden">
            <div className="flex-1"></div>

            <div className="flex flex-col items-center flex-1 w-full max-w-sm px-8">
                <div className="relative w-48 h-48 flex items-center justify-center mb-12">
                    {branding?.portalLogo ? (
                        <div className="relative w-32 h-32 flex items-center justify-center z-10">
                            <img 
                                src={branding.portalLogo} 
                                alt="College Logo" 
                                className={`w-full h-full object-contain transition-all duration-1000 ${progress > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                            />
                        </div>
                    ) : (
                        <div className={`w-32 h-32 rounded-full bg-gray-50 flex items-center justify-center transition-all duration-1000 ${progress > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                            <div className="w-12 h-12 border-2 border-[#f47c20]/20 border-t-[#f47c20] rounded-full animate-spin"></div>
                        </div>
                    )}
                    
                    {/* Ring Loader */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                        <circle
                            cx="50%"
                            cy="50%"
                            r="38%"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="transparent"
                            className="text-gray-100"
                        />
                        <circle
                            cx="50%"
                            cy="50%"
                            r="38%"
                            stroke="#f47c20"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            fill="transparent"
                            strokeDasharray="239"
                            strokeDashoffset={239 - (239 * progress) / 100}
                            className="transition-all duration-300 shadow-[0_0_10px_rgba(244,124,32,0.2)]"
                        />
                    </svg>
                </div>

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
