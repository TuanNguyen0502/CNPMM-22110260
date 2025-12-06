import axios from "axios";

// Create an Axios instance with a base URL from environment variables
const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Request interceptor to add Authorization header if token exists
instance.interceptors.request.use(
  // `config` is the Axios request configuration object
  // We modify it to include the Authorization header
  // Before sending the request
  // Add Bearer token from localStorage if it exists
  function (config) {
    const token = localStorage.getItem("access_token");
    if (token) {
      // Append the token to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Response interceptor to handle responses and errors globally
// Extract data from response and handle 401 Unauthorized errors
instance.interceptors.response.use(
  function (response) {
    if (response && response.data) {
      return response.data;
    }
  },
  function (error) {
    // Check if the error response status is 401 (Unauthorized)
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem("access_token");
      // Optionally redirect to login page
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href = "/login";
      }
    }
    // Reject the promise with the error to allow further handling
    return Promise.reject(error);
  }
);

export default instance;
