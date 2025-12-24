import apiService from "./api.service";

class AuthService {
  async login(credentials) {
    const response = await apiService.post("/auth/login", credentials);
    if (response.token) {
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }
    return response;
  }

  async register(userData) {
    return await apiService.post("/auth/register", userData);
  }

  async logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    return true;
  }

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem("authToken");
  }

  getToken() {
    return localStorage.getItem("authToken");
  }

  async forgotPassword(email) {
    return await apiService.post("/auth/forgot-password", { email });
  }

  async resetPassword(token, newPassword) {
    return await apiService.post("/auth/reset-password", {
      token,
      newPassword,
    });
  }
}

export default new AuthService();
