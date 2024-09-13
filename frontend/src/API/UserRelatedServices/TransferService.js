import apiClient from "../../hooks/useApiInterceptors";

export default class TransferService {
    static async getUserTransfers(userUuid, page=1) {
        const response = await apiClient.get(`/transfers/${userUuid}/`, {params: {page: page}})
        return response.data
    }
    static async createNewTransfer(userUuid, amount, receiver_uuid) {
        const response = await apiClient.post(`/transfers/${userUuid}/`, {amount:amount, receiver:receiver_uuid})
        return response.status
    }
}