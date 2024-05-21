import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? "https://api.magda1207.smallhost.pl" :"/"
});



// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const email = localStorage.getItem('email')
        await axios.post('/api/refresh-token', {  email });

        return axios(originalRequest);
      } catch (error) {
        // Handle refresh token error or redirect to login
      }
    }

    return Promise.reject(error);
  }
);


export default api