import apiClient from "../hooks/useApiInterceptors";

export default class AccountService {
    static async getUserUuid() {
        try {
            const response = await apiClient.get('')
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
    static async createNewWallet(userUuid) {
        try {
            const response = await apiClient.post(`http://127.0.0.1:8000/api/v1/wallets/${userUuid}/`)
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
    static async getUserTransfers(userUuid) {
        try {
            const response = await apiClient.get(`http://127.0.0.1:8000/api/v1/transfers/${userUuid}/`)
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
    static async createNewTransfers(userUuid, amount, receiver_uuid) {
        try {
            const response = await apiClient.post(`http://127.0.0.1:8000/api/v1/transfers/${userUuid}/`, {amount:amount, receiver:receiver_uuid})
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
    static async getUserCredits(userUuid) {
        try {
            const response = await apiClient.get(`http://127.0.0.1:8000/api/v1/credits/${userUuid}/`)
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
    static async createNewCredit(userUuid, token, creditType) {
        try {
            const response = await apiClient.post(`http://127.0.0.1:8000/api/v1/credits/${userUuid}/`, {credit_type: creditType})
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
    static async payForCredit(userUuid, creditType, amount) {
        try {
            const response = await apiClient.patch(`http://127.0.0.1:8000/api/v1/credits/${userUuid}/`, {credit_type: creditType, amount:amount})
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
}