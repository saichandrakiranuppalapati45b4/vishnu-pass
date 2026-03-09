import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const ScanScreen = ({ studentData }) => {
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const [message, setMessage] = useState('Align the QR code within the frame to verify');

    const handleScan = async (detectedCodes) => {
        if (status !== 'idle' || !detectedCodes || detectedCodes.length === 0) return;

        const rawValue = detectedCodes[0].rawValue;
        if (!rawValue) return;

        setStatus('processing');
        setMessage('Verifying pass...');

        try {
            // Assume the QR value is the Guard Gate ID or JSON payload.
            let gateId = rawValue;
            let movementType = 'AUTHORIZED';

            // Try to parse JSON in case it's a structured payload
            try {
                const parsed = JSON.parse(rawValue);
                if (parsed.gate_id) gateId = parsed.gate_id;
                if (parsed.action) movementType = parsed.action;
            } catch (e) {
                // Not JSON, use raw value as gateId
            }

            // Record movement log in Supabase
            const { error } = await supabase.from('movement_logs').insert([{
                student_id: studentData.student_id,
                guard_gate_id: gateId,
                movement_type: movementType,
                status: 'Success' // Using 'Success' as required by existing schema
            }]);

            if (error) throw error;

            setStatus('success');
            setMessage('Pass verified successfully!');
            setTimeout(() => {
                setStatus('idle');
                setMessage('Align the QR code within the frame to verify');
            }, 3000);

        } catch (error) {
            console.error('Scan error:', error);
            setStatus('error');
            setMessage('Failed to verify pass. Please try again.');
            setTimeout(() => {
                setStatus('idle');
                setMessage('Align the QR code within the frame to verify');
            }, 3000);
        }
    };

    return (
        <div className="flex-1 bg-gradient-to-br from-[#1a2f4c] to-[#1e1b4b] flex flex-col items-center justify-center relative overflow-hidden font-sans">

            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-32 translate-x-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-32 -translate-x-32 pointer-events-none" />

            {/* Scanner Container */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-50 mix-blend-screen px-4">
                <Scanner
                    onScan={handleScan}
                    components={{
                        audio: false,
                        onOff: false,
                        torch: false,
                        zoom: false,
                        finder: false // We use our own glowing brackets
                    }}
                    styles={{
                        container: { width: '100%', height: '100%', objectFit: 'cover' },
                        video: { width: '100%', height: '100%', objectFit: 'cover' }
                    }}
                />
            </div>

            {/* Scanning Area Overlay */}
            <div className="relative w-64 h-64 flex items-center justify-center z-10 pointer-events-none">
                {/* Corner Brackets */}
                <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg transition-colors duration-300 ${status === 'success' ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]' : status === 'error' ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]'}`}></div>
                <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg transition-colors duration-300 ${status === 'success' ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]' : status === 'error' ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]'}`}></div>
                <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg transition-colors duration-300 ${status === 'success' ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]' : status === 'error' ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]'}`}></div>
                <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-lg transition-colors duration-300 ${status === 'success' ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]' : status === 'error' ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]'}`}></div>

                {/* Animated Scan Line */}
                {status === 'idle' && (
                    <div className="absolute top-0 left-4 right-4 h-0.5 bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-[scan_3s_ease-in-out_infinite]"></div>
                )}

                {/* Status Icons */}
                {status === 'processing' && <Loader2 className="w-16 h-16 text-green-400 animate-spin" />}
                {status === 'success' && <CheckCircle2 className="w-16 h-16 text-green-400 animate-in zoom-in-50 duration-300" />}
                {status === 'error' && <XCircle className="w-16 h-16 text-red-500 animate-in zoom-in-50 duration-300" />}
            </div>

            {/* Instruction Text */}
            <div className="absolute bottom-24 w-full px-6 z-10 transition-all duration-300">
                <div className={`backdrop-blur-md rounded-full py-3 px-4 text-center border transition-colors duration-300 ${status === 'success' ? 'bg-green-500/20 border-green-500/50' :
                        status === 'error' ? 'bg-red-500/20 border-red-500/50' :
                            'bg-black/40 border-white/5'
                    }`}>
                    <p className={`text-xs font-medium tracking-wide transition-colors duration-300 ${status === 'success' ? 'text-green-300' :
                            status === 'error' ? 'text-red-300' :
                                'text-gray-200'
                        }`}>
                        {message}
                    </p>
                </div>
            </div>

            {/* Temporary inline style for the scan animation since it's highly specific to this component */}
            <style jsx>{`
                @keyframes scan {
                    0% {
                        top: 5%;
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        top: 95%;
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default ScanScreen;
