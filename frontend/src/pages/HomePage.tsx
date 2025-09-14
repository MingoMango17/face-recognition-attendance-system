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

  useEffect(() => {
    if (userData) navigate("/dashboard");
  }, [userData]);

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
          {/* Camera Section */}
          <FaceRecognitionCamera />
          
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