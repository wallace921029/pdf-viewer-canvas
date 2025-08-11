import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

instance.interceptors.request.use(
  (config) => {
    // 在请求发送之前做些什么
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    // 对响应数据做些什么
    return response;
  },
  (error) => {
    // 对响应错误做些什么
    return Promise.reject(error);
  }
);

export default instance;
