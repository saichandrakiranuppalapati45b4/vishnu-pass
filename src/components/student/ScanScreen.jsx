import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { ChevronLeft, Zap, Loader2, X, Shield, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import VerificationResult from './VerificationResult';
import { format } from 'date-fns';

const ScanScreen = ({ studentData, onBack }) => {
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const [errorMessage, setErrorMessage] = useState(null);
    const [scanData, setScanData] = useState(null);
    const [torchOn, setTorchOn] = useState(false);

    const handleScan = async (result) => {
        if (!result || status !== 'idle') return;

        const rawValue = typeof result === 'string' ? result : result?.[0]?.rawValue;
        if (!rawValue) return;

        setStatus('processing');
        setErrorMessage(null);

        try {
            // 1. Parse Scan Value (Expected: GATE_uuid_token)
            let gateId = null;
            if (rawValue.startsWith('GATE_')) {
                const parts = rawValue.split('_');
                gateId = parts[1];
            } else {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (uuidRegex.test(rawValue)) {
                    gateId = rawValue;
                }
            }

            if (!gateId) {
                throw new Error("Invalid Gate QR code.");
            }

            // 2. Fetch Gate Name
            const { data: gate, error: gateError } = await supabase
                .from('guard_gates')
                .select('name')
                .eq('id', gateId)
                .single();

            if (gateError || !gate) {
                throw new Error("Gate not recognized.");
            }

            // 3. Record Movement Log
            const { error: logError } = await supabase.from('movement_logs').insert([{
                user_name: studentData?.full_name,
                student_id: studentData?.student_id,
                access_point_id: gateId,
                movement_type: 'AUTHORIZED',
                status: 'Success'
            }]);

            if (logError) throw logError;

            // 4. Set Success Data
            setScanData({
                gateName: gate.name,
                verifiedAt: format(new Date(), 'hh:mm a')
            });
            setStatus('success');

        } catch (err) {
            console.error('Scan error:', err);
            setErrorMessage(err.message || 'Verification failed.');
            setStatus('error');
        }
    };

    const resetScanner = () => {
        setStatus('idle');
        setErrorMessage(null);
        setScanData(null);
    };

    if (status === 'success' && scanData) {
        return (
            <VerificationResult
                studentData={studentData}
                gateName={scanData.gateName}
                verifiedAt={scanData.verifiedAt}
                onNextScan={resetScanner}
            />
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-black overflow-hidden relative font-sans min-h-screen">
            {/* Camera Background Layer */}
            <div className="absolute inset-0 z-0 h-full w-full">
                <Scanner
                    onResult={handleScan}
                    onError={(error) => setErrorMessage(error?.message)}
                    constraints={{
                        aspectRatio: 1,
                        facingMode: "environment",
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                        frameRate: { ideal: 30 }
                    }}
                    components={{ audio: false, torch: torchOn }}
                    styles={{
                        container: { width: '100%', height: '100%', background: 'black' },
                        video: { objectFit: 'cover', width: '100%', height: '100%' }
                    }}
                />
                {/* Visual Scrim Overlay - provides contrast for white UI text */}
                <div className="absolute inset-0 bg-[#1e1a17]/30 z-10" />
            </div>

            {/* UI Overlays Layer */}
            <div className="relative z-20 flex flex-col flex-1 h-full">
                {/* Header */}
                <header className="px-6 py-10 flex justify-between items-center relative z-20">
                    <button
                        onClick={onBack}
                        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white active:scale-90 transition-transform"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 text-white font-black text-[10px] tracking-[0.2em] uppercase">
                        Open Scanner
                    </div>
                    <button
                        onClick={() => setTorchOn(!torchOn)}
                        className={`w-12 h-12 rounded-full border backdrop-blur-xl flex items-center justify-center transition-all ${torchOn
                            ? 'bg-[#f47c20] border-[#f47c20] text-white shadow-lg shadow-[#f47c20]/40'
                            : 'bg-white/10 border-white/10 text-white'
                            }`}
                    >
                        <Zap className={`w-5 h-5 ${torchOn ? 'fill-white' : ''}`} />
                    </button>
                </header>

                {/* Instruction - High Visibility Overlay */}
                <div className="px-8 mt-2 mb-4 relative z-20 text-center">
                    <div className="inline-block px-8 py-5 rounded-[32px] bg-black/40 backdrop-blur-2xl border border-white/10 shadow-3xl">
                        <p className="text-white/90 text-[13px] font-bold tracking-tight">
                            Position the Gate's QR code within the frame
                        </p>
                    </div>
                </div>

                {/* Scanner Frame - Centered Focus Area */}
                <div className="flex-1 flex items-center justify-center px-10 relative z-30 mb-32">
                    <div className="w-full max-w-[280px] aspect-square relative">
                        {/* Brackets */}
                        <div className="absolute top-0 left-0 w-20 h-20 border-l-[8px] border-t-[8px] border-[#f47c20] rounded-tl-[48px] z-20 shadow-[-8px_-8px_20px_rgba(244,124,32,0.3)]" />
                        <div className="absolute top-0 right-0 w-20 h-20 border-r-[8px] border-t-[8px] border-[#f47c20] rounded-tr-[48px] z-20 shadow-[8px_-8px_20px_rgba(244,124,32,0.3)]" />
                        <div className="absolute bottom-0 left-0 w-20 h-20 border-l-[8px] border-b-[8px] border-[#f47c20] rounded-bl-[48px] z-20 shadow-[-8px_8px_20px_rgba(244,124,32,0.3)]" />
                        <div className="absolute bottom-0 right-0 w-20 h-20 border-r-[8px] border-b-[8px] border-[#f47c20] rounded-br-[48px] z-20 shadow-[8px_8px_20px_rgba(244,124,32,0.3)]" />

                        {/* Animated Laser Scan Line */}
                        {status === 'idle' && (
                            <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#f47c20] to-transparent z-20 shadow-[0_0_20px_#f47c20,0_0_10px_#f47c20] animate-[scan_3s_ease-in-out_infinite]" />
                        )}

                        {/* Inner Glowing Guideline */}
                        <div className="absolute inset-6 border border-white/5 rounded-[32px] z-10 opacity-30" />
                    </div>
                </div>

                {/* Processing/Error Full Screen Overlays */}
                {(status === 'processing' || status === 'error') && (
                    <div className="absolute inset-0 bg-[#1e1a17]/95 backdrop-blur-3xl z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                        {status === 'processing' ? (
                            <>
                                <div className="w-24 h-24 relative flex items-center justify-center mb-8">
                                    <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                                    <div className="absolute inset-0 rounded-full border-4 border-[#f47c20] border-t-transparent animate-spin" />
                                    <Shield className="w-10 h-10 text-[#f47c20]" />
                                </div>
                                <h3 className="text-white font-black uppercase tracking-[0.3em] text-sm mb-2">Authenticating</h3>
                                <p className="text-white/40 text-[10px] font-bold">Connecting to Vishnu Identity Server...</p>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 mb-8 border border-rose-500/20 shadow-2xl shadow-rose-500/10">
                                    <X className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter italic">Access Denied</h3>
                                <p className="text-rose-400 font-bold text-[11px] mb-10 leading-relaxed px-10">
                                    {errorMessage || "Verification failed. Please try again."}
                                </p>
                                <button
                                    onClick={resetScanner}
                                    className="px-10 py-4 bg-white text-black font-black rounded-3xl shadow-2xl active:scale-95 transition-all text-[11px] tracking-widest uppercase hover:bg-gray-100"
                                >
                                    Try Again
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Recent Scan Overlay Group - Fixed at bottom */}
                <div className="px-6 pb-12 mt-auto relative z-30">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Recent Scan</h3>
                        <div className="w-2 h-2 rounded-full bg-[#f47c20] animate-pulse" />
                    </div>

                    <div className="bg-white/10 backdrop-blur-3xl border border-white/10 rounded-[40px] p-6 flex items-center justify-between shadow-3xl">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-[24px] overflow-hidden border-2 border-white/10 bg-[#f47c20]/10 flex items-center justify-center relative shadow-inner">
                                {studentData?.photo_url ? (
                                    <img src={studentData.photo_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl text-[#f47c20] font-black opacity-60">{studentData?.full_name?.[0]}</span>
                                )}
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-white leading-none mb-2 tracking-tight">{studentData?.full_name}</h4>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-full bg-white/5 text-white/40 text-[9px] font-black tracking-widest uppercase border border-white/5">
                                        ID: {studentData?.student_id}
                                    </span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-emerald-400/80 uppercase tracking-widest italic">Verified</span>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scan {
                    0%, 100% { transform: translateY(0); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(280px); opacity: 0; }
                }
                .font-sans {
                    font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
                }
                .shadow-3xl {
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
            ` }} />
        </div>
    );
};

export default ScanScreen;
