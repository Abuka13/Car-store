import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (email, password) => 
    api.post('/auth/register', { email, password }),
  
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
};

// Cars
export const carsAPI = {
  getAll: () => api.get('/cars'),
  getById: (id) => api.get(`/cars?id=${id}`),
  create: (car) => api.post('/cars', car),
  update: (id, car) => api.put(`/cars?id=${id}`, car),
  delete: (id) => api.delete(`/cars?id=${id}`),
};

// Auctions
export const auctionsAPI = {
  getAll: () => api.get('/auctions'),
  getById: (id) => api.get(`/auctions?id=${id}`),
  create: (auction) => api.post('/auctions', auction),
  update: (id, auction) => api.put(`/auctions?id=${id}`, auction),
  delete: (id) => api.delete(`/auctions?id=${id}`),
  placeBid: (auctionId, amount) => 
    api.post('/auctions/bid', { auction_id: auctionId, amount }),
};

// Orders
export const ordersAPI = {
  buy: (carId) => api.post(`/orders/buy?car_id=${carId}`),
  getMy: () => api.get('/orders/my'),
};

// Favorites
export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  add: (carId) => api.post(`/favorites?car_id=${carId}`),
  remove: (carId) => api.delete(`/favorites?car_id=${carId}`),
};

// Trade-ins
export const tradeInsAPI = {
  create: (data) => api.post('/trade-ins', data),
  getMy: () => api.get('/trade-ins/my'),
  getById: (id) => api.get(`/trade-ins?id=${id}`),
  setPayment: (id, userPayment) => api.post(`/trade-ins/set-payment?id=${id}`, { user_payment: userPayment }),
  reject: (id) => api.post(`/trade-ins/reject?id=${id}`),
  delete: (id) => api.delete(`/trade-ins?id=${id}`),
  // Admin
  getAll: (status) => api.get(`/admin/trade-ins${status ? `?status=${status}` : ''}`),
  evaluate: (id, estimatedPrice) => api.post(`/admin/trade-ins/evaluate?id=${id}`, { estimated_price: estimatedPrice }),
};

export default api;
