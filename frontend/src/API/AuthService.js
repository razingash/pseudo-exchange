import axios from "axios";
import apiClient from "../hooks/useApiInterceptors";

export default class AuthService {
    static async register(username, password) {
        try {
            const response =  await axios.post('http://127.0.0.1:8000/api/v1/registration/', {username, password});
            return response.data;
        } catch (e) {
            console.log(e)
            return e.status;
        }
    }
    static async login(username, password) {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/v1/token/', {username, password})
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
    static async verifyToken(token) { // both access and refresh
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/v1/token/verify/', {token: token})
            return response.data
        } catch (e) {
            console.log(e)
            return e.status
        }
    }
    static async refreshAccessToken(token) {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/v1/token/refresh/', {refresh: token});
            return response.data;
        } catch (e) {
            console.log(e)
            return e.status
        }
    }
    static async logout(token) {
        try {
            const response = apiClient.post('http://127.0.0.1:8000/api/v1/logout/', {refresh_token: token})
            return response.data;
        } catch (e) {
            console.log(e)
            throw e
        }
    }
}