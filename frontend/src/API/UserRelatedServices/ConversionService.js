import apiClient from "../../hooks/useApiInterceptors";

export default class ConversionService {
    static async getUserConversions(userUuid) {
        try {
            const response = await apiClient.get(`/conversions/${userUuid}/`)
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
    static async convertCurrency(userUuid, amount, startingCurrency, finalCurrency) {
        try {
            const response = await apiClient.post(`/conversions/${userUuid}/`,
                {amount, starting_currency: startingCurrency, final_currency: finalCurrency})
            return response.status
        } catch (e) {
            return e.status
        }
    }
}