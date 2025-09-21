import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera, X } from "lucide-react";

const SimpleCameraTest = () => {
    // Camera states
    const [isStreaming, setIsStreaming] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [error, setError] = useState("");

    // Refs for camera
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    // Stop camera function
    const stopCamera = useCallback(() => {
        console.log("Stopping camera...");
        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => {
                    track.stop();
                    console.log(`Stopped ${track.kind} track`);
                });
                streamRef.current = null;
            }

            if (videoRef.current && videoRef.current.srcObject) {
                const videoStream = videoRef.current.srcObject;
                videoStream.getTracks().forEach((track) => track.stop());
                videoRef.current.srcObject = null;
            }

            setIsStreaming(false);
            setError("");
        } catch (error) {
            console.error("Error stopping camera:", error);
            setError("Error stopping camera: " + error.message);
        }
    }, []);

    // Start camera function
    const startCamera = useCallback(async () => {
        try {
            setError("");
            console.log("Requesting camera access...");

            // First check if getUserMedia is available
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                throw new Error("Camera API not supported in this browser");
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: "user",
                },
            });

            console.log("Camera access granted");
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
                console.log("Camera started successfully");
            } else {
                stream.getTracks().forEach((track) => track.stop());
                throw new Error("Video element not found");
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError(`Camera error: ${err.message}`);
            setIsStreaming(false);
        }
    }, []);

    // Capture image function
    const captureImage = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) {
            setError("Video or canvas element not found");
            return null;
        }

        try {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const context = canvas.getContext("2d");

            if (!context) {
                setError("Could not get canvas context");
                return null;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0);

            const imageData = canvas.toDataURL("image/jpeg");
            setCapturedImage(imageData);
            console.log("Image captured successfully");
            return imageData;
        } catch (err) {
            console.error("Error capturing image:", err);
            setError("Error capturing image: " + err.message);
            return null;
        }
    }, []);

    // Handle toggle camera
    const handleToggleCamera = () => {
        if (showCamera) {
            setShowCamera(false);
            stopCamera();
        } else {
            setShowCamera(true);
            startCamera();
        }
    };

    // Handle capture photo
    const handleCapturePhoto = () => {
        captureImage();
        setShowCamera(false);
        stopCamera();
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Camera Test Component</h1>

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            {/* Current Photo Display */}
            {capturedImage && (
                <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">
                        Captured Photo:
                    </h3>
                    <div className="relative inline-block">
                        <img
                            src={capturedImage}
                            alt="Captured"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                            onClick={() => setCapturedImage(null)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Camera Controls */}
            <div className="mb-4">
                <button
                    onClick={handleToggleCamera}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Camera className="w-4 h-4" />
                    <span>{showCamera ? "Close Camera" : "Open Camera"}</span>
                </button>
            </div>

            {/* Camera Section */}
            {showCamera && (
                <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="text-lg font-medium mb-4">Camera View</h3>

                    {/* Debug Info */}
                    <div className="mb-4 p-2 bg-blue-50 rounded text-sm">
                        <p>Streaming: {isStreaming ? "✅ Yes" : "❌ No"}</p>
                        <p>
                            Video Element:{" "}
                            {videoRef.current ? "✅ Found" : "❌ Not Found"}
                        </p>
                        <p>
                            Canvas Element:{" "}
                            {canvasRef.current ? "✅ Found" : "❌ Not Found"}
                        </p>
                    </div>

                    <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video mb-4">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />

                        {!isStreaming && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-white text-center">
                                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Camera not active</p>
                                    {error && (
                                        <p className="text-red-400 text-sm mt-2">
                                            {error}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Face positioning overlay */}
                        {isStreaming && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="border-2 border-blue-400 border-dashed rounded-lg w-48 h-48 flex items-center justify-center">
                                    <div className="text-blue-400 text-sm font-medium text-center">
                                        Position face here
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleCapturePhoto}
                        disabled={!isStreaming}
                        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        <Camera className="w-5 h-5" />
                        <span>Capture Photo</span>
                    </button>
                </div>
            )}

            {/* Hidden canvas for image capture */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default SimpleCameraTest;
