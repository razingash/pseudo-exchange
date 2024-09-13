import axios from "axios";

export default class AssetsService {
    static async getAssets() {
        const response = await axios.get('http://127.0.0.1:8000/api/v1/assets/')
        return response.data
    }
    static async getAsset(asset_param) {
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/asset-story/${asset_param}/`)
        return response.data
    }
}