import React, { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import FaceRecognitionCamera from "../components/FaceRecognitionCamera";
import LoginComponent from "../components/LoginComponent";
import Layout from "../components/Layout";
import { useAuth } from "../hooks/auth";
import { useNavigate } from "react-router-dom";

interface FacialRecognitionAttendanceProps {
    className?: string;
}

const HomePage: React.FC<FacialRecognitionAttendanceProps> = ({
    className = "",
}) => {
    const { userData } = useAuth();
    const navigate = useNavigate();
    const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
    const [showCamera, setShowCamera] = useState<boolean>(false);

    // Redirect authenticated users to dashboard
    useEffect(() => {
        if (userData) navigate("/dashboard");
    }, [userData]);

    // Add 3-second delay before showing camera to allow auth to complete
    useEffect(() => {
        const timer = setTimeout(() => {
        }, 3000);
        setShowCamera(true);

        return () => clearTimeout(timer);
    }, []);

    const handleAdminLoginSuccess = (): void => {
        setShowAdminLogin(false);
    };

    // Define custom header content for this page
    const headerRightContent = (
        <button
            onClick={() => setShowAdminLogin(!showAdminLogin)}
            className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
            title="Admin Login"
            type="button"
        >
            <Settings className="w-5 h-5" />
        </button>
    );

    return (
        <Layout
            headerTitle="BiPay Attendance"
            headerRightContent={headerRightContent}
            showDateTime={true}
            showSidebar={false} // Hide sidebar on login page
            contentClassName={`min-h-screen bg-gray-50 ${className}`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Camera Section with Delay */}
                    {showCamera ? (
                        <FaceRecognitionCamera />
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-center h-96">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Initializing Camera
                                    </h3>
                                    <p className="text-gray-500">
                                        Please wait while we prepare the
                                        attendance system...
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Admin Login Section or Instructions */}
                    <LoginComponent
                        showAdminLogin={showAdminLogin}
                        onLoginSuccess={handleAdminLoginSuccess}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default HomePage;
