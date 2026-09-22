import axios from "axios";
import { API_ENDPOINTS } from "../../api-endpoints";

export const MenuService = {
    category: {
        create: async (resId, data) => {
            const response = await axios.post(API_ENDPOINTS.MENU.CATEGORY.CREATE(resId), data);
            return response.data;
        },
        getAll: async (resId) => {
            const response = await axios.get(API_ENDPOINTS.MENU.CATEGORY.GET_ALL(resId));
            return response.data;
        },
        update: async (resId, categoryId, data) => {
            const response = await axios.put(`${API_ENDPOINTS.MENU.CATEGORY.UPDATE(resId)}?categoryId=${categoryId}`, data);
            return response.data;
        },
        delete: async (resId, categoryId) => {
            const response = await axios.delete(`${API_ENDPOINTS.MENU.CATEGORY.DELETE(resId)}?categoryId=${categoryId}`);
            return response.data;
        }
    },
    item: {
        create: async (resId, data) => {
            const response = await axios.post(API_ENDPOINTS.MENU.ITEM.CREATE(resId), data);
            return response.data;
        },
        getAll: async (resId, params = {}) => {
            const queryStr = new URLSearchParams(params).toString();
            const url = API_ENDPOINTS.MENU.ITEM.GET_ALL(resId) + (queryStr ? `?${queryStr}` : '');
            const response = await axios.get(url);
            return response.data;
        },
        update: async (resId, itemId, data) => {
            const response = await axios.put(`${API_ENDPOINTS.MENU.ITEM.UPDATE(resId)}?itemId=${itemId}`, data);
            return response.data;
        },
        delete: async (resId, itemId) => {
            const response = await axios.delete(`${API_ENDPOINTS.MENU.ITEM.DELETE(resId)}?itemId=${itemId}`);
            return response.data;
        }
    },
    importZomato: async (resId, pageUrl, options = { items: true, media: true, addons: true, address: true }) => {
        const queryStr = new URLSearchParams({ 
            pageUrl, 
            items: options.items, 
            media: options.media, 
            addons: options.addons,
            address: options.address
        }).toString();
        const response = await axios.get(`${API_ENDPOINTS.MENU.IMPORT_ZOMATO(resId)}?${queryStr}`);
        return response.data;
    },
    bulkUpdatePrice: async (resId, data) => {
        const response = await axios.put(API_ENDPOINTS.MENU.BULK_UPDATE_PRICE(resId), data);
        return response.data;
    },
    bulkUpdateDescription: async (resId, data) => {
        const response = await axios.put(API_ENDPOINTS.MENU.BULK_UPDATE_DESCRIPTION(resId), data);
        return response.data;
    },
    bulkUpdateStructure: async (resId, data) => {
        const response = await axios.put(API_ENDPOINTS.MENU.BULK_UPDATE_STRUCTURE(resId), data);
        return response.data;
    },
    bulkUpdateAddons: async (resId, data) => {
        const response = await axios.put(API_ENDPOINTS.MENU.BULK_UPDATE_ADDONS(resId), data);
        return response.data;
    },
    addonGroup: {
        create: async (resId, data) => {
            const response = await axios.post(API_ENDPOINTS.MENU.ADDON_GROUPS.CREATE(resId), data);
            return response.data;
        },
        getAll: async (resId) => {
            const response = await axios.get(API_ENDPOINTS.MENU.ADDON_GROUPS.GET_ALL(resId));
            return response.data;
        },
        update: async (resId, groupId, data) => {
            const response = await axios.put(`${API_ENDPOINTS.MENU.ADDON_GROUPS.UPDATE(resId)}?groupId=${groupId}`, data);
            return response.data;
        },
        delete: async (resId, groupId) => {
            const response = await axios.delete(`${API_ENDPOINTS.MENU.ADDON_GROUPS.DELETE(resId)}?groupId=${groupId}`);
            return response.data;
        }
    }
};
