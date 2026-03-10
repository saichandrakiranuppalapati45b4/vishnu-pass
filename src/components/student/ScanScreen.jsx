import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { ChevronLeft, Zap, Loader2, X, Shield, CheckCircle2, Flashlight } from 'lucide-react';
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

        // Diagnostic logging
        console.log('Scan Result:', result);

        // More robust parsing for different library versions/formats
        let rawValue = '';
        if (typeof result === 'string') {
            rawValue = result;
        } else if (Array.isArray(result) && result.length > 0) {
            rawValue = result[0].rawValue || result[0].text || result[0].value;
        } else if (result?.text) {
            rawValue = result.text;
        } else if (result?.rawValue) {
            rawValue = result.rawValue;
        } else if (result?.value) {
            rawValue = result.value;
        }

        if (!rawValue) {
            console.log('Could not extract rawValue from result');
            return;
        }

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
                throw new Error("Invalid Gate QR code. Please scan the official Guard QR.");
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
                    scanDelay={500}
                    onResult={handleScan}
                    onError={(error) => {
                        console.error('Scanner Error:', error);
                        setErrorMessage(error?.message || 'Camera access error');
                        setStatus('error');
                    }}
                    constraints={{
                        facingMode: "environment",
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }}
                    components={{
                        tracker: false,
                        finder: false,
                        audio: true,
                        torch: torchOn
                    }}
                    styles={{
                        container: { width: '100%', height: '100%', background: 'black' },
                        video: { objectFit: 'cover', width: '100%', height: '100%' },
                        finder: { display: 'none' },
                        tracker: { display: 'none' }
                    }}
                />
            </div>

            {/* UI Overlays Layer */}
            <div className="relative z-20 flex flex-col flex-1 h-full">
                {/* Header */}
                <header className="px-6 py-10 flex justify-between items-center relative z-20">
                    <button
                        onClick={onBack}
                        className="w-12 h-12 rounded-full bg-[#332a22]/80 backdrop-blur-xl flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="px-8 py-3 rounded-full bg-[#332a22]/80 backdrop-blur-xl text-white font-black text-[12px] tracking-[0.2em] uppercase shadow-lg">
                        Open Scanner
                    </div>
                    <button
                        onClick={() => setTorchOn(!torchOn)}
                        className={`w-12 h-12 rounded-full backdrop-blur-xl flex items-center justify-center transition-all shadow-lg ${torchOn
                            ? 'bg-[#f47c20] text-white'
                            : 'bg-[#332a22]/80 text-white'
                            }`}
                    >
                        <Flashlight className={`w-5 h-5 ${torchOn ? 'fill-white' : ''}`} />
                    </button>
                </header>

                {/* Instruction - High Visibility Overlay */}
                <div className="px-8 mt-4 mb-4 relative z-20 text-center">
                    <div className="inline-block px-10 py-5 rounded-[40px] bg-[#332a22]/60 backdrop-blur-2xl border border-white/5 shadow-2xl">
                        <p className="text-white/90 text-[14px] font-medium tracking-tight">
                            Position the Guard's QR code within the frame
                        </p>
                    </div>
                </div>

                {/* Scanner Frame - Centered Focus Area */}
                <div className="flex-1 flex items-center justify-center px-10 relative z-30 mb-20">
                    <div className="w-full max-w-[280px] aspect-square relative flex items-center justify-center">
                        {/* Hole-punch Scrim Overlay - Centered exactly with brackets */}
                        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
                            <div className="w-[280px] h-[280px] rounded-[32px] shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
                        </div>
                        {/* Brackets - Minimalist L-shapes */}
                        <div className="absolute top-0 left-0 w-12 h-12 border-l-[4px] border-t-[4px] border-[#f47c20] rounded-tl-[32px] z-20" />
                        <div className="absolute top-0 right-0 w-12 h-12 border-r-[4px] border-t-[4px] border-[#f47c20] rounded-tr-[32px] z-20" />
                        <div className="absolute bottom-0 left-0 w-12 h-12 border-l-[4px] border-b-[4px] border-[#f47c20] rounded-bl-[32px] z-20" />
                        <div className="absolute bottom-0 right-0 w-12 h-12 border-r-[4px] border-b-[4px] border-[#f47c20] rounded-br-[32px] z-20" />

                        {/* Animated Laser Scan Line - Thin horizontal line */}
                        {status === 'idle' && (
                            <div className="absolute top-1/2 left-0 right-0 h-[2.5px] bg-[#f47c20] z-20 shadow-[0_0_15px_#f47c20] animate-[scan_2.5s_ease-in-out_infinite] opacity-70" />
                        )}
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
                <div className="px-6 pb-24 mt-auto relative z-30">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-white/60 text-[12px] font-black uppercase tracking-[0.2em]">Recent Scan</h3>
                    </div>

                    <div className="bg-[#332a22]/80 backdrop-blur-3xl border border-white/5 rounded-[32px] p-5 flex items-center justify-between shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-orange-100 flex items-center justify-center relative shadow-sm">
                                {studentData?.photo_url ? (
                                    <img src={studentData.photo_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-orange-200 flex items-center justify-center">
                                        <Shield className="w-8 h-8 text-[#f47c20] opacity-40" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white leading-tight mb-1">{studentData?.full_name}</h4>
                                <p className="text-white/40 text-[12px] font-medium">
                                    ID: {studentData?.student_id}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center bg-[#42bb70]/20 px-4 py-2 rounded-full border border-[#42bb70]/30 gap-2">
                            <div className="w-5 h-5 rounded-full bg-[#42bb70] flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-[10px] font-black text-[#42bb70] uppercase tracking-wider">Verified</span>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scan {
                    0%, 100% { transform: translateY(-140px); opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translateY(140px); opacity: 0; }
                }
                .font-sans {
                    font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
                }
                .shadow-3xl {
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
                /* Hide any default scanner overlays from the library */
                [class*="tracker"], [class*="finder"], svg {
                    pointer-events: none;
                }
                section > div:nth-child(2), section > div:nth-child(3) {
                    display: none !important;
                }
                /* Broad catch-all for any red borders or outlines */
                [style*="border-color: red"], [style*="border: red"], [style*="outline: red"] {
                    display: none !important;
                    border: none !important;
                    outline: none !important;
                }
            ` }} />
        </div>
    );
};

export default ScanScreen;
