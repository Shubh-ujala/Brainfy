import axiosInstance from './axiosInstance';

const userService = {
  /** Get current user profile */
  getProfile: () => axiosInstance.get('/users/profile'),

  /** Update profile (name) */
  updateProfile: (data) => axiosInstance.put('/users/profile', data),

  /** Change password */
  changePassword: (data) => axiosInstance.put('/users/password', data),

  /** Delete account */
  deleteAccount: () => axiosInstance.delete('/users/account'),
};

export default userService;

