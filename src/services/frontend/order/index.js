import axios from "axios";
import { API_ENDPOINTS } from "../../api-endpoints";

export const OrderService = {
    getAll: async (resId, params = {}) => {
        const response = await axios.get(API_ENDPOINTS.ORDER.GET_ALL(resId), { params });
        return response.data;
    },
    getBulk: async (params = {}) => {
        const response = await axios.get(API_ENDPOINTS.ORDER.BULK_GET_ALL, { params });
        return response.data;
    },
    getById: async (resId, orderId) => {
        const response = await axios.get(API_ENDPOINTS.ORDER.GET_ONE(resId, orderId));
        return response.data;
    },
    create: async (resId, data) => {
        const response = await axios.post(API_ENDPOINTS.ORDER.CREATE(resId), data);
        return response.data;
    },
    update: async (resId, orderId, data) => {
        const response = await axios.patch(API_ENDPOINTS.ORDER.UPDATE(resId, orderId), data);
        return response.data;
    },
    delete: async (resId, orderId) => {
        const response = await axios.delete(API_ENDPOINTS.ORDER.DELETE(resId, orderId));
        return response.data;
    }
};
