import axiosInstance from "../Interceptor/AxiosInterceptor";

// Use the shared axios instance so login uses the same base URL as every other
// service (configured once in AxiosInterceptor.tsx).
const loginUser = async (login: any) => {
    return axiosInstance.post('/auth/login', login)
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

export { loginUser };
