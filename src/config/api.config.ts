export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL,
    TIMEOUT: 15000,
    ENDPOINTS: {
        PING: '/ping',
        AUTH: {
            LOGIN: '/api/auth/login',
            LOGOUT: '/api/auth/logout',
            FORGOT_PASSWORD: '/api/user/forgot-password',
            RESET_PASSWORD: '/api/user/reset-password',
        },
        CATALOG: {
            BASE: '/api/catalog',
            TECHNOLOGIES: {
                LIST: '/api/catalog/technologies',
                CREATE: '/api/catalog/technologies',
                UPDATE: (id: number) => `/api/catalog/technologies/${id}`,
                DELETE: (id: number) => `/api/catalog/technologies/${id}`,
            },
            POSITIONS: {
                LIST: '/api/catalog/positions',
                CREATE: '/api/catalog/positions',
                UPDATE: (id: number) => `/api/catalog/positions/${id}`,
                DELETE: (id: number) => `/api/catalog/positions/${id}`,
            },
            DURATIONS: {
                LIST: '/api/catalog/durations',
                CREATE: '/api/catalog/durations',
                UPDATE: (id: number) => `/api/catalog/durations/${id}`,
                DELETE: (id: number) => `/api/catalog/durations/${id}`,
            },
            LOCATIONS: {
                LIST: '/api/catalog/locations',
                CREATE: '/api/catalog/locations',
                UPDATE: (id: number) => `/api/catalog/locations/${id}`,
                DELETE: (id: number) => `/api/catalog/locations/${id}`,
            },
            MODALITIES: {
                LIST: '/api/catalog/modalities',
                CREATE: '/api/catalog/modalities',
                UPDATE: (id: number) => `/api/catalog/modalities/${id}`,
                DELETE: (id: number) => `/api/catalog/modalities/${id}`,
            },
            AVAILABILITY: {
                LIST: '/api/catalog/availability',
                CREATE: '/api/catalog/availability',
                UPDATE: (id: number) => `/api/catalog/availability/${id}`,
                DELETE: (id: number) => `/api/catalog/availability/${id}`,
            },
        },
        ORGANIZATIONS: {
            REGISTER: '/api/organizations/register',
            ADMIN: {
                LIST: '/api/admin/organizations',
                DETAILS: (id: string) => `/api/admin/organizations/${id}/details`,
                SUMMARY: (id: string) => `/api/admin/organizations/${id}/summary`,
                STATUS: (id: string) => `/api/admin/organizations/${id}/status`,
                STATS: '/api/admin/organizations/stats',
            },
            PROFILE: {
                GET: '/api/organizations/profile',
                UPDATE: '/api/organizations/profile'
            },
            OFFERS: {
                CREATE: '/api/organizations/offers',
                LIST: '/api/organizations/offers',
                GET: (id: number) => `/api/organizations/offers/${id}`,
                UPDATE: (id: number) => `/api/organizations/offers/${id}`,
                SEND_TO_APPROVAL: (id: number) => `/api/organizations/offers/${id}/send`,
                DELETE: (id: number) => `/api/organizations/offers/${id}`,
            },
        },
        ADMIN: {
            OFFERS: {
                PENDING: '/api/admin/offers/pending',
                DECISION: (id: number) => `/api/admin/offers/${id}/decision`,
                DETAILS: (id: number) => `/api/admin/offers/${id}`,
            },
        },
        NOTIFICATIONS: {
            LIST: '/api/notifications',
            MARK_READ: (id: number) => `/api/notifications/${id}/read`,
            MARK_ALL_READ: '/api/notifications/read-all',
        },
        STUDENTS: {
            REGISTER: '/api/students/register',
            PROFILE: {
                GET: '/api/students/profile',
                UPDATE: '/api/students/profile',
                GET_BY_ID: (id: number) => `/api/students/profile/${id}`,
            },
        },
    }
} as const;
