import axiosInstance from './axiosInstance';

const collectionService = {
  /** Get all collections */
  getCollections: () => axiosInstance.get('/collections'),

  /** Get a single collection */
  getCollection: (id) => axiosInstance.get(`/collections/${id}`),

  /** Get links in a collection */
  getCollectionLinks: (id, params = {}) =>
    axiosInstance.get(`/collections/${id}/links`, { params }),

  /** Create a collection */
  createCollection: (data) => axiosInstance.post('/collections', data),

  /** Update a collection */
  updateCollection: (id, data) => axiosInstance.put(`/collections/${id}`, data),

  /** Delete a collection */
  deleteCollection: (id) => axiosInstance.delete(`/collections/${id}`),
};

export default collectionService;

