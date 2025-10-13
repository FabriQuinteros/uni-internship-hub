export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL,
    TIMEOUT: 15000,
    ENDPOINTS: {
        PING: '/ping',
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
        },
        ORGANIZATIONS: {
            REGISTER: '/api/organizations/register',
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
        STUDENTS: {
            REGISTER: '/api/students/register',
        },
    }
} as const;
