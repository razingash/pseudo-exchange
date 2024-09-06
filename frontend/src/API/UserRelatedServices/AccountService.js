import apiClient from "../../hooks/useApiInterceptors";

export default class AccountService {
    static async getUserUuid() {
        try {
            const response = await apiClient.get('http://127.0.0.1:8000/api/v1/get-uuid/')
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
    static async getAccountInfo(userUuid) {
        try {
            const response = await apiClient.get(`http://127.0.0.1:8000/api/v1/account/${userUuid}/`)
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
    static async getAdditionalWallets(userUuid) {
        try {
            const response = await apiClient.get(`http://127.0.0.1:8000/api/v1/wallets/${userUuid}/`)
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
    static async createNewWallet(userUuid, currency) {
        try {
            const response = await apiClient.post(`http://127.0.0.1:8000/api/v1/wallets/${userUuid}/`, {currency:currency})
            return response.data
        } catch (e) {
            return e.status;
        }
    }
}