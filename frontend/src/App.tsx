import "./App.css";
import AuthProvider from "./hooks/auth";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import EmployeePage from "./pages/EmployeePage";
import LeavePage from "./pages/LeavePage";
import AttendancePage from "./pages/AttendancePage";
import PayslipPage from "./pages/PayslipPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import { ToastContainer } from "react-toastify";

function App() {
    return (
        <>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<HomePage />} />

                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/employee"
                            element={
                                <ProtectedRoute>
                                    <EmployeePage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/leave"
                            element={
                                <ProtectedRoute>
                                    <LeavePage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/attendance"
                            element={
                                <ProtectedRoute>
                                    <AttendancePage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/payslip"
                            element={
                                <ProtectedRoute>
                                    <PayslipPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/password"
                            element={
                                <ProtectedRoute>
                                    <ChangePasswordPage />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Router>
            </AuthProvider>
            <ToastContainer />
        </>
    );
}

export default App;
