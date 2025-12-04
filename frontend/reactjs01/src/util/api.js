import axios from "./axios.customize";

const createUserApi = (name, email, password) => {
  const URL_API = "/v1/api/register";
  const data = {
    name,
    email,
    password,
  };
  return axios.post(URL_API, data);
};

const loginApi = (email, password) => {
  const URL_API = "/v1/api/login";
  const data = {
    email,
    password,
  };
  return axios.post(URL_API, data);
};

const getUserApi = () => {
  const URL_API = "/v1/api/user";
  return axios.get(URL_API);
};

const getAccountApi = () => {
  const URL_API = "/v1/api/account";
  return axios.get(URL_API);
};

const getProductApi = (page, limit, category) => {
  const URL_API = `/v1/api/products?page=${page}&limit=${limit}&category=${category}`;
  return axios.get(URL_API);
};

const createProductApi = (name, price, category, image) => {
  const URL_API = "/v1/api/products";
  const data = { name, price, category, image };
  return axios.post(URL_API, data);
};

const updateProductApi = (id, name, price, category, image) => {
  const URL_API = "/v1/api/products";
  const data = { id, name, price, category, image };
  return axios.put(URL_API, data);
};

const deleteProductApi = (id) => {
  const URL_API = "/v1/api/products";
  return axios.delete(`${URL_API}/${id}`);
};

const searchProductApi = (query, page, limit, category, minPrice, maxPrice) => {
  let URL_API = `/v1/api/products/search?page=${page}&limit=${limit}`;

  if (query) URL_API += `&q=${encodeURIComponent(query)}`;
  if (category && category !== "ALL") URL_API += `&category=${category}`;
  if (minPrice) URL_API += `&minPrice=${minPrice}`;
  if (maxPrice) URL_API += `&maxPrice=${maxPrice}`;

  return axios.get(URL_API);
};

const syncProductsApi = () => {
  const URL_API = "/v1/api/products/sync";
  return axios.post(URL_API);
};

const recreateIndexApi = () => {
  const URL_API = "/v1/api/products/recreate-index";
  return axios.post(URL_API);
};

const getProductDetailApi = (id) => {
  return axios.get(`/v1/api/products/${id}`);
};

const getProductStatsApi = (id) => {
  return axios.get(`/v1/api/products/${id}/stats`);
};

const getSimilarProductsApi = (id) => {
  return axios.get(`/v1/api/products/${id}/similar`);
};

const toggleFavoriteApi = (productId) => {
  return axios.post(`/v1/api/favorites`, { productId });
};

const getFavoritesApi = () => {
  return axios.get(`/v1/api/favorites`);
};

export {
  createUserApi,
  loginApi,
  getUserApi,
  getAccountApi,
  getProductApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  searchProductApi,
  syncProductsApi,
  recreateIndexApi,

  getProductDetailApi,
  getProductStatsApi,
  getSimilarProductsApi,
  toggleFavoriteApi,
  getFavoritesApi,
};
