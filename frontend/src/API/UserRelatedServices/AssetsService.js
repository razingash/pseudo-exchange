import apiClient from "../../hooks/useApiInterceptors";

export default class AssetsService {
    static async getUserAssets(userUuid) {
        try {
            const response = await apiClient.get(`/user-assets/${userUuid}/`)
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
    static async buyAssets(userUuid, ticker, transactionType, currencyType, amount) {
        try {
            const response = await apiClient.post(`/transactions/${userUuid}/`,
                {ticker:ticker, transaction_type:transactionType, currency_type:currencyType, amount:amount})
            return response.status
        } catch (e) {
            console.log(e)
            return e.status
        }
    }
}