import apiClient from "../../hooks/useApiInterceptors";

export default class CreditService {
    static async getUserCredits(userUuid) {
        try {
            const response = await apiClient.get(`/credits/${userUuid}/`)
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
    static async createNewCredit(userUuid, creditType) {
        try {
            const response = await apiClient.post(`/credits/${userUuid}/`, {credit_type: creditType})
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
    static async payForCredit(userUuid, creditType, amount) {
        try {
            const response = await apiClient.patch(`/credits/${userUuid}/`, {credit_type: creditType, amount:amount})
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
}