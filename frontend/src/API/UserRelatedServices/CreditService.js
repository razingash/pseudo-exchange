import apiClient from "../../hooks/useApiInterceptors";

export default class CreditService {
    static async getUserCredits(userUuid, page=1) {
        const response = await apiClient.get(`/credits/${userUuid}/`, {params: {page: page}})
        return response.data
    }
    static async createNewCredit(userUuid, creditType) {
        const response = await apiClient.post(`/credits/${userUuid}/`, {credit_type: creditType})
        return response.data
    }
    static async payForCredit(userUuid, creditUuid, amount) {
        const response = await apiClient.patch(`/credits/${userUuid}/`, {credit_uuid: creditUuid, amount: amount})
        return response.data
    }
}