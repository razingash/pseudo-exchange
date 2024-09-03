import apiClient from "../../hooks/useApiInterceptors";

export default class TransferService {
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
}