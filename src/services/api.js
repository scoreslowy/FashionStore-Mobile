import axios from 'axios';

const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

export async function getProductsByCategory(category) {
  const response = await api.get(`/products/category/${encodeURIComponent(category)}`);
  return response.data.products ?? [];
}

export async function getProductById(id) {
  const response = await api.get(`/products/${id}`);
  return response.data;
}

export default api;
