import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, force logout
      await forceLogout();
    }
    return Promise.reject(error);
  }
);

const forceLogout = async () => {
  // Clear tokens
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  
  // Redirect to login page
  window.location.href = '/';
};


const apiLogin = async (username: string, password: string) => {
    try {
        const response = await api.post("auth/login/", {
            username: username,
            password: password,
        });

        if (response.data) {
            localStorage.setItem("accessToken", response.data.access);
            localStorage.setItem("refreshToken", response.data.refresh);
            return response.data;
        }
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

const apiLogout = async () => {
    try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
            await api.post("auth/logout/", {
                refresh: refreshToken,
            });
        }
    } catch (error) {
        console.error("Logout request failed:", error);
    } finally {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    }
};

const verify = async () => {
    if (localStorage.getItem("accessToken")) {
        try {
            // Token will be automatically added by interceptor
            const response = await api.get("auth/verify/");
            return response.data;
        } catch (error) {
            console.error("Token verification failed:", error);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            throw error;
        }
    }
};

export { apiLogin, apiLogout, verify, api };
