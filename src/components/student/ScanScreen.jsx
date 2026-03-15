import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Shield, Clock, Zap, Loader2, Fingerprint, Camera, ShieldCheck, X, LogIn, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Scanner } from '@yudiel/react-qr-scanner';
import VerificationResult from './VerificationResult';

const ScanScreen = ({ studentData, onBack }) => {
    const [status, setStatus] = useState('idle'); // idle -> requesting (camera open) -> approved (can scan) -> completed
    const [timeLeft, setTimeLeft] = useState(25);
    const [sessionId, setSessionId] = useState(null);
    const [error, setError] = useState(null);
    const [movementType, setMovementType] = useState(null);
    const [gateData, setGateData] = useState(null);
    const [verifiedAt, setVerifiedAt] = useState(null);
    const [sessionWarning, setSessionWarning] = useState(null);
    const [currentLogId, setCurrentLogId] = useState(null);

    const sessionIdRef = useRef(null);
    const statusRef = useRef('idle');
    const logIdRef = useRef(null);
    const scanLock = useRef(false);

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
                    const newWarning = payload.new.warning;
                    
                    if (newWarning) setSessionWarning(newWarning);
                    
                    if (newStatus === 'approved') {
                        setStatus('approved');
                    } else if (newStatus === 'completed') {
                        // If guard approves from their end, show success
                        setStatus('completed');
                        setVerifiedAt(new Date().toISOString());
                        
                        // Update corresponding log to Success by ID if we have it
                        if (logIdRef.current) {
                            supabase.from('movement_logs')
                                .update({ status: 'Success' })
                                .eq('id', logIdRef.current)
                                .then();
                        } else {
                            // Fallback to updating all pending for this student
                            supabase.from('movement_logs')
                                .update({ status: 'Success' })
                                .eq('student_id', studentData.student_id)
                                .eq('status', 'Pending')
                                .then();
                        }
                    } else if (newStatus === 'expired') {
                        setStatus('expired');
                        if (logIdRef.current) {
                            supabase.from('movement_logs')
                                .update({ status: 'Expired' })
                                .eq('id', logIdRef.current)
                                .then();
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    // Unmount cleanup logic
    useEffect(() => {
        return () => {
            const currentSession = sessionIdRef.current;
            const currentStatus = statusRef.current;
            const currentLog = logIdRef.current;

            if (currentSession && (currentStatus === 'requesting' || currentStatus === 'approved' || currentStatus === 'pending')) {
                console.log("[STUDENT] Component unmounting, cancelling abandoned session:", currentSession);
                supabase
                    .from('scan_sessions')
                    .update({ status: 'cancelled' })
                    .eq('id', currentSession)
                    .then();

                if (currentLog) {
                    supabase
                        .from('movement_logs')
                        .update({ status: 'Cancelled' })
                        .eq('id', currentLog)
                        .then();
                }
            }
        };
    }, []);

    const handleRequestAccess = async (type) => {
        setError(null);
        setMovementType(type);
        console.log(`[STUDENT] Requesting ${type} access for student:`, studentData?.student_id);
        
        try {
            if (!studentData?.student_id) {
                throw new Error("Student ID missing. Please re-login.");
            }

            // 1. Fetch Policies (Use maybeSingle as 'key' should be unique)
            const { data: policyData, error: policyError } = await supabase
                .from('portal_settings')
                .select('value')
                .eq('key', 'student_policies')
                .maybeSingle();
            
            if (policyError) {
                console.error("Policy fetch error:", policyError);
            }

            let policies = policyData?.value;
            
            // Defensively parse JSON if it comes back as a string
            if (typeof policies === 'string') {
                try {
                    policies = JSON.parse(policies);
                } catch (e) {
                    console.error("Failed to parse policies JSON:", e);
                }
            }

            // 0. Cleanup any existing pending sessions or logs for this student
            // This prevents duplication in the logs if they click multiple times or restart
            console.log("[STUDENT] Cleaning up any abandoned pending sessions for:", studentData.student_id);
            await Promise.all([
                supabase
                    .from('scan_sessions')
                    .update({ status: 'cancelled' })
                    .eq('student_id', studentData.student_id)
                    .eq('status', 'pending'),
                supabase
                    .from('movement_logs')
                    .update({ status: 'Cancelled' })
                    .eq('student_id', studentData.student_id)
                    .eq('status', 'Pending')
            ]);

            if (policies) {
                // Determine limits based on student category
                const category = studentData.hostel_type === 'hosteler' ? 'hosteler' : 'dayscholar';
                if (!policies[category]) {
                    console.warn(`Policy for category [${category}] not found in settings.`);
                } else {
                    const normalizedType = type === 'IN' ? 'ENTRY' : 'EXIT';
                    const limit = type === 'IN' ? policies[category].monthlyInLimit : policies[category].monthlyOutLimit;
                    
                    // 2. Count current month movements from scan_sessions (source of truth)
                    const startOfMonth = new Date();
                    startOfMonth.setDate(1);
                    startOfMonth.setHours(0, 0, 0, 0);
                    
                    const { count, error: countError } = await supabase
                        .from('scan_sessions')
                        .select('*', { count: 'exact', head: true })
                        .eq('student_id', studentData.student_id)
                        .eq('movement_type', type) // 'IN' or 'OUT'
                        .eq('status', 'completed')
                        .gte('created_at', startOfMonth.toISOString());
                    
                    if (countError) {
                        console.error("Count query error:", countError);
                    }
                    
                    const isLimitReached = count !== null && count >= limit;
                    
                    // Immediately switch to 'requesting' (opens camera)
                    setStatus('requesting');
                    setTimeLeft(25);

                    // Create pending session with warning if limit reached
                    const { data, error: insertError } = await supabase
                        .from('scan_sessions')
                        .insert([{
                            student_id: studentData.student_id,
                            status: 'pending',
                            movement_type: type,
                            warning: isLimitReached ? `Monthly ${type} limit reached (${count}/${limit})` : null
                        }])
                        .select()
                        .maybeSingle();

                    if (insertError) {
                        console.error("Insert session error:", insertError);
                        throw new Error(`Session creation error: ${insertError.message}`);
                    }

                    if (data) {
                        console.log("[STUDENT] Session created successfully:", data.id);
                        setSessionId(data.id);
                        setSessionWarning(data.warning);

                        // 3. Create a PENDING log entry so it shows in Entry Logs immediately
                        const { data: logData, error: logError } = await supabase
                            .from('movement_logs')
                            .insert([{
                                user_name: studentData.full_name,
                                student_id: studentData.student_id,
                                movement_type: type, // 'IN' or 'OUT'
                                status: 'Pending'
                            }])
                            .select()
                            .maybeSingle();

                        if (logError) {
                            console.error("[STUDENT] Pending log creation error:", logError);
                        } else if (logData) {
                            console.log("[STUDENT] Pending log created:", logData.id);
                            setCurrentLogId(logData.id);
                            logIdRef.current = logData.id;
                        }
                    } else {
                        throw new Error("Failed to retrieve session after creation.");
                    }
                }
            }

        } catch (err) {
            console.error("Error creating request:", err);
            setError(`Request Failed: ${err.message || 'Please try again.'}`);
            setStatus('idle');
        }
    };

    const handleScan = async (result) => {
        if (!result || scanLock.current) return;

        const currentStatus = statusRef.current;
        const currentSessionId = sessionIdRef.current;

        // Only allow scanning in 'requesting' status
        if (currentStatus !== 'requesting') return;
        if (!currentSessionId) return;

        let rawValue = typeof result === 'string' ? result : (result[0]?.rawValue || result?.text || result?.rawValue);
        if (!rawValue) return;

        try {
            scanLock.current = true;
            setStatus('processing_scan');

            // Extraction logic
            let scannedGateId = null;
            if (rawValue.includes('/gate/')) {
                const dataPart = rawValue.split('/gate/').pop();
                scannedGateId = dataPart.split('_')[0].trim();
            } else {
                scannedGateId = rawValue.split('_')[0].trim();
            }

            if (!scannedGateId) throw new Error("Invalid Gate QR");

            // Fetch gate name for the result screen
            const { data: gateInfo } = await supabase
                .from('guard_gates')
                .select('name')
                .eq('id', scannedGateId)
                .maybeSingle();
            
            setGateData(gateInfo);

            // Fetch Policies for Auto-Approval check
            const { data: policyData } = await supabase
                .from('portal_settings')
                .select('value')
                .eq('key', 'student_policies')
                .maybeSingle();
            
            let policies = policyData?.value;

            // Defensively parse JSON if it comes back as a string
            if (typeof policies === 'string') {
                try {
                    policies = JSON.parse(policies);
                } catch (e) {
                    console.error("Failed to parse policies JSON in handleScan:", e);
                }
            }
            const category = studentData.hostel_type === 'hosteler' ? 'hosteler' : 'dayscholar';
            
            // Auto-approve logic:
            // 1. IN requests are usually auto-approved if scanned
            // 2. OUT requests follow the autoApproveOutpass policy
            const isAutoApprovable = (movementType === 'IN') || 
                                     (movementType === 'OUT' && policies?.[category]?.autoApproveOutpass);

            console.log(`[STUDENT] Scan detected at ${scannedGateId}. Auto-Approvable: ${isAutoApprovable}`);

            const newStatus = isAutoApprovable ? 'completed' : 'approved';

            // Update session
            const { error: updateError } = await supabase
                .from('scan_sessions')
                .update({
                    status: newStatus,
                    gate_id: scannedGateId
                })
                .eq('id', currentSessionId);

            if (updateError) throw updateError;

            // Update log (either existing or new if not found)
            if (currentLogId || isAutoApprovable) {
                const logUpdate = {
                    access_point_id: scannedGateId,
                    status: isAutoApprovable ? 'Success' : 'Pending'
                };

                let logResult;
                if (currentLogId) {
                    logResult = await supabase
                        .from('movement_logs')
                        .update(logUpdate)
                        .eq('id', currentLogId);
                } else {
                    // Fallback: create if not exists
                    logResult = await supabase.from('movement_logs').insert({
                        user_name: studentData.full_name,
                        student_id: studentData.student_id,
                        movement_type: movementType, // Already 'IN' or 'OUT'
                        ...logUpdate
                    });
                }

                if (logResult.error) {
                    console.error("[SCAN] Movement Log Update Error:", logResult.error);
                } else {
                    console.log("[SCAN] Movement Log updated successfully");
                }
            }
            
            if (isAutoApprovable) {
                setVerifiedAt(new Date().toISOString());
                setStatus('completed');
            } else {
                // If not auto-approvable, stay in 'approved' (wait for guard)
                setStatus('approved');
            }

            // High-speed broadcast to guard
            const channelName = `gate_monitor_${scannedGateId}`;
            const broadcastChannel = supabase.channel(channelName);
            broadcastChannel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await broadcastChannel.send({
                        type: 'broadcast',
                        event: 'SCAN_COMPLETED',
                        payload: { sessionId: currentSessionId, autoCompleted: isAutoApprovable }
                    });
                    setTimeout(() => supabase.removeChannel(broadcastChannel), 1000);
                }
            });

        } catch (err) {
            console.error("Scan error:", err);
            setError(err?.message || "Verification failed");
            setStatus('requesting');
        } finally {
            scanLock.current = false;
        }
    };

    if (status === 'completed') {
        return (
            <VerificationResult 
                studentData={studentData}
                gateName={gateData?.name || 'Main Gate'}
                verifiedAt={verifiedAt ? new Date(verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                onNextScan={onBack}
                hideNavBar={true}
            />
        );
    }

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
                    {status === 'idle' ? 'Access Request' : 'Scanner Active'}
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
                                Tap to start. Camera will open immediately to scan the Gate QR.
                            </p>

                            {error && (
                                <p className="text-rose-400 font-bold text-xs mb-6 px-4 py-2 bg-rose-500/10 rounded-xl">
                                    {error}
                                </p>
                            )}

                            {status === 'expired' && (
                                <p className="text-rose-400 font-bold text-xs mb-6 px-4 py-2 bg-rose-500/10 rounded-xl">
                                    Request expired. Please try again.
                                </p>
                            )}

                            <div className="flex flex-col gap-3 w-full">
                                <button
                                    onClick={() => handleRequestAccess('IN')}
                                    className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all text-sm tracking-[0.2em] uppercase"
                                >
                                    <LogIn className="w-5 h-5" />
                                    Request Entry
                                </button>
                                <button
                                    onClick={() => handleRequestAccess('OUT')}
                                    className="w-full py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all text-sm tracking-[0.2em] uppercase"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Request Exit
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center">
                            {/* Status Indicator */}
                            <div className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-xl border ${
                                status === 'approved' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                                {status === 'approved' ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ShieldCheck className="w-4 h-4" />
                                )}
                                <span className="text-xs font-black uppercase tracking-wider">
                                    {status === 'approved' ? 'Awaiting Guard Signal' : 'Scanner Ready - Point at Gate QR'}
                                </span>
                            </div>

                            {error && (
                                <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl w-full">
                                    <p className="text-xs font-bold text-red-400 break-words">{error}</p>
                                </div>
                            )}

                            <div className="w-full aspect-square relative rounded-[32px] overflow-hidden border-2 border-[#f47c20]/30 shadow-2xl mb-6 bg-black">
                                <div className={`absolute inset-0 border-4 transition-colors duration-300 z-30 pointer-events-none ${
                                    status === 'approved' ? 'border-amber-500/50' : 'border-emerald-500/50'
                                }`} />
                                <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-[#f47c20] rounded-tl-2xl z-20" />
                                <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-[#f47c20] rounded-tr-2xl z-20" />
                                <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-[#f47c20] rounded-bl-2xl z-20" />
                                <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-[#f47c20] rounded-br-2xl z-20" />
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#f47c20] to-transparent z-20 animate-[scan_3s_ease-in-out_infinite]" />

                                <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="w-8 h-8 text-[#f47c20] animate-spin opacity-50" />
                                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Loading Camera...</p>
                                    </div>
                                </div>

                                <Scanner
                                    onScan={handleScan}
                                    onError={(err) => {
                                        console.error("Scanner Error:", err);
                                        const msg = typeof err === 'string' ? err : err?.message || 'Permission denied or not found';
                                        setError(`Camera error: ${msg}`);
                                    }}
                                    constraints={{
                                        facingMode: "environment"
                                    }}
                                    components={{ tracker: false, finder: false, audio: true, torch: true }}
                                    styles={{
                                        container: { width: '100%', height: '100%', background: 'black', position: 'relative', zIndex: 20 },
                                        video: { objectFit: 'cover', width: '100%', height: '100%' },
                                    }}
                                />

                                {(status === 'processing_scan' || status === 'approved') && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white gap-4">
                                        <Loader2 className="w-10 h-10 text-[#f47c20] animate-spin" />
                                        <p className="text-xs font-black tracking-[0.2em] uppercase">
                                            {status === 'approved' ? 'Waiting for Guard' : 'Verifying Gate...'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <p className="text-xs font-bold text-gray-400 mb-4 tracking-wide uppercase">
                                {status === 'approved' ? "Please wait for the guard's monitor to update" : "Aim scanner at the gate QR code"}
                            </p>

                            <div className="flex items-center justify-between w-full px-4 text-[#f47c20]">
                                <button
                                    onClick={() => {
                                        // Update log to cancelled if it exists
                                        if (currentLogId) {
                                            supabase.from('movement_logs')
                                                .update({ status: 'Cancelled' })
                                                .eq('id', currentLogId)
                                                .then();
                                        }
                                        setStatus('idle');
                                    }}
                                    className="px-6 py-2.5 bg-white/5 text-gray-400 font-bold rounded-xl active:scale-95 transition-all text-[10px] tracking-[0.1em] uppercase border border-white/5"
                                >
                                    Cancel
                                </button>
                                <div className="flex items-center gap-2 font-black text-xl">
                                    <Clock className="w-5 h-5" />
                                    00:{timeLeft.toString().padStart(2, '0')}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .font-sans { font-family: 'Outfit', 'Inter', sans-serif; }
                @keyframes scan {
                    0%, 100% { top: 10%; opacity: 0.1; }
                    50% { top: 90%; opacity: 0.8; }
                }
            ` }} />
        </div>
    );
};

export default ScanScreen;
