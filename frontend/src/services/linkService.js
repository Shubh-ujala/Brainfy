import axiosInstance from './axiosInstance';

const linkService = {
  /** Get all links with optional filters */
  getLinks: (params = {}) => axiosInstance.get('/links', { params }),

  /** Get a single link by ID */
  getLink: (id) => axiosInstance.get(`/links/${id}`),

  /** Create a new link */
  createLink: (data) => axiosInstance.post('/links', data),

  /** Update an existing link */
  updateLink: (id, data) => axiosInstance.put(`/links/${id}`, data),

  /** Soft-delete a link (move to trash) */
  deleteLink: (id) => axiosInstance.delete(`/links/${id}`),

  /** Restore a link from trash */
  restoreLink: (id) => axiosInstance.patch(`/links/${id}/restore`),

  /** Permanently delete a link */
  permanentDelete: (id) => axiosInstance.delete(`/links/${id}/permanent`),

  /** Toggle favorite status */
  toggleFavorite: (id) => axiosInstance.patch(`/links/${id}/favorite`),

  /** Get trashed links */
  getTrashed: () => axiosInstance.get('/links/trash'),

  /** Get favorite links */
  getFavorites: () => axiosInstance.get('/links/favorites'),

  /** Get recently added links */
  getRecent: (limit = 10) => axiosInstance.get('/links/recent', { params: { limit } }),
};

export default linkService;

