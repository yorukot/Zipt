const BASE_URL = (() => {
  if (typeof window === "undefined") {
    if (process.env.NEXT_PUBLIC_API_BASE_URL?.startsWith("http://localhost")) {
      return "http://nginx:80/api/v1";
    }
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  } else {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com";
  }
})();

export const API_URLS = {
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    CHANGE_PASSWORD: `${BASE_URL}/auth/change-password`,
    OAUTH: (oauthProvider: string) => `${BASE_URL}/auth/oauth/${oauthProvider}`,
    CHECK_EMAIL_VERIFY: (userID: string) =>
      `${BASE_URL}/auth/email/verify/check/${userID}`,
    RESEND_VERIFY_EMAIL: `${BASE_URL}/auth/email/verify/resend`,
    REFRESH: `${BASE_URL}/auth/refresh`,
  },
  URL: {
    CREATE: `${BASE_URL}/url`,
    LIST: `${BASE_URL}/url/list`,
    GET: (shortCode: string) => `${BASE_URL}/url/${shortCode}`,
    DELETE: `${BASE_URL}/url`,
    ANALYTICS: (shortCode: string) => `${BASE_URL}/url/${shortCode}/analytics`,
    UPDATE: `${BASE_URL}/url`,
  },
  USER: {
    CHECK_LOGIN: `${BASE_URL}/users/check/login`,
    GET_DATA: `${BASE_URL}/users/profile`,
  },
};

export default API_URLS;
