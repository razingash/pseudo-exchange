import apiClient from "../../hooks/useApiInterceptors";

export default class ConversionService {
    static async getUserConversions(userUuid, page=1) {
        const response = await apiClient.get(`/conversions/${userUuid}/`, {params: {page: page}})
        return response.data
    }
    static async convertCurrency(userUuid, amount, startingCurrency, finalCurrency) {
        const response = await apiClient.post(`/conversions/${userUuid}/`,
            {amount, starting_currency: startingCurrency, final_currency: finalCurrency})
        return response.status
    }
}