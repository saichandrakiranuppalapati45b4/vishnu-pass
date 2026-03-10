import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { ShieldCheck, ShieldAlert, X, Zap, Camera, User, Search, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import VerificationResult from '../student/VerificationResult';
import { format } from 'date-fns';


const GuardScanner = ({ guardData, onBack }) => {
    const [scanResult, setScanResult] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [manualId, setManualId] = useState('');

    const handleScan = async (result) => {
        if (!result || isProcessing || status === 'success') return;

        // More robust parsing for different library versions/formats
        let rawValue = '';
        if (typeof result === 'string') {
            rawValue = result;
        } else if (Array.isArray(result) && result.length > 0) {
            rawValue = result[0].rawValue || result[0].text;
        } else if (result.text) {
            rawValue = result.text;
        } else if (result.rawValue) {
            rawValue = result.rawValue;
        }

        if (!rawValue) {
            console.error("Invalid scan result structure:", result);
            return;
        }

        setStatus('processing');
        setError(null);

        try {
            // Expected format: https://vishnupass.com/verify/{student_id}_{qrToken}
            let extractedStudentId = null;
            try {
                let tokenString = rawValue;
                if (rawValue.startsWith('http')) {
                    const url = new URL(rawValue);
                    tokenString = url.pathname.split('/').pop();
                }

                // tokenString is "{studentId}_{qrToken}"
                if (tokenString.includes('_')) {
                    const parts = tokenString.split('_');
                    // The student_id is everything before the last underscore
                    extractedStudentId = parts.slice(0, -1).join('_');
                } else {
                    extractedStudentId = tokenString;
                }
            } catch (e) {
                extractedStudentId = rawValue;
            }

            if (!extractedStudentId) {
                throw new Error("Invalid QR code format.");
            }

            // 1. Verify Student in Database
            const { data: student, error: fetchError } = await supabase
                .from('students')
                .select('*, departments(name)')
                .eq('student_id', extractedStudentId)
                .single();

            if (fetchError || !student) {
                setScanResult({
                    status: 'error',
                    message: 'Student record not found in system.',
                    id: extractedStudentId
                });
                setStatus('error');
                return;
            }

            // 2. Log Movement
            const { error: logError } = await supabase
                .from('movement_logs')
                .insert({
                    user_name: student.full_name,
                    student_id: student.student_id,
                    access_point_id: guardData?.gate_id,
                    movement_type: 'AUTHORIZED', // Based on scan
                    status: 'Success'
                });

            if (logError) throw logError;

            // 3. Display Success
            setScanResult({
                status: 'success',
                student: {
                    ...student,
                    verifiedAt: format(new Date(), 'hh:mm a')
                }
            });
            setStatus('success');

        } catch (err) {
            console.error("Scan Error:", err);
            setError(err.message);
            setStatus('error');
        } finally {
            setIsProcessing(false);
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setStatus('idle');
        setError(null);
        setManualId('');
    };

    if (scanResult?.status === 'success' && scanResult.student) {
        return (
            <div className="absolute inset-0 z-50 bg-white">
                <VerificationResult
                    studentData={scanResult.student}
                    gateName={guardData?.guard_gates?.name}
                    verifiedAt={scanResult.student.verifiedAt}
                    onNextScan={resetScanner}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full bg-slate-900 overflow-hidden relative">
            {/* Header */}
            <div className="p-6 flex items-center justify-between text-white relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f47c20] flex items-center justify-center shadow-lg shadow-[#f47c20]/20">
                        <Zap className="w-6 h-6 fill-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight leading-tight">Fast Scan</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{guardData?.guard_gates?.name || 'Gate Access Control'}</p>
                    </div>
                </div>
                <button
                    onClick={onBack || resetScanner}
                    className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-slate-700/50"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Scanner Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                {!scanResult ? (
                    <div className="w-full max-w-sm aspect-square relative rounded-[40px] overflow-hidden border-2 border-slate-800 shadow-2xl">
                        {/* Scanning Brackets */}
                        <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-[#f47c20] rounded-tl-2xl z-20 animate-pulse" />
                        <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-[#f47c20] rounded-tr-2xl z-20 animate-pulse" />
                        <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-[#f47c20] rounded-bl-2xl z-20 animate-pulse" />
                        <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-[#f47c20] rounded-br-2xl z-20 animate-pulse" />

                        {/* Animated Scan Line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#f47c20] to-transparent z-20 shadow-[0_0_15px_#f47c20] animate-[scan_3s_ease-in-out_infinite]" />

                        <Scanner
                            onResult={handleScan}
                            onError={(error) => console.log(error?.message)}
                            constraints={{
                                facingMode: "environment",
                                width: { min: 1280, ideal: 1920 },
                                height: { min: 720, ideal: 1080 },
                                frameRate: { ideal: 60 },
                                advanced: [
                                    { focusMode: 'continuous' },
                                    { whiteBalanceMode: 'continuous' }
                                ]
                            }}
                            components={{
                                tracker: false,
                                finder: false,
                                audio: true,
                                torch: true
                            }}
                            styles={{
                                container: { width: '100%', height: '100%', background: 'black' },
                                video: { objectFit: 'cover', width: '100%', height: '100%' },
                                finder: { display: 'none' },
                                tracker: { display: 'none' }
                            }}
                        />

                        {isProcessing && (
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white gap-4">
                                <Loader2 className="w-10 h-10 text-[#f47c20] animate-spin" />
                                <p className="text-sm font-bold tracking-widest uppercase">Verifying ID...</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Error View */
                    <div className="w-full max-w-sm rounded-[40px] p-8 border bg-rose-500/10 border-rose-500/20 shadow-rose-500/10 backdrop-blur-md animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 bg-rose-500 text-white shadow-lg shadow-rose-500/30">
                                <ShieldAlert className="w-10 h-10" />
                            </div>

                            <h3 className="text-2xl font-black tracking-tight mb-2 text-rose-400">
                                ACCESS DENIED
                            </h3>

                            <p className="text-rose-400/70 font-bold text-sm bg-rose-500/5 px-4 py-3 rounded-2xl border border-rose-500/10 mt-4 leading-relaxed">
                                {scanResult?.message || error || "Verification failed."}
                            </p>

                            <button
                                onClick={resetScanner}
                                className="mt-8 w-full py-4 bg-white text-slate-900 font-black rounded-2xl shadow-xl shadow-white/5 hover:bg-slate-50 transition-all active:scale-95 text-xs tracking-[0.2em] uppercase"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Manual Input Helper */}
                {!scanResult && (
                    <div className="mt-8 w-full max-w-sm px-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="MANUAL STUDENT ID SEARCH..."
                                value={manualId}
                                onChange={(e) => setManualId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleScan(manualId)}
                                className="w-full pl-11 pr-4 py-4 bg-slate-800/40 border-2 border-slate-700/50 rounded-2xl focus:outline-none focus:border-[#f47c20]/50 text-white text-xs font-black tracking-widest placeholder:text-slate-600 transition-all shadow-inner"
                            />
                        </div>
                        <p className="text-center mt-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Hold device steady over QR code to auto-verify</p>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scan {
                    0%, 100% { top: 10%; opacity: 0.1; }
                    50% { top: 90%; opacity: 0.8; }
                }
                /* Hide any default scanner overlays from the library */
                [class*="tracker"], [class*="finder"], svg {
                    pointer-events: none;
                }
                section > div:nth-child(2), section > div:nth-child(3) {
                    display: none !important;
                }
            ` }} />
        </div>
    );
};

export default GuardScanner;
