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
  ENDPOINT: API_ENDPOINT,
  AUTH: {
    LOGIN: `${API_ENDPOINT}/auth/login`,
    SIGNUP: `${API_ENDPOINT}/auth/register`,
    LOGOUT: `${API_ENDPOINT}/auth/logout`,
    REFRESH: `${API_ENDPOINT}/auth/refresh`,
    CHECK: `${API_ENDPOINT}/auth/check`,
  },
  USER: {
    PROFILE: `${API_ENDPOINT}/users/profile`,
    SEARCH: `${API_ENDPOINT}/users/search`,
  },
  WORKSPACE: {
    LIST: `${API_ENDPOINT}/workspaces`,
    CREATE: `${API_ENDPOINT}/workspace`,
    GET: (id: string) => `${API_ENDPOINT}/workspace/${id}`,
    UPDATE: (id: string) => `${API_ENDPOINT}/workspace/${id}`,
    DELETE: (id: string) => `${API_ENDPOINT}/workspace/${id}`,
    INVITE: (id: string) => `${API_ENDPOINT}/workspace/${id}/invite`,
    WORKSPACE_INVITATIONS: (id: string) => `${API_ENDPOINT}/workspace/${id}/invitations`,
    USER_INVITATIONS: `${API_ENDPOINT}/invitations`,
    INVITATION_PROCESS: (id: string) => `${API_ENDPOINT}/invitation/${id}`,
  },
};

export default API_URLS;
