import React, { useState } from "react";
import { User, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/auth";
import { useNavigate } from "react-router-dom";

// Type definitions
interface AdminCredentials {
    username: string;
    password: string;
}

interface AdminLoginSectionProps {
    showAdminLogin: boolean;
    className?: string;
    onLoginSuccess?: () => void;
}

const LoginComponent: React.FC<AdminLoginSectionProps> = ({
    showAdminLogin,
    className = "",
    onLoginSuccess,
}) => {
    const { login } = useAuth();
    const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>({
        username: "",
        password: "",
    });

    const navigate = useNavigate();

    const handleAdminLogin = async (): Promise<void> => {
        const { username, password } = adminCredentials;

        if (!username || !password) {
            return;
        }

        try {
            // Simulate admin authentication
            const request = await login({username, password})
            navigate("/dashboard")
            // window.location.href = "/dashboard";
            // if (username === "admin" && password === "admin123") {
            //     if (onLoginSuccess) {
            //         onLoginSuccess();
            //     }
            //     // Redirect to dashboard
            //     window.location.href = "/dashboard";
            // } else {
            //     alert("Invalid admin credentials");
            // }
        } catch (error) {
            console.error("Admin login error:", error);
            alert("Login failed. Please try again.");
        }
    };

    const handleCredentialChange =
        (field: keyof AdminCredentials) =>
        (e: React.ChangeEvent<HTMLInputElement>): void => {
            setAdminCredentials((prev) => ({
                ...prev,
                [field]: e.target.value,
            }));
        };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter") {
            handleAdminLogin();
        }
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm border p-6 text-black ${className}`}>
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
                                    Align your face within the dotted rectangle
                                    on the camera feed
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
                                    Press the button to capture your photo and
                                    record attendance
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
                                    The system will process your image and
                                    confirm attendance
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
                                        <li>
                                            • Remove sunglasses or hats if
                                            possible
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LoginComponent;