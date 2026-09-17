import axios from "axios";
import { API_ENDPOINTS } from "../../api-endpoints";

export const StaffService = {
    create: async (resId, data) => {
        const response = await axios.post(API_ENDPOINTS.STAFF.CREATE(resId), data);
        return response.data;
    },
    getAll: async (resId, { status, search, page, limit } = {}) => {
        const params = new URLSearchParams();
        if (status && status !== "all") params.append("status", status);
        if (search && search.trim()) params.append("search", search.trim());
        if (page) params.append("page", page);
        if (limit) params.append("limit", limit);
        const queryString = params.toString() ? `?${params.toString()}` : "";
        const response = await axios.get(`${API_ENDPOINTS.STAFF.GET_ALL(resId)}${queryString}`);
        return response.data;
    },
    update: async (resId, staffId, data) => {
        const response = await axios.put(API_ENDPOINTS.STAFF.UPDATE(resId, staffId), data);
        return response.data;
    },
    delete: async (resId, staffId) => {
        const response = await axios.delete(API_ENDPOINTS.STAFF.DELETE(resId, staffId));
        return response.data;
    }
};
