import React, { useState, useRef, useEffect } from "react";
import { Camera, Clock, CheckCircle, AlertCircle } from "lucide-react";

// Type definitions
interface AttendanceStatus {
    type: "success" | "error";
    message: string;
}

interface AttendanceRequest {
    image: string;
    timestamp: string;
}

interface AttendanceResponse {
    data: {
        success: boolean;
        message: string;
        employeeId?: string;
        employeeName?: string;
    };
}

interface FaceRecognitionCameraProps {
    className?: string;
}

const FaceRecognitionCamera: React.FC<FaceRecognitionCameraProps> = ({
    className = "",
}) => {
    // State
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [attendanceStatus, setAttendanceStatus] =
        useState<AttendanceStatus | null>(null);

    // Refs
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async (): Promise<void> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setAttendanceStatus({
                type: "error",
                message: "Camera access denied",
            });
        }
    };

    const stopCamera = (): void => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            const tracks = stream.getTracks();
            tracks.forEach((track: MediaStreamTrack) => track.stop());
            setIsStreaming(false);
        }
    };

    const captureImage = (): string | null => {
        if (!videoRef.current || !canvasRef.current) return null;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext("2d");

        if (!context) return null;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageData);
        return imageData;
    };

    const handleMarkAttendance = async (): Promise<void> => {
        setIsProcessing(true);
        setAttendanceStatus(null);

        try {
            // Capture image
            const imageData = captureImage();

            if (!imageData) {
                throw new Error("Failed to capture image");
            }

            // Simulate processing time
            await new Promise<void>((resolve) => setTimeout(resolve, 2000));

            // Prepare request payload
            const requestPayload: AttendanceRequest = {
                image: imageData,
                timestamp: new Date().toISOString(),
            };

            // Send to backend for facial recognition
            const response = await fetch(
                "http://127.0.0.1:8000/api/face/recognize/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestPayload),
                }
            );

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const result: AttendanceResponse = await response.json();

            if (result.data.message === "no similar face found") {
                setAttendanceStatus({
                    type: "error",
                    message:
                        "Face not recognized. Please try again or contact admin.",
                });
            } else {
                // For demo purposes, simulate success
                setAttendanceStatus({
                    type: "success",
                    message: "Attendance marked successfully! Welcome to work.",
                });
            }
        } catch (error) {
            console.log("Attendance marking error: ", error);
            setAttendanceStatus({
                type: "error",
                message:
                    "Unable to detect a face. Please move to a well-lit area and ensure only one person is visible in the camera frame",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
            <div className="flex items-center space-x-2 mb-4">
                <Camera className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-medium text-gray-900">Camera</h2>
            </div>

            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video mb-6">
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
                            <p>Camera not available</p>
                        </div>
                    </div>
                )}

                {/* Overlay for face detection area */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-purple-400 border-dashed rounded-lg w-64 h-48 flex items-center justify-center"></div>
                </div>
            </div>

            {/* Mark Attendance Button */}
            <button
                onClick={handleMarkAttendance}
                disabled={isProcessing || !isStreaming}
                className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-3 text-lg font-medium"
                type="button"
            >
                {isProcessing ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                    </>
                ) : (
                    <>
                        <Clock className="w-5 h-5" />
                        <span>Mark Attendance</span>
                    </>
                )}
            </button>

            {/* Status Messages */}
            {attendanceStatus && (
                <div
                    className={`mt-4 p-4 rounded-lg flex items-center space-x-3 ${
                        attendanceStatus.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                >
                    {attendanceStatus.type === "success" ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium">
                        {attendanceStatus.message}
                    </span>
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default FaceRecognitionCamera;