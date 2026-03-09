import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, XCircle, Loader2, Camera, CameraOff } from 'lucide-react';

const ScanScreen = ({ studentData }) => {
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const [message, setMessage] = useState('Align the QR code within the frame to verify');
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const scanIntervalRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play();
                    setCameraReady(true);
                    startScanning();
                };
            }
        } catch (err) {
            console.error('Camera error:', err);
            setCameraError(err.message || 'Unable to access the camera.');
        }
    };

    const stopCamera = () => {
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const startScanning = () => {
        // Use BarcodeDetector if available (Chrome, Edge)
        if ('BarcodeDetector' in window) {
            const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
            scanIntervalRef.current = setInterval(async () => {
                if (!videoRef.current || status !== 'idle') return;
                try {
                    const barcodes = await detector.detect(videoRef.current);
                    if (barcodes.length > 0) {
                        handleScanResult(barcodes[0].rawValue);
                    }
                } catch (e) {
                    // Ignore detect errors
                }
            }, 500);
        } else {
            // Fallback: use canvas + jsQR approach (import dynamically)
            setMessage('Point camera at a QR code to scan');
        }
    };

    const handleScanResult = async (rawValue) => {
        if (status !== 'idle' || !rawValue) return;

        setStatus('processing');
        setMessage('Verifying...');

        try {
            let gateId = rawValue;
            let movementType = 'AUTHORIZED';

            try {
                const parsed = JSON.parse(rawValue);
                if (parsed.gate_id) gateId = parsed.gate_id;
                if (parsed.action) movementType = parsed.action;
            } catch (e) {
                // Not JSON, use raw value as gateId
            }

            const { error } = await supabase.from('movement_logs').insert([{
                student_id: studentData?.student_id,
                guard_gate_id: gateId,
                movement_type: movementType,
                status: 'Success'
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
            setMessage('Verification failed. Try again.');
            setTimeout(() => {
                setStatus('idle');
                setMessage('Align the QR code within the frame to verify');
            }, 3000);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-black">

            {/* Camera Feed - Full Background */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a2f4c]/70 via-transparent to-[#1e1b4b]/70 pointer-events-none" />

            {/* Camera Error State */}
            {cameraError && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a2f4c] to-[#1e1b4b] flex flex-col items-center justify-center z-20 px-8">
                    <CameraOff className="w-16 h-16 text-red-400 mb-4" />
                    <p className="text-white font-bold text-lg mb-2 text-center">Camera Access Required</p>
                    <p className="text-gray-300 text-sm text-center max-w-xs">{cameraError}</p>
                    <button
                        onClick={() => { setCameraError(null); startCamera(); }}
                        className="mt-6 px-6 py-3 bg-green-500 text-white font-bold rounded-full text-sm active:scale-95 transition-all"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Camera Loading State */}
            {!cameraReady && !cameraError && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a2f4c] to-[#1e1b4b] flex flex-col items-center justify-center z-20">
                    <Camera className="w-12 h-12 text-green-400 mb-4 animate-pulse" />
                    <p className="text-gray-300 text-sm font-medium">Starting camera...</p>
                </div>
            )}

            {/* Scanning Area Overlay */}
            <div className="relative w-64 h-64 flex items-center justify-center z-10 pointer-events-none">
                {/* Corner Brackets */}
                <div className={`absolute top-0 left-0 w-10 h-10 border-t-[3px] border-l-[3px] rounded-tl-xl transition-colors duration-300 ${status === 'success' ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]' :
                        status === 'error' ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]' :
                            'border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.4)]'
                    }`} />
                <div className={`absolute top-0 right-0 w-10 h-10 border-t-[3px] border-r-[3px] rounded-tr-xl transition-colors duration-300 ${status === 'success' ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]' :
                        status === 'error' ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]' :
                            'border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.4)]'
                    }`} />
                <div className={`absolute bottom-0 left-0 w-10 h-10 border-b-[3px] border-l-[3px] rounded-bl-xl transition-colors duration-300 ${status === 'success' ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]' :
                        status === 'error' ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]' :
                            'border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.4)]'
                    }`} />
                <div className={`absolute bottom-0 right-0 w-10 h-10 border-b-[3px] border-r-[3px] rounded-br-xl transition-colors duration-300 ${status === 'success' ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]' :
                        status === 'error' ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]' :
                            'border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.4)]'
                    }`} />

                {/* Animated Scan Line */}
                {status === 'idle' && (
                    <div className="absolute left-4 right-4 h-0.5 bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-[scan_2.5s_ease-in-out_infinite]" />
                )}

                {/* Status Icons */}
                {status === 'processing' && <Loader2 className="w-16 h-16 text-green-400 animate-spin" />}
                {status === 'success' && <CheckCircle2 className="w-16 h-16 text-green-400" />}
                {status === 'error' && <XCircle className="w-16 h-16 text-red-500" />}
            </div>

            {/* Instruction Text */}
            <div className="absolute bottom-24 w-full px-6 z-10">
                <div className={`backdrop-blur-md rounded-full py-3 px-4 text-center border transition-colors duration-300 ${status === 'success' ? 'bg-green-500/20 border-green-500/30' :
                        status === 'error' ? 'bg-red-500/20 border-red-500/30' :
                            'bg-black/40 border-white/10'
                    }`}>
                    <p className={`text-xs font-medium tracking-wide ${status === 'success' ? 'text-green-300' :
                            status === 'error' ? 'text-red-300' :
                                'text-gray-200'
                        }`}>
                        {message}
                    </p>
                </div>
            </div>

            {/* Scan Animation Keyframes */}
            <style>{`
                @keyframes scan {
                    0% { top: 5%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 95%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default ScanScreen;
