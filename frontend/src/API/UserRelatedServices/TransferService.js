import apiClient from "../../hooks/useApiInterceptors";

export default class TransferService {
    static async getUserTransfers(userUuid, page=1) {
        try {
            const response = await apiClient.get(`/transfers/${userUuid}/`, {params: {page: page}})
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
    static async createNewTransfers(userUuid, amount, receiver_uuid) {
        try {
            const response = await apiClient.post(`/transfers/${userUuid}/`, {amount:amount, receiver:receiver_uuid})
            return response.status
        } catch (e) {
            console.log(e)
        }
    }
}