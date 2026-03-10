import React, { useState, useEffect } from 'react';
import { ChevronLeft, Shield, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const QrScreen = ({ studentData, onBack }) => {
    const [qrToken, setQrToken] = useState(crypto.randomUUID());
    const [seconds, setSeconds] = useState(30);

    // QR Code timer and rotation
    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds(prev => {
                if (prev <= 1) {
                    setQrToken(crypto.randomUUID());
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const initials = studentData?.full_name
        ? studentData.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'ST';

    return (
        <div className="flex-1 flex flex-col bg-[#111111] overflow-hidden relative font-sans min-h-screen">
            {/* Header */}
            <header className="px-6 py-10 flex justify-between items-center relative z-20">
                <button
                    onClick={onBack}
                    className="w-12 h-12 rounded-full bg-[#332a22]/80 backdrop-blur-xl flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="px-8 py-3 rounded-full bg-[#f47c20]/20 border border-[#f47c20]/30 backdrop-blur-xl text-[#f47c20] font-black text-[12px] tracking-[0.2em] uppercase shadow-lg">
                    Digital Pass
                </div>
                <div className="w-12 h-12 relative">
                    <div className="w-12 h-12 rounded-full bg-[#332a22]/80 flex items-center justify-center border border-white/5 overflow-hidden shadow-sm">
                        {studentData?.photo_url ? (
                            <img src={studentData.photo_url} alt="Student" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-white font-bold text-sm">{initials}</div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-30 pb-20">

                {/* ID Card Wrapper */}
                <div className="w-full bg-[#1e1a17]/95 rounded-[40px] p-8 shadow-2xl border border-white/5 relative overflow-hidden backdrop-blur-2xl">

                    {/* Top Accent */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#f47c20] to-[#e06b12]" />

                    <div className="text-center mb-8 mt-2">
                        <h2 className="text-2xl font-black text-white tracking-tight leading-tight">{studentData?.full_name || 'Vishnu Student'}</h2>
                        <p className="text-sm font-bold text-[#f47c20] tracking-widest mt-1 uppercase">{studentData?.student_id || 'ID Pending'}</p>
                    </div>

                    {/* QR Code container */}
                    <div className="w-full max-w-[260px] mx-auto aspect-square bg-white rounded-[40px] flex items-center justify-center p-6 mb-8 relative border-4 border-[#332a22] shadow-[0_0_40px_rgba(244,124,32,0.1)]">
                        {/* Brackets */}
                        <div className="absolute top-[-4px] left-[-4px] w-8 h-8 border-t-4 border-l-4 border-[#f47c20] rounded-tl-[40px]" />
                        <div className="absolute top-[-4px] right-[-4px] w-8 h-8 border-t-4 border-r-4 border-[#f47c20] rounded-tr-[40px]" />
                        <div className="absolute bottom-[-4px] left-[-4px] w-8 h-8 border-b-4 border-l-4 border-[#f47c20] rounded-bl-[40px]" />
                        <div className="absolute bottom-[-4px] right-[-4px] w-8 h-8 border-b-4 border-r-4 border-[#f47c20] rounded-br-[40px]" />

                        <div className="w-full h-full bg-white flex items-center justify-center">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://vishnupass.com/verify/${studentData?.student_id}_${qrToken}`}
                                alt="Student Digital Pass QR"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    {/* Meta Data */}
                    <div className="flex justify-between items-center bg-[#332a22]/50 p-4 rounded-3xl border border-white/5 mb-6">
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Department</p>
                            <p className="text-xs font-black text-white uppercase">{studentData?.departments?.name || 'Loading...'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Valid Today</p>
                            <p className="text-xs font-black text-emerald-400">{format(new Date(), 'MMM dd, yyyy')}</p>
                        </div>
                    </div>

                    {/* Refresh Timer */}
                    <div className="flex items-center justify-between text-white/60 text-[11px] font-bold px-2">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-500" />
                            <span>Secure Dynamic Token</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <RefreshCw className={`w-3.5 h-3.5 ${seconds < 5 ? 'text-rose-500 animate-spin' : 'text-[#f47c20]'}`} />
                            <span className={seconds < 5 ? 'text-rose-500' : 'text-[#f47c20]'}>00:{seconds.toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Optional simulated bottom navigation for visual balance */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />

            <style dangerouslySetInnerHTML={{
                __html: `
                .font-sans {
                    font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
                }
            ` }} />
        </div>
    );
};

export default QrScreen;
