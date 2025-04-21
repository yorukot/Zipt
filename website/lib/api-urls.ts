const API_ENDPOINT = (() => {
  // If the code is running in the browser, use the NEXT_PUBLIC_API_ENDPOINT environment variable
  // Otherwise, use the API_ENDPOINT environment variable
  if (typeof window === "undefined") {
    return process.env.SERVER_API_ENDPOINT;
  } else {
    return process.env.NEXT_PUBLIC_SERVER_API_ENDPOINT;
  }
})();

export const API_URLS = {
  AUTH: {
    LOGIN: `${API_ENDPOINT}/auth/login`,
    SIGNUP: `${API_ENDPOINT}/auth/register`,
    LOGOUT: `${API_ENDPOINT}/auth/logout`,
    REFRESH: `${API_ENDPOINT}/auth/refresh`,
    CHECK: `${API_ENDPOINT}/auth/check`,
  },
};

export default API_URLS;
