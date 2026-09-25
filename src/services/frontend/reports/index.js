import axios from "axios";
import { API_ENDPOINTS } from "../../api-endpoints";

export const ReportService = {
  getAnalytics: async (resId, params = {}) => {
    const response = await axios.get(API_ENDPOINTS.REPORTS.GET_ANALYTICS(resId), { params });
    return response.data;
  },
};
