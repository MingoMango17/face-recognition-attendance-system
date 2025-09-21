import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    Camera,
    Clock,
    CheckCircle,
    AlertCircle,
    Lock,
    Eye,
    EyeOff,
} from "lucide-react";
import { api } from "../utils/api";

// Type definitions
interface AttendanceStatus {
    type: "success" | "error";
    message: string;
}

interface AttendanceRequest {
    image: string;
    timestamp: string;
    password: string;
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

    // Password states
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState<string>("");

    // Refs
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mountedRef = useRef<boolean>(true);

    // Comprehensive camera cleanup function
    const stopCamera = useCallback((): void => {
        console.log("Stopping camera...");

        try {
            if (streamRef.current) {
                streamRef.current
                    .getTracks()
                    .forEach((track: MediaStreamTrack) => {
                        track.stop();
                        console.log(`Stopped ${track.kind} track`);
                    });
                streamRef.current = null;
            }

            if (videoRef.current && videoRef.current.srcObject) {
                const videoStream = videoRef.current.srcObject as MediaStream;
                videoStream.getTracks().forEach((track: MediaStreamTrack) => {
                    track.stop();
                });
                videoRef.current.srcObject = null;
            }

            if (mountedRef.current) {
                setIsStreaming(false);
            }
        } catch (error) {
            console.error("Error stopping camera:", error);
        }
    }, []);

    const startCamera = useCallback(async (): Promise<void> => {
        if (!mountedRef.current) return;

        try {
            stopCamera();

            console.log("Starting camera...");
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: "user",
                },
            });

            streamRef.current = stream;

            if (videoRef.current && mountedRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
                console.log("Camera started successfully");
            } else {
                stream.getTracks().forEach((track) => track.stop());
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            if (mountedRef.current) {
                setAttendanceStatus({
                    type: "error",
                    message:
                        "Camera access denied. Please allow camera permissions and refresh the page.",
                });
            }
        }
    }, [stopCamera]);

    useEffect(() => {
        mountedRef.current = true;
        startCamera();

        return () => {
            console.log("Component unmounting, cleaning up camera...");
            mountedRef.current = false;
            stopCamera();
        };
    }, [startCamera, stopCamera]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                console.log("Page hidden, stopping camera");
                stopCamera();
            } else if (mountedRef.current) {
                console.log("Page visible, restarting camera");
                startCamera();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [startCamera, stopCamera]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            console.log("Page unloading, stopping camera");
            stopCamera();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [stopCamera]);

    const captureImage = useCallback((): string | null => {
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
    }, []);

    // Validate password
    const validatePassword = (pwd: string): boolean => {
        // if (pwd.length < 4) {
        //     setPasswordError("Password must be at least 4 characters");
        //     return false;
        // }
        setPasswordError("");
        return true;
    };

    // Clear error when password changes
    useEffect(() => {
        if (passwordError && password.length >= 4) {
            setPasswordError("");
        }
    }, [password, passwordError]);

    // Handle mark attendance
    const handleMarkAttendance = async (): Promise<void> => {
        if (!mountedRef.current) return;

        // Validate password first
        if (!validatePassword(password)) {
            return;
        }

        setIsProcessing(true);
        setAttendanceStatus(null);

        try {
            const imageData = captureImage();

            if (!imageData) {
                throw new Error("Failed to capture image");
            }

            // Simulate processing time
            await new Promise<void>((resolve) => setTimeout(resolve, 2000));

            if (!mountedRef.current) return;

            const requestPayload: AttendanceRequest = {
                image: imageData,
                timestamp: new Date().toISOString(),
                password: password,
            };

            // const response = await fetch(
            //     "http://127.0.0.1:8000/api/face/recognize/",
            //     {
            //         method: "POST",
            //         headers: {
            //             "Content-Type": "application/json",
            //         },
            //         body: JSON.stringify(requestPayload),
            //     }
            // );
            const response = await api.post(
                "payroll/mark-attendance/",
                requestPayload
            );

            // if (!response.ok) {
            //     throw new Error("Network response was not ok");
            // }

            const result: AttendanceResponse = response.data;

            if (!mountedRef.current) return;

            // if (result.data.message === "no similar face found") {
            //     setAttendanceStatus({
            //         type: "error",
            //         message:
            //             "Face not recognized. Please try again or contact admin.",
            //     });
            // } else if (result.data.message === "invalid password") {
            //     setAttendanceStatus({
            //         type: "error",
            //         message: "Invalid password. Please try again.",
            //     });
            //     setPasswordError("Invalid password");
            // } else {
            //     setAttendanceStatus({
            //         type: "success",
            //         message: `Attendance marked successfully! Welcome ${
            //             result.data.employeeName || "to work"
            //         }.`,
            //     });
            //     // Clear password on success
            //     setPassword("");
            // }
            if (response.status === 400) {
                setAttendanceStatus({
                    type: "error",
                    message: result.error,
                });
            } else {
                setAttendanceStatus({
                    type: "success",
                    message: result.message,
                });
            }
        } catch (error) {
            console.log("Attendance marking error: ", error.response.data.error);
            if (mountedRef.current) {
                setAttendanceStatus({
                    type: "error",
                    message: error.response.data.error,
                });
            }
        } finally {
            if (mountedRef.current) {
                setIsProcessing(false);
            }
            setPassword("");
        }
    };

    // Handle Enter key press in password input
    const handlePasswordKeyPress = (
        e: React.KeyboardEvent<HTMLInputElement>
    ): void => {
        if (
            e.key === "Enter" &&
            password.trim() &&
            !isProcessing &&
            isStreaming
        ) {
            handleMarkAttendance();
        }
    };

    return (
        <div
            className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}
        >
            <div className="flex items-center space-x-2 mb-4">
                <Camera className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-medium text-gray-900">
                    Secure Camera Attendance
                </h2>
                <span className="text-xs text-gray-500">
                    {isStreaming ? "🟢 Active" : "🔴 Inactive"}
                </span>
            </div>

            {/* Camera Section */}
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
                    <div className="border-2 border-purple-400 border-dashed rounded-lg w-64 h-48 flex items-center justify-center">
                        {/* <div className="text-purple-400 text-sm font-medium">
                            Position your face here
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Password Input Section */}
            <div className="mb-6">
                <label
                    htmlFor="attendance-password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-gray-500" />
                        <span>Security Password</span>
                    </div>
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="attendance-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handlePasswordKeyPress}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12 text-lg ${
                            passwordError
                                ? "border-red-300 focus:ring-red-500"
                                : "border-gray-300"
                        }`}
                        placeholder="Enter your password"
                        disabled={isProcessing}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isProcessing}
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                </div>
                {passwordError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{passwordError}</span>
                    </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                    Press Enter or click the button below to mark attendance
                </p>
            </div>

            {/* Mark Attendance Button */}
            <button
                onClick={handleMarkAttendance}
                disabled={isProcessing || !isStreaming || !password.trim()}
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
                        <Lock className="w-5 h-5" />
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
