import axios, { InternalAxiosRequestConfig } from "axios";
import { removeUser } from "../Slices/UserSlice";
import { removeJwt } from "../Slices/JwtSlice";

// API base URL: set REACT_APP_API_URL in .env.local to use another backend
// (e.g. http://localhost:8080 for local development).
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://jobs-api.onekampus.com'
});

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

export const setupResponseInterceptor = (navigate: any, dispatch: any) => {
    axiosInstance.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            if (error.response?.status === 401) {

                dispatch(removeUser());
                dispatch(removeJwt());
                navigate('/login');
            }
            return Promise.reject(error);
        }
    )
}

export default axiosInstance;
