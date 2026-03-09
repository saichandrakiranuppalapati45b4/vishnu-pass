import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Camera, CameraOff, Loader2, X, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import VerificationResult from './VerificationResult';
import { format } from 'date-fns';

const ScanScreen = ({ studentData }) => {
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const [errorMessage, setErrorMessage] = useState(null);
    const [scanData, setScanData] = useState(null);

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
                // Check if it's a raw UUID
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (uuidRegex.test(rawValue)) {
                    gateId = rawValue;
                }
            }

            if (!gateId) {
                throw new Error("This is not a valid gate QR code.");
            }

            // 2. Fetch Gate Name for Display
            const { data: gate, error: gateError } = await supabase
                .from('guard_gates')
                .select('name')
                .eq('id', gateId)
                .single();

            if (gateError || !gate) {
                throw new Error("Scanning point not recognized.");
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
            setErrorMessage(err.message || 'Verification failed. Please try again.');
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
        <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
            {/* Header */}
            <div className="p-6 flex items-center justify-between text-white relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f47c20] flex items-center justify-center shadow-lg shadow-[#f47c20]/20">
                        <Shield className="w-6 h-6 fill-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight leading-tight">Secure Scan</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verify at Exit/Entry Point</p>
                    </div>
                </div>
            </div>

            {/* Scanner Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                <div className="w-full max-w-sm aspect-square relative rounded-[40px] overflow-hidden border-2 border-slate-800 shadow-2xl">
                    {/* Scanning Brackets */}
                    <div className="absolute top-8 left-8 w-12 h-12 border-l-4 border-t-4 border-[#f47c20] rounded-tl-2xl z-20" />
                    <div className="absolute top-8 right-8 w-12 h-12 border-r-4 border-t-4 border-[#f47c20] rounded-tr-2xl z-20" />
                    <div className="absolute bottom-8 left-8 w-12 h-12 border-l-4 border-b-4 border-[#f47c20] rounded-bl-2xl z-20" />
                    <div className="absolute bottom-8 right-8 w-12 h-12 border-r-4 border-b-4 border-[#f47c20] rounded-br-2xl z-20" />

                    {/* Animated Scan Line */}
                    {status === 'idle' && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#f47c20] to-transparent z-20 shadow-[0_0_15px_#f47c20] animate-[scan_3s_ease-in-out_infinite]" />
                    )}

                    <Scanner
                        onResult={handleScan}
                        onError={(error) => setErrorMessage(error?.message)}
                        components={{
                            audio: false,
                            torch: true
                        }}
                        styles={{
                            container: { width: '100%', height: '100%' },
                            video: { objectFit: 'cover' }
                        }}
                    />

                    {/* Overlay States */}
                    {(status === 'processing' || status === 'error') && (
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-8 text-center">
                            {status === 'processing' ? (
                                <>
                                    <Loader2 className="w-12 h-12 text-[#f47c20] animate-spin mb-4" />
                                    <p className="text-white font-black uppercase tracking-widest text-sm text-center">Verifying Access...</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 mb-6">
                                        <X className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-xl font-black text-rose-400 mb-2 uppercase italic tracking-tighter">Access Denied</h3>
                                    <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                                        {errorMessage || "We couldn't verify this QR code. Please try again or visit security."}
                                    </p>
                                    <button
                                        onClick={resetScanner}
                                        className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs tracking-widest uppercase"
                                    >
                                        Try Again
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center max-w-xs">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                        Point your camera at the <span className="text-[#f47c20]">Gate Security QR</span> to record your movement
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scan {
                    0%, 100% { top: 10%; opacity: 0; }
                    50% { top: 90%; opacity: 1; }
                }
            ` }} />
        </div>
    );
};

export default ScanScreen;
