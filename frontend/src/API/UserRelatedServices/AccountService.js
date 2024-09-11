import apiClient from "../../hooks/useApiInterceptors";

export default class AccountService {
    static async getUserUuid() {
        try {
            const response = await apiClient.get('/get-uuid/')
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
    static async getAccountInfo(userUuid) {
        try {
            const response = await apiClient.get(`/account/${userUuid}/`)
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
    static async getAdditionalWallets(userUuid) {
        try {
            const response = await apiClient.get(`/wallets/${userUuid}/`)
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
    static async createNewWallet(userUuid, currency) {
        try {
            const response = await apiClient.post(`/wallets/${userUuid}/`, {currency:currency})
            return response.status
        } catch (e) {
            return e.status;
        }
    }
}