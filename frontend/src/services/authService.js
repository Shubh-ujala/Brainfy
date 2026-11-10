import axiosInstance from './axiosInstance';

const authService = {
  /**
   * Register a new user
   * @param {{ fullName: string, name?: string, email: string, password: string }} data
   */
  register: (data) =>
    axiosInstance.post('/auth/register', {
      ...data,
      name: data.name || data.fullName,
      fullName: data.fullName || data.name,
    }),

  /**
   * Login with email and password
   * @param {{ email: string, password: string }} data
   */
  login: (data) => axiosInstance.post('/auth/login', data),

  /**
   * Logout the current user
   */
  logout: () => axiosInstance.post('/auth/logout'),

  /**
   * Send forgot-password email
   * @param {{ email: string }} data
   */
  forgotPassword: (data) => axiosInstance.post('/auth/forgot-password', data),

  /**
   * Reset password with token
   * @param {{ token: string, password: string }} data
   */
  resetPassword: (data) => axiosInstance.post('/auth/reset-password', data),

  /**
   * Get current authenticated user profile
   */
  getMe: () => axiosInstance.get('/auth/me'),
};

export default authService;

