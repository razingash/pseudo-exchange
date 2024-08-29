import axios from "axios";
import {useAuth} from "../context/useAuth";

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    }
})

export const UseApiInterceptors = () => {
    const authContext = useAuth();

    if (!authContext) return;

    const { logout } = authContext;

    apiClient.interceptors.request.use((config) => {
        if (localStorage.getItem('token')) {
            config.headers.Authorization = `Token ${localStorage.getItem('token')}`;
        }
        return config;
    }, (error) => {
        return Promise.reject(error)
    })

    apiClient.interceptors.response.use(
        (config) => {
            return config;
        }, async (error) => {
            const originalRequest = error.config;
            if (error.response.status === 401 &&  error.config && !error.config._retry) {
                originalRequest._retry = true;
                try {
                    apiClient.defaults.headers.common.Authorization = `Token ${localStorage.getItem('token')}`;
                    originalRequest.headers.Authorization = `Token ${localStorage.getItem('token')}`;
                    await console.log('change this')
                    return apiClient(originalRequest);
                } catch (e) {
                    console.log(`InterceptorResponseError: ${e}`)
                    logout()
                }
            }
            throw error;
        }
    )
    return apiClient;
};

export default apiClient;