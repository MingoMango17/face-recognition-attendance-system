import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
} from "lucide-react";

// Type definitions
interface AttendanceStatus {
  type: "success" | "error";
  message: string;
}

interface AdminCredentials {
  username: string;
  password: string;
}

interface AttendanceRequest {
  image: string;
  timestamp: string;
}

interface AttendanceResponse {
  success: boolean;
  message: string;
  employeeId?: string;
  employeeName?: string;
}

interface TodaysSummary {
  checkIn: string | null;
  checkOut: string | null;
  totalTime: string;
  status: "On Time" | "Late" | "Early" | "--";
}

// Component props type (if this component receives props)
interface FacialRecognitionAttendanceProps {
  // Add any props here if needed in the future
  className?: string;
}

const FacialRecognitionAttendance: React.FC<
  FacialRecognitionAttendanceProps
> = ({ className = "" }) => {
  // State with proper types
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [attendanceStatus, setAttendanceStatus] =
    useState<AttendanceStatus | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>({
    username: "",
    password: "",
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Refs with proper types
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

      // For demo purposes, simulate success
      setAttendanceStatus({
        type: "success",
        message: "Attendance marked successfully! Welcome to work.",
      });

      //   setAttendanceStatus({
      //     type: 'success',
      //     message: result.message || 'Attendance marked successfully! Welcome to work.'
      //   });
    } catch (error) {
      //   console.error('Attendance marking error:', error);
      console.log("Attendance marking error: ", error);
      setAttendanceStatus({
        type: "error",
        message: "Face not recognized. Please try again or contact admin.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdminLogin = async (): Promise<void> => {
    const { username, password } = adminCredentials;

    if (!username || !password) {
      return;
    }

    try {
      // Simulate admin authentication
      if (username === "admin" && password === "admin123") {
        setIsAdmin(true);
        setShowAdminLogin(false);
        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        alert("Invalid admin credentials");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      alert("Login failed. Please try again.");
    }
  };

  const handleCredentialChange =
    (field: keyof AdminCredentials) =>
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setAdminCredentials((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleAdminLogin();
    }
  };

  const getCurrentTime = (): string => {
    return new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCurrentDate = (): string => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Mock data for today's summary - in real app, this would come from props or API
  const todaysSummary: TodaysSummary = {
    checkIn: "08:00",
    checkOut: null,
    totalTime: "8h 0m",
    status: "On Time",
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                BiPay Attendance
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {getCurrentTime()}
                </div>
                <div className="text-xs text-gray-500">{getCurrentDate()}</div>
              </div>
              <button
                onClick={() => setShowAdminLogin(!showAdminLogin)}
                className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                title="Admin Login"
                type="button"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
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
                <div className="border-2 border-purple-400 border-dashed rounded-lg w-64 h-48 flex items-center justify-center">
                  {/* <span className="text-purple-400 text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                    Align face here
                  </span> */}
                </div>
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

          {/* Admin Login Section or Instructions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {showAdminLogin ? (
              <>
                <div className="flex items-center space-x-2 mb-6">
                  <User className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Admin Login
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={adminCredentials.username}
                      onChange={handleCredentialChange("username")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter admin username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={adminCredentials.password}
                      onChange={handleCredentialChange("password")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter admin password"
                      onKeyPress={handleKeyPress}
                    />
                  </div>

                  <button
                    onClick={handleAdminLogin}
                    className="w-full bg-gray-800 text-white py-3 px-4 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                    type="button"
                  >
                    Access Dashboard
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2 mb-6">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-medium text-gray-900">
                    How to Mark Attendance
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-sm font-medium">
                        1
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Position your face
                      </h3>
                      <p className="text-sm text-gray-600">
                        Align your face within the dotted rectangle on the
                        camera feed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-sm font-medium">
                        2
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Click Mark Attendance
                      </h3>
                      <p className="text-sm text-gray-600">
                        Press the button to capture your photo and record
                        attendance
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-sm font-medium">
                        3
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Wait for confirmation
                      </h3>
                      <p className="text-sm text-gray-600">
                        The system will process your image and confirm
                        attendance
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-900">
                          Tips for best results:
                        </h4>
                        <ul className="text-sm text-blue-800 mt-1 space-y-1">
                          <li>• Ensure good lighting on your face</li>
                          <li>• Look directly at the camera</li>
                          <li>• Remove sunglasses or hats if possible</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Today's Summary */}
        {/* <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Today's Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {todaysSummary.checkIn || "--:--"}
              </div>
              <div className="text-sm text-blue-600">Check In</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {todaysSummary.checkOut || "--:--"}
              </div>
              <div className="text-sm text-purple-600">Check Out</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {todaysSummary.totalTime}
              </div>
              <div className="text-sm text-green-600">Total Time</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {todaysSummary.status}
              </div>
              <div className="text-sm text-orange-600">Status</div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default FacialRecognitionAttendance;
