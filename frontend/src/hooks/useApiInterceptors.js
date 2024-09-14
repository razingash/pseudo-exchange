import axios from "axios";
import {useEffect} from "react";
import {useAuth} from "./context/useAuth";

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    }
})

export const useApiInterceptors = () => {
    const { tokensRef, refreshAccessToken, logout, uuid } = useAuth();

    useEffect(() => {
        if (!tokensRef.current) return;
        const interceptorId = apiClient.interceptors.request.use(
            (config) => {
                if (tokensRef.current.access) {
                    config.headers.Authorization = `Token ${tokensRef.current.access}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptorId = apiClient.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const accessToken = await refreshAccessToken();
                        apiClient.defaults.headers.common.Authorization = `Token ${accessToken}`;
                        originalRequest.headers.Authorization = `Token ${accessToken}`;
                        return apiClient(originalRequest);
                    } catch (e) {
                        await logout();
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            apiClient.interceptors.request.eject(interceptorId);
            apiClient.interceptors.response.eject(responseInterceptorId);
        };
    }, [tokensRef, uuid], refreshAccessToken, logout); //*
};

export default apiClient;