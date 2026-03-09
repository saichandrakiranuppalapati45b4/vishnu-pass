import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { ShieldCheck, ShieldAlert, X, Zap, Camera, User, Search, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const GuardScanner = ({ guardData }) => {
    const [scanResult, setScanResult] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [manualId, setManualId] = useState('');

    const handleScan = async (result) => {
        if (!result || isProcessing) return;

        setIsProcessing(true);
        setError(null);

        try {
            const studentId = typeof result === 'string' ? result : result?.text;
            if (!studentId) throw new Error("Invalid QR Code");

            // 1. Verify Student in Database
            const { data: student, error: fetchError } = await supabase
                .from('students')
                .select('*, departments(name)')
                .eq('student_id', studentId)
                .single();

            if (fetchError || !student) {
                setScanResult({
                    status: 'error',
                    message: 'Student record not found in system.',
                    id: studentId
                });
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
                student: student
            });

        } catch (err) {
            console.error("Scan Error:", err);
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setError(null);
        setManualId('');
    };

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
                    onClick={resetScanner}
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
                            components={{
                                audio: true,
                                torch: true
                            }}
                            styles={{
                                container: { width: '100%', height: '100%' },
                                video: { objectFit: 'cover' }
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
                    /* Scan Result View */
                    <div className={`w-full max-w-sm rounded-[40px] p-8 border ${scanResult.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10' : 'bg-rose-500/10 border-rose-500/20 shadow-rose-500/10'} backdrop-blur-md animate-in zoom-in-95 duration-300`}>
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${scanResult.status === 'success' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'}`}>
                                {scanResult.status === 'success' ? <ShieldCheck className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
                            </div>

                            <h3 className={`text-2xl font-black tracking-tight mb-2 ${scanResult.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {scanResult.status === 'success' ? 'AUTHORIZED' : 'ACCESS DENIED'}
                            </h3>

                            {scanResult.status === 'success' ? (
                                <div className="space-y-4 w-full bg-white/5 rounded-3xl p-6 border border-white/5 mt-4">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/20">
                                            {scanResult.student.photo_url ? (
                                                <img src={scanResult.student.photo_url} alt="Student" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                                                    {scanResult.student.full_name[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-lg leading-tight">{scanResult.student.full_name}</p>
                                            <p className="text-emerald-400/70 text-xs font-bold uppercase tracking-wider">{scanResult.student.student_id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Department</p>
                                            <p className="text-[10px] font-bold text-white uppercase">{scanResult.student.departments?.name || 'GENERIC'}</p>
                                        </div>
                                        <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Year</p>
                                            <p className="text-[10px] font-bold text-white uppercase">{scanResult.student.year_of_study || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-rose-400/70 font-bold text-sm bg-rose-500/5 px-4 py-3 rounded-2xl border border-rose-500/10 mt-4 leading-relaxed">
                                    {scanResult.message}
                                </p>
                            )}

                            <button
                                onClick={resetScanner}
                                className="mt-8 w-full py-4 bg-white text-slate-900 font-black rounded-2xl shadow-xl shadow-white/5 hover:bg-slate-50 transition-all active:scale-95"
                            >
                                NEXT SCAN
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
            ` }} />
        </div>
    );
};

export default GuardScanner;
