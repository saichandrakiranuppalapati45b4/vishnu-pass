import React, { useEffect } from 'react';

const SplashScreen = ({ onFinish }) => {
    useEffect(() => {
        // Simulate loading for 2.5 seconds
        const timer = setTimeout(() => {
            onFinish();
        }, 2500);

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div className="flex flex-col items-center justify-between min-h-screen bg-white py-12 font-sans">
            {/* Top spacer */}
            <div className="flex-1"></div>

            {/* Main Content */}
            <div className="flex flex-col items-center flex-1 w-full max-w-sm px-6">

                {/* Logo Box */}
                <div className="w-56 h-56 bg-[#f7f8f8] flex flex-col items-center justify-center p-6 mb-2 mt-8">
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2">
                        <defs>
                            <path id="chevron" d="M 50 15 L 75 28 L 65 44 L 50 35 L 35 44 L 25 28 Z" />
                        </defs>

                        {/* Orange - Top  */}
                        <use href="#chevron" fill="#F47C20" />

                        {/* Green - Bottom Right */}
                        <use href="#chevron" fill="#8DC63F" transform="rotate(120 50 50)" />

                        {/* Purple - Bottom Left */}
                        <use href="#chevron" fill="#9C2A8C" transform="rotate(240 50 50)" />
                    </svg>
                    <div className="text-center w-full mt-2">
                        <h1 className="text-3xl font-extrabold tracking-widest text-[#212121] mb-1">VISHNU</h1>
                        <p className="text-[9px] font-bold tracking-[0.2em] text-[#212121]">UNIVERSAL LEARNING</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-56 h-1 bg-gray-100 rounded-full mb-10 overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full w-1/12 bg-brand-orange rounded-full"></div>
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
