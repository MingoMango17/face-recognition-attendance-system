import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../hooks/auth";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { userData } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!userData) {
            navigate("/", { replace: true });
        }
    }, [userData, navigate]);

    if (!userData) {
        return <div>Redirecting...</div>; // Or a loading spinner
    }

    return <>{children}</>;
};

export default ProtectedRoute;
