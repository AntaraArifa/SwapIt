// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api/v1',
  ENDPOINTS: {
    // Skill Listings
    LISTINGS: {
      ALL: '/listings/all',
      BY_ID: (id) => `/listings/single/${id}`,
      TAGS: '/listings/tags',
      CREATE: '/listings/create',
    },
    // User Authentication
    AUTH: {
      SIGNIN: '/auth/signin',
      SIGNUP: '/auth/signup',
      LOGOUT: '/auth/logout',
    },
    // User Profile
    USER: {
      PROFILE: '/user/profile',
      UPDATE: '/user/update',
    },
    // Skills
    SKILLS: {
      ALL: '/skills/all',
      BY_ID: (id) => `/skills/user/${id}`,
      CREATE: '/skills/create',
    },
    // Session Management
    SESSIONS: {
      CREATE: '/sessions/create',
      GET_ALL: '/sessions/user',
      UPDATE_STATUS: (id) => `/sessions/${id}/status`, 
      RESCHEDULE: (id) => `/sessions/${id}/reschedule`,
}
  }
}

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Export individual parts for convenience
export const API_BASE_URL = API_CONFIG.BASE_URL
export const API_ENDPOINTS = API_CONFIG.ENDPOINTS

export default API_CONFIG
