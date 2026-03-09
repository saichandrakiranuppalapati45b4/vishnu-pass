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
        <div className="flex-1 flex flex-col bg-[#1e1a17] overflow-hidden relative font-sans">
            {/* Header */}
            <header className="px-6 py-8 flex justify-between items-center relative z-20">
                <button
                    onClick={onBack}
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-transform"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="px-6 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-white font-black text-xs tracking-widest uppercase">
                    Open Scanner
                </div>
                <button
                    onClick={() => setTorchOn(!torchOn)}
                    className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${torchOn ? 'bg-[#f47c20] text-white shadow-lg shadow-[#f47c20]/40' : 'bg-white/10 text-white'
                        }`}
                >
                    <Zap className={`w-5 h-5 ${torchOn ? 'fill-white' : ''}`} />
                </button>
            </header>

            {/* Instruction */}
            <div className="px-8 mb-12 relative z-20 text-center">
                <div className="inline-block px-6 py-4 rounded-[24px] bg-white/5 backdrop-blur-sm border border-white/10">
                    <p className="text-white/80 text-sm font-bold tracking-tight">
                        Position the Gate's QR code within the frame
                    </p>
                </div>
            </div>

            {/* Scanner Frame */}
            <div className="flex-1 flex flex-col items-center justify-start px-8 relative z-10">
                <div className="w-full max-w-[300px] aspect-square relative rounded-[40px] overflow-hidden border border-white/5 shadow-2xl">
                    {/* Brackets */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-l-[6px] border-t-[6px] border-[#f47c20] rounded-tl-[32px] z-20 shadow-[-4px_-4px_10px_rgba(244,124,32,0.2)]" />
                    <div className="absolute top-0 right-0 w-16 h-16 border-r-[6px] border-t-[6px] border-[#f47c20] rounded-tr-[32px] z-20 shadow-[4px_-4px_10px_rgba(244,124,32,0.2)]" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-l-[6px] border-b-[6px] border-[#f47c20] rounded-bl-[32px] z-20 shadow-[-4px_4px_10px_rgba(244,124,32,0.2)]" />
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-r-[6px] border-b-[6px] border-[#f47c20] rounded-br-[32px] z-20 shadow-[4px_4px_10px_rgba(244,124,32,0.2)]" />

                    {/* Animated Scan Line */}
                    {status === 'idle' && (
                        <div className="absolute top-0 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-[#f47c20] to-transparent z-20 shadow-[0_0_15px_#f47c20] animate-[scan_2.5s_ease-in-out_infinite]" />
                    )}

                    <Scanner
                        onResult={handleScan}
                        onError={(error) => setErrorMessage(error?.message)}
                        components={{ audio: false, torch: torchOn }}
                        styles={{
                            container: { width: '100%', height: '100%', opacity: 0.6 },
                            video: { objectFit: 'cover' }
                        }}
                    />

                    {/* Processing/Error Overlays */}
                    {(status === 'processing' || status === 'error') && (
                        <div className="absolute inset-0 bg-[#1e1a17]/90 backdrop-blur-xl z-30 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                            {status === 'processing' ? (
                                <>
                                    <div className="w-20 h-20 relative flex items-center justify-center mb-6">
                                        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                                        <div className="absolute inset-0 rounded-full border-4 border-[#f47c20] border-t-transparent animate-spin" />
                                        <Shield className="w-8 h-8 text-[#f47c20]" />
                                    </div>
                                    <p className="text-white font-black uppercase tracking-widest text-sm">Verifying...</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 mb-6">
                                        <X className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-black text-rose-400 mb-2 uppercase tracking-tighter italic">Failed</h3>
                                    <p className="text-white/60 text-xs font-bold mb-8 leading-relaxed px-4">
                                        {errorMessage || "Verification failed. Please try again."}
                                    </p>
                                    <button
                                        onClick={resetScanner}
                                        className="px-8 py-3.5 bg-white text-black font-black rounded-2xl shadow-xl active:scale-95 transition-all text-[10px] tracking-widest uppercase"
                                    >
                                        Try Again
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Scan Overlay Group */}
            <div className="px-6 pb-20 mt-auto relative z-20">
                <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-2">Recent Scan</h3>

                <div className="bg-white/10 backdrop-blur-2xl border border-white/5 rounded-[32px] p-5 flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-[#f4a261]/20 flex items-center justify-center relative">
                            {studentData?.photo_url ? (
                                <img src={studentData.photo_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl text-[#f4a261] font-black">{studentData?.full_name?.[0]}</span>
                            )}
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-white leading-none mb-1.5 tracking-tight">{studentData?.full_name}</h4>
                            <p className="text-[11px] font-bold text-white/40 mb-1 leading-none uppercase tracking-wider">
                                ID: {studentData?.student_id}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Verified</span>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scan {
                    0%, 100% { transform: translateY(20px); opacity: 0; }
                    50% { transform: translateY(250px); opacity: 1; }
                }
                .font-sans {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
            ` }} />
        </div>
    );
};

export default ScanScreen;
