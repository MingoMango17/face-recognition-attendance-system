import React, {
  createContext,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { api, apiLogin, apiLogout, verify } from "../utils/api";

interface UserData {
  username?: string;
  name?: string;
  role?: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface AuthContextType {
  userData: UserData | null;
  login: (data: LoginData) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState<UserData | null>(null);

  const verifyToken = async () => {
    const response = await verify();
    if (response) {
      setUserData({
        username: response.username,
        name: response.full_name,
        role: response.role,
      });
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const login = async ({ username, password }: LoginData) => {
    const response = await apiLogin(username, password);

    setUserData({
      username: response.username,
      name: response.full_name,
      role: response.role
    })
  };

  const logout = async () => {
    // console.log("logout here");
    await apiLogout();
  };

  const contextValue: AuthContextType = {
    userData,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthContext, AuthProvider, useAuth };
export default AuthProvider;
