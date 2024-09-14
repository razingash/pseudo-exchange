import apiClient from "../../hooks/useApiInterceptors";

export default class AccountService {
    static async getUserUuid() {
        const response = await apiClient.get('/get-uuid/')
        return response.data
    }
    static async getAccountInfo(userUuid) {
        const response = await apiClient.get(`/account/${userUuid}/`)
        return response.data
    }
    static async getAccountHistory(userUuid) { // main wallet
        const response = await apiClient.get(`/account/${userUuid}/history/`)
        return response.data
    }
    static async getAdditionalWallets(userUuid) {
        const response = await apiClient.get(`/wallets/${userUuid}/`)
        return response.data
    }
    static async createNewWallet(userUuid, currency) {
        const response = await apiClient.post(`/wallets/${userUuid}/`, {currency:currency})
        return response.status
    }
}