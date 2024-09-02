import axios from "axios";
import {useAuth} from "../context/useAuth";

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    }
})

export const useApiInterceptors = () => {
    const authContext = useAuth();

    if (!authContext) return;

    const { logout, tokensRef, refreshAccessToken } = authContext;

    apiClient.interceptors.request.use((config) => {
        if (tokensRef?.access) {
            config.headers.Authorization = `Token ${tokensRef.access}`;
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
                    const accessToken = await refreshAccessToken();
                    apiClient.defaults.headers.common.Authorization = `Token ${accessToken}`;
                    originalRequest.headers.Authorization = `Token ${accessToken}`;
                    return apiClient(originalRequest);
                } catch (e) {
                    console.log(`InterceptorResponseError: ${e}`)
                    await logout();
                }
            }
            throw error;
        }
    )
    return apiClient;
};

export default apiClient;