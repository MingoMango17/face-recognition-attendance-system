import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Camera, Eye, EyeOff } from "lucide-react";
import { useEmployeeModal } from "./Modal/useEmployeeModal";
import BasicInfoSection from "./Modal/BasicInfoSection";
import DeductionsSection from "./Modal/DeductionsSection";
import AllowancesSection from "./Modal/AllowancesSection";

interface EmployeeFormData {
    first_name: string;
    last_name: string;
    username: string;
    department?: string;
    password: string;
    salary: string;
    salary_type: "hourly" | "monthly";
    deductions: Array<{ type: number; amount: string }>;
    allowances: Array<{ type: number; amount: string; taxable: boolean }>;
    photo?: string; // Add photo field
}

interface Employee {
    id: number;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        email?: string;
        username: string;
    };
    salary_type: 1 | 2; // 1 = HOURLY, 2 = MONTHLY
    hire_date: string;
    base_salary: string;
    department: string;
    details: string;
    is_active: boolean;
    photo?: string; // Add photo field
}

interface EmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: EmployeeFormData) => void;
    employee?: Employee | null; // Optional employee for editing
    mode: "add" | "edit";
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    employee,
    mode,
}) => {
    const {
        formData,
        loading,
        handleChange,
        resetFormData,
        addDeduction,
        updateDeduction,
        removeDeduction,
        addAllowance,
        updateAllowance,
        removeAllowance,
    } = useEmployeeModal({ mode, employee, isOpen });

    // Camera states
    const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [showCameraSection, setShowCameraSection] = useState<boolean>(false);

    // Refs for camera
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mountedRef = useRef<boolean>(true);

    // Constants
    const departments = ["Engineering", "Marketing", "HR", "Finance", "Sales"];
    const deductionTypes = [
        "Loan",
        "Health Insurance",
        "Social Security",
        "Other",
    ];
    const allowanceTypes = ["Meal", "Transportation", "Medical", "Bonus"];

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
        if (!mountedRef.current || !isOpen) return;

        try {
            stopCamera();

            console.log("Starting camera inside modal...");

            // Check if getUserMedia is available
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                alert("Camera API not supported in this browser");
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: "user",
                },
            });

            streamRef.current = stream;

            // Wait for video element to be available
            let attempts = 0;
            const maxAttempts = 10;

            const attachStream = () => {
                if (videoRef.current && mountedRef.current && isOpen) {
                    videoRef.current.srcObject = stream;
                    setIsStreaming(true);
                    console.log("Camera started successfully in modal");
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(attachStream, 100);
                } else {
                    console.error("Could not attach stream to video element");
                    stream.getTracks().forEach((track) => track.stop());
                    alert("Failed to initialize camera. Please try again.");
                }
            };

            attachStream();
        } catch (err) {
            console.error("Error accessing camera:", err);
            const errorMessage =
                err instanceof Error ? err.message : "Unknown camera error";
            alert(
                `Camera access denied or error occurred: ${errorMessage}. Please check permissions and try again.`
            );
        }
    }, [stopCamera, isOpen]);

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

    const handleCapturePhoto = () => {
        const imageData = captureImage();
        if (imageData) {
            // Update form data with captured photo
            handleChange("photo", imageData);
            setShowCameraSection(false);
            stopCamera();
        }
    };

    const handleToggleCamera = async () => {
        if (showCameraSection) {
            setShowCameraSection(false);
            stopCamera();
        } else {
            setShowCameraSection(true);
            // Add a small delay to ensure the video element is rendered
            setTimeout(() => {
                startCamera();
            }, 100);
        }
    };

    const handleRemovePhoto = () => {
        setCapturedImage(null);
        handleChange("photo", "");
    };

    // Cleanup camera when modal closes
    useEffect(() => {
        if (!isOpen) {
            stopCamera();
            setShowCameraSection(false);
            setCapturedImage(null);
        } else {
            // Reset mounted ref when modal opens
            mountedRef.current = true;
        }
        return () => {
            mountedRef.current = false;
            stopCamera();
        };
    }, [isOpen, stopCamera]);

    // Set captured image from form data if editing
    useEffect(() => {
        if (mode === "edit" && employee?.photo) {
            setCapturedImage(employee.photo);
        }
    }, [mode, employee]);

    const handleSubmit = () => {
        const submitData = { ...formData };
        if (capturedImage) {
            submitData.photo = capturedImage;
        }

        onSubmit(submitData);
        if (mode === "add") {
            resetFormData();
            setCapturedImage(null);
        }
        onClose();
    };

    if (!isOpen) return null;

    const modalTitle = mode === "add" ? "Add New Employee" : "Edit Employee";
    const submitButtonText =
        mode === "add" ? "Add Employee" : "Update Employee";

    return (
        <div className="text-black fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">{modalTitle}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {loading && (
                        <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">
                                Loading employee data...
                            </span>
                        </div>
                    )}

                    {/* Photo Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Employee Photo
                        </label>

                        {/* Current Photo Display */}
                        {capturedImage && (
                            <div className="mb-4">
                                <div className="relative inline-block">
                                    <img
                                        src={capturedImage}
                                        alt="Employee"
                                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                        disabled={loading}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Camera Controls */}
                        <div className="flex space-x-3 mb-4">
                            <button
                                type="button"
                                onClick={handleToggleCamera}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                disabled={loading}
                            >
                                <Camera className="w-4 h-4" />
                                <span>
                                    {showCameraSection
                                        ? "Close Camera"
                                        : "Take Photo"}
                                </span>
                            </button>
                        </div>

                        {/* Camera Section */}
                        {showCameraSection && (
                            <div className="border rounded-lg p-4 bg-gray-50">

                                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video mb-4">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                        onLoadedMetadata={() =>
                                            console.log("Video metadata loaded")
                                        }
                                        onCanPlay={() =>
                                            console.log("Video can play")
                                        }
                                        onError={(e) =>
                                            console.error("Video error:", e)
                                        }
                                    />
                                    {!isStreaming && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-white text-center">
                                                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                <p>Camera not available</p>
                                                <p className="text-sm mt-1">
                                                    Check console for errors
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Overlay for face positioning */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="border-2 border-blue-400 border-dashed rounded-lg w-48 h-48 flex items-center justify-center">
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={handleCapturePhoto}
                                        disabled={!isStreaming || loading}
                                        className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
                                    >
                                        <Camera className="w-5 h-5" />
                                        <span>Capture Photo</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => startCamera()}
                                        disabled={loading}
                                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Basic Info Section */}
                    <BasicInfoSection
                        formData={formData}
                        departments={departments}
                        mode={mode}
                        loading={loading}
                        onChange={handleChange}
                    />

                    {/* Deductions Section */}
                    <DeductionsSection
                        deductions={formData.deductions}
                        deductionTypes={deductionTypes}
                        loading={loading}
                        onAdd={addDeduction}
                        onUpdate={updateDeduction}
                        onRemove={removeDeduction}
                    />

                    {/* Allowances Section */}
                    <AllowancesSection
                        allowances={formData.allowances}
                        allowanceTypes={allowanceTypes}
                        loading={loading}
                        onAdd={addAllowance}
                        onUpdate={updateAllowance}
                        onRemove={removeAllowance}
                    />

                    {/* Footer */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Loading..." : submitButtonText}
                        </button>
                    </div>
                </div>

                {/* Hidden canvas for image capture */}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
};

export default EmployeeModal;
