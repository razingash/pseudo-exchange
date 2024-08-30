import axios from "axios";

export default class AuthService {
    static async register(username, password) {
        try {
            const response =  await axios.post('http://127.0.0.1:8000/api/v1/registration/users/', {username, password});
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
    static async verifyAccessToken(token) {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/v1/token/verify/', {token: token})
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
    static async refreshAccessToken(username, password) {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/v1/token/refresh/', {username, password});
            return response.data;
        } catch (e) {
            console.log(e)
            return e.status
        }
    }
    /*static async logout(token) {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/v1/auth/token/logout/', {}, {headers: {Authorization: `Token ${token}`}})
            return response.data;
        } catch (e) {
            console.log(e)
        }
    }*/
}