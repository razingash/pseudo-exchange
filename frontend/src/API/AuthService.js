import axios from "axios";
import apiClient from "../hooks/useApiInterceptors";

export default class AuthService {
    static async register(username, password) {
        const response =  await axios.post('http://127.0.0.1:8000/api/v1/registration/', {username, password});
        return response.data;
    }
    static async login(username, password) {
        const response = await axios.post('http://127.0.0.1:8000/api/v1/token/', {username, password})
        return response.data
    }
    static async verifyToken(token) { // both access and refresh
        const response = await axios.post('http://127.0.0.1:8000/api/v1/token/verify/', {token: token})
        return response.data
    }
    static async refreshAccessToken(token) {
        const response = await axios.post('http://127.0.0.1:8000/api/v1/token/refresh/', {refresh: token});
        return response.data;
    }
    static async logout(token) {
        try {
            const response = apiClient.post('/logout/', {refresh_token: token})
            return response.data;
        } catch (e) {
            console.error('critical error: ' + e)
        }
    }
}