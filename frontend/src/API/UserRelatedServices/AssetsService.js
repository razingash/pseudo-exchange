import apiClient from "../../hooks/useApiInterceptors";

export default class AssetsService {
    static async getUserAssets(userUuid, page=1) {
        const response = await apiClient.get(`/user-assets/${userUuid}/`, {params: {page: page}})
        return response.data
    }
    static async buyAssets(userUuid, ticker, transactionType, currencyType, amount) {
        const response = await apiClient.post(`/transactions/${userUuid}/`,
            {ticker:ticker, transaction_type:transactionType, currency_type:currencyType, amount:amount})
        return response.status
    }
}