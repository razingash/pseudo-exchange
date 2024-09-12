import apiClient from "../../hooks/useApiInterceptors";

export default class CreditService {
    static async getUserCredits(userUuid, page=1) {
        try {
            const response = await apiClient.get(`/credits/${userUuid}/`, {params: {page: page}})
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
    static async payForCredit(userUuid, creditUuid, amount) {
        try {
            const response = await apiClient.patch(`/credits/${userUuid}/`, {credit_uuid: creditUuid, amount:amount})
            return response.status
        } catch (e) {
            return e.status
        }
    }
}