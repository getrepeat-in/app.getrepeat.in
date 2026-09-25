export const API_ENDPOINTS = {
    RESTAURANT: {
        CREATE_RESTAURANT: "/api/restaurant",
        GET_ALL_RESTAURANT: "/api/restaurant",
        GET_RESTAURANT_BY_ID: (id) => `/api/restaurant/${id}`,
        UPDATE_RESTAURANT: (id) => `/api/restaurant/${id}`,
        DELETE_RESTAURANT: (id) => `/api/restaurant/${id}`,
    },
    UPLOAD: {
        FILE: (resId) => `/api/restaurant/${resId}/uploads`,
        PRESIGN: (resId) => `/api/restaurant/${resId}/uploads/presign`
    },
    MENU: {
        CATEGORY: {
            CREATE: (resId) => `/api/restaurant/${resId}/menu/category`,
            GET_ALL: (resId) => `/api/restaurant/${resId}/menu/category`,
            UPDATE: (resId) => `/api/restaurant/${resId}/menu/category`,
            DELETE: (resId) => `/api/restaurant/${resId}/menu/category`,
        },
        ITEM: {
            CREATE: (resId) => `/api/restaurant/${resId}/menu/item`,
            GET_ALL: (resId) => `/api/restaurant/${resId}/menu/item`,
            UPDATE: (resId) => `/api/restaurant/${resId}/menu/item`,
            DELETE: (resId) => `/api/restaurant/${resId}/menu/item`,
        },
        IMPORT_ZOMATO: (resId) => `/api/restaurant/${resId}/menu/import/zomato`,
        IMPORT_JSON: (resId) => `/api/restaurant/${resId}/menu/import/json`,
        BULK_UPDATE_PRICE: (resId) => `/api/restaurant/${resId}/menu/bulk-update/price`,
        BULK_UPDATE_DESCRIPTION: (resId) => `/api/restaurant/${resId}/menu/bulk-update/description`,
        BULK_UPDATE_STRUCTURE: (resId) => `/api/restaurant/${resId}/menu/bulk-update/structure`,
        BULK_UPDATE_ADDONS: (resId) => `/api/restaurant/${resId}/menu/bulk-update/addons`,
        ADDON_GROUPS: {
            GET_ALL: (resId) => `/api/restaurant/${resId}/menu/addon-groups`,
            CREATE: (resId) => `/api/restaurant/${resId}/menu/addon-groups`,
            UPDATE: (resId) => `/api/restaurant/${resId}/menu/addon-groups`,
            DELETE: (resId) => `/api/restaurant/${resId}/menu/addon-groups`,
        }
    },
    STAFF: {
        CREATE: (resId) => `/api/restaurant/${resId}/staff`,
        GET_ALL: (resId) => `/api/restaurant/${resId}/staff`,
        UPDATE: (resId, staffId) => `/api/restaurant/${resId}/staff/${staffId}`,
        DELETE: (resId, staffId) => `/api/restaurant/${resId}/staff/${staffId}`,
    },
    ROLE: {
        GET_ALL: (resId) => `/api/restaurant/${resId}/role`,
    },
    TABLE: {
        CREATE: (resId) => `/api/restaurant/${resId}/tables`,
        GET_ALL: (resId) => `/api/restaurant/${resId}/tables`,
        GET_ONE: (resId, tableId) => `/api/restaurant/${resId}/tables/${tableId}`,
        UPDATE: (resId, tableId) => `/api/restaurant/${resId}/tables/${tableId}`,
        DELETE: (resId, tableId) => `/api/restaurant/${resId}/tables/${tableId}`,
    },
    ORDER: {
        CREATE: (resId) => `/api/restaurant/${resId}/orders`,
        GET_ALL: (resId) => `/api/restaurant/${resId}/orders`,
        GET_ONE: (resId, orderId) => `/api/restaurant/${resId}/orders/${orderId}`,
        UPDATE: (resId, orderId) => `/api/restaurant/${resId}/orders/${orderId}`,
        DELETE: (resId, orderId) => `/api/restaurant/${resId}/orders/${orderId}`,
    },
    PROMOTION: {
        CREATE: (resId) => `/api/restaurant/${resId}/promotions`,
        GET_ALL: (resId) => `/api/restaurant/${resId}/promotions`,
        GET_ONE: (resId, promotionId) => `/api/restaurant/${resId}/promotions/${promotionId}`,
        UPDATE: (resId, promotionId) => `/api/restaurant/${resId}/promotions/${promotionId}`,
        DELETE: (resId, promotionId) => `/api/restaurant/${resId}/promotions/${promotionId}`,
    },
    PAYMENTS: {
        RAZORPAY: {
            CONNECT: (resId) => `/api/restaurant/${resId}/integrations/razorpay/connect`,
            DISCONNECT: (resId) => `/api/restaurant/${resId}/integrations/razorpay/disconnect`,
            CALLBACK: "/api/payments/razorpay/callback"
        }
    },
    INTEGRATIONS: {
        GET: (resId) => `/api/restaurant/${resId}/integrations`,
        UPDATE: (resId) => `/api/restaurant/${resId}/integrations`,
        INSTAGRAM_CONNECT: (resId) => `/api/restaurant/${resId}/integrations/instagram/auth`,
        INSTAGRAM_DISCONNECT: (resId) => `/api/restaurant/${resId}/instagram/disconnect`,
        INSTAGRAM_POSTS_MAPPED: (resId) => `/api/restaurant/${resId}/instagram/posts/mapped`
    },
    REPORTS: {
        GET_ANALYTICS: (resId) => `/api/restaurant/${resId}/reports`,
    }
};