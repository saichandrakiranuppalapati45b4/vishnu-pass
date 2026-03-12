import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Shield, Clock, Zap, Loader2, Fingerprint, Camera, ShieldCheck, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Scanner } from '@yudiel/react-qr-scanner';

const ScanScreen = ({ studentData, onBack }) => {
    const [status, setStatus] = useState('idle'); // idle -> requesting (camera open) -> approved (can scan) -> completed
    const [timeLeft, setTimeLeft] = useState(25);
    const [sessionId, setSessionId] = useState(null);
    const [error, setError] = useState(null);

    const sessionIdRef = useRef(null);
    const statusRef = useRef('idle');

    useEffect(() => {
        sessionIdRef.current = sessionId;
    }, [sessionId]);

    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    // Countdown Timer logic
    useEffect(() => {
        let timer;
        if (status === 'requesting' || status === 'approved') {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setStatus('expired');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [status]);

    // Cleanup session on expire
    useEffect(() => {
        if (status === 'expired' && sessionId) {
            supabase
                .from('scan_sessions')
                .update({ status: 'expired' })
                .eq('id', sessionId)
                .then();
        }
    }, [status, sessionId]);

    // Realtime subscription for Guard Approval
    useEffect(() => {
        if (!sessionId) return;

        const channel = supabase
            .channel(`session_${sessionId}`)
            .on('postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'scan_sessions',
                    filter: `id=eq.${sessionId}`
                },
                (payload) => {
                    const newStatus = payload.new.status;
                    if (newStatus === 'approved') {
                        setStatus('approved');
                    } else if (newStatus === 'expired') {
                        setStatus('expired');
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    const handleRequestAccess = async () => {
        setError(null);
        setStatus('requesting');
        setTimeLeft(25);

        try {
            const { data, error: insertError } = await supabase
                .from('scan_sessions')
                .insert([{
                    student_id: studentData.student_id,
                    status: 'pending'
                }])
                .select()
                .single();

            if (insertError) throw insertError;

            setSessionId(data.id);
        } catch (err) {
            console.error("Error creating request:", err);
            setError("Failed to create request. Please try again.");
            setStatus('idle');
        }
    };

    const handleScan = async (result) => {
        if (!result) return;

        const currentStatus = statusRef.current;
        const currentSessionId = sessionIdRef.current;

        // We allow scanning as long as we have requested access (status should be requesting or approved)
        if (currentStatus === 'idle' || currentStatus === 'completed' || currentStatus === 'expired') {
            setError(`Scanner ignored scan because status is: ${currentStatus}`);
            return;
        }

        if (!currentSessionId) {
            setError("Scan detected, but sessionId is missing!");
            console.error("Scan detected, but sessionId is missing!");
            return;
        }

        let rawValue = typeof result === 'string' ? result : (result[0]?.rawValue || result?.text || result?.rawValue);

        if (!rawValue) {
            setError("Scanner read empty value from QR code.");
            return;
        }

        try {
            setStatus('processing_scan');

            // Expected format: https://vishnupass.com/gate/{gateId}_{timestamp_token}
            // Or just: {gateId}_{timestamp_token}
            let scannedGateId = null;
            if (rawValue.includes('/gate/')) {
                // Extract gate id, ignoring the token part
                const dataPart = rawValue.split('/gate/').pop();
                scannedGateId = dataPart.split('_')[0].trim();
            } else {
                // In case it's just the raw format like "gate-main_token"
                scannedGateId = rawValue.split('_')[0].trim();
            }

            console.log("Extracted Gate ID:", scannedGateId);

            if (!scannedGateId) {
                throw new Error("Invalid Gate QR");
            }

            // Mark session as completed and associate with the gate
            console.log(`[STUDENT] Updating session ${currentSessionId} with Gate: ${scannedGateId}`);
            const { error: updateError } = await supabase
                .from('scan_sessions')
                .update({
                    status: 'completed',
                    gate_id: scannedGateId
                })
                .eq('id', currentSessionId);

            if (updateError) {
                console.error("[STUDENT] Supabase update error:", updateError);
                throw updateError;
            }

            console.log("[STUDENT] Session updated successfully. Broadcasting signal...");

            // NEW: Send a high-speed broadcast signal directly to the guard's channel
            const channelName = `gate_monitor_${scannedGateId}`;
            const broadcastChannel = supabase.channel(channelName);
            
            // Subscribe first to ensure the channel is "warm"
            broadcastChannel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`[STUDENT] Channel ${channelName} ready. Sending signal...`);
                    
                    const resp = await broadcastChannel.send({
                        type: 'broadcast',
                        event: 'SCAN_COMPLETED',
                        payload: { sessionId: currentSessionId }
                    });
                    
                    console.log(`[STUDENT] Signal sent to ${channelName}. Response:`, resp);
                    
                    // Small delay to ensure the broadcast clears the network buffer before we move on
                    setTimeout(() => {
                        setStatus('completed');
                        supabase.removeChannel(broadcastChannel);
                    }, 500);
                }
            });

        } catch (err) {
            console.error("Scan error details:", err);
            setError(err?.message || err?.details || "Failed to update session data");
            setStatus('approved');
        }
    };

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
                    {status === 'approved' ? 'Scanner Active' : 'Access Request'}
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
            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-30 pb-20 mt-4">
                <div className="w-full bg-[#1e1a17]/95 rounded-[40px] p-8 shadow-2xl border border-white/5 relative overflow-hidden backdrop-blur-2xl">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#f47c20] to-[#e06b12]" />

                    {status === 'idle' || status === 'expired' ? (
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-[#f47c20]/10 flex items-center justify-center mb-6">
                                <Fingerprint className="w-12 h-12 text-[#f47c20]" />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight leading-tight mb-2">
                                Access Control
                            </h2>
                            <p className="text-sm font-bold text-gray-400 mb-8 leading-relaxed max-w-[240px]">
                                Tap the button below to request gate access. The guard will approve to unlock your scanner.
                            </p>

                            {status === 'expired' && (
                                <p className="text-rose-400 font-bold text-xs mb-6 px-4 py-2 bg-rose-500/10 rounded-xl">
                                    Request expired. Please try again.
                                </p>
                            )}

                            <button
                                onClick={handleRequestAccess}
                                className="w-full py-5 bg-gradient-to-r from-[#f47c20] to-[#e06b12] text-white font-black rounded-2xl shadow-xl shadow-[#f47c20]/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all text-sm tracking-[0.2em] uppercase"
                            >
                                <Zap className="w-5 h-5 fill-white" />
                                Request Access
                            </button>
                        </div>
                    ) : status === 'requesting' || status === 'approved' || status === 'processing_scan' ? (
                        <div className="flex flex-col items-center text-center">

                            {/* Status Indicator */}
                            <div className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-xl border bg-emerald-500/10 text-emerald-400 border-emerald-500/20`}>
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-xs font-black uppercase tracking-wider">Scanner Ready - Point at Gate QR</span>
                            </div>

                            {error && (
                                <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl w-full">
                                    <p className="text-xs font-bold text-red-400 break-words">{error}</p>
                                </div>
                            )}

                            <div className="w-full aspect-square relative rounded-[32px] overflow-hidden border-2 border-[#f47c20]/30 shadow-2xl mb-6 bg-black">
                                <div className={`absolute inset-0 border-4 transition-colors duration-300 z-30 pointer-events-none border-emerald-500/50`} />
                                <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-[#f47c20] rounded-tl-2xl z-20" />
                                <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-[#f47c20] rounded-tr-2xl z-20" />
                                <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-[#f47c20] rounded-bl-2xl z-20" />
                                <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-[#f47c20] rounded-br-2xl z-20" />
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#f47c20] to-transparent z-20 animate-[scan_3s_ease-in-out_infinite]" />

                                <Scanner
                                    onScan={handleScan}
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
                                        video: {
                                            objectFit: 'cover',
                                            width: '100%',
                                            height: '100%',
                                            opacity: status === 'requesting' ? 0.5 : 1 // Dim camera while waiting for approval
                                        },
                                    }}
                                />

                                {status === 'processing_scan' && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white gap-4">
                                        <Loader2 className="w-8 h-8 text-[#f47c20] animate-spin" />
                                        <p className="text-xs font-bold tracking-widest uppercase">Verifying Gate...</p>
                                    </div>
                                )}
                            </div>

                            <p className="text-xs font-bold text-gray-400 mb-4 leading-relaxed tracking-wide">
                                {status === 'requesting'
                                    ? "Camera active. Awaiting guard's signal."
                                    : "Scan the Guard's Gate QR code now."}
                            </p>

                            <div className="text-[#f47c20] font-black text-xl flex items-center justify-between w-full px-4">
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="px-4 py-2 bg-white/5 text-gray-400 font-bold rounded-xl active:scale-[0.98] transition-all text-[10px] tracking-[0.1em] uppercase hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    00:{timeLeft.toString().padStart(2, '0')}
                                </div>
                            </div>
                        </div>
                    ) : ( // completed
                        <div className="flex flex-col items-center text-center py-8">
                            <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                                <ShieldCheck className="w-12 h-12 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight leading-tight mb-2">
                                Handshake Complete
                            </h2>
                            <p className="text-sm font-bold text-emerald-400/80 mb-8 leading-relaxed max-w-[240px]">
                                Your digital pass is now active on the Guard's monitor. Verification successful.
                            </p>

                            <button
                                onClick={onBack}
                                className="w-full py-5 bg-white/5 text-white font-black rounded-2xl border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all text-sm tracking-[0.2em] uppercase"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .font-sans { font-family: 'Outfit', 'Inter', -apple-system, sans-serif; }
                @keyframes scan {
                    0%, 100% { top: 10%; opacity: 0.1; }
                    50% { top: 90%; opacity: 0.8; }
                }
                [class*="tracker"], [class*="finder"], svg { pointer-events: none; }
                section > div:nth-child(2), section > div:nth-child(3) { display: none !important; }
            ` }} />
        </div>
    );
};

export default ScanScreen;
