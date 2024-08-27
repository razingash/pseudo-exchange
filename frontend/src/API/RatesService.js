import axios from "axios";

export default class ApiRates {
    static async getRates() {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/v1/rates/')
            return response.data
        } catch (e) {
            console.log(e)
        }
    }
}