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
    GET: (workspaceId: string) => `${API_ENDPOINT}/workspace/${workspaceId}`,
    UPDATE: (workspaceId: string) => `${API_ENDPOINT}/workspace/${workspaceId}`,
    DELETE: (workspaceId: string) => `${API_ENDPOINT}/workspace/${workspaceId}`,
    INVITE: (workspaceId: string) => `${API_ENDPOINT}/workspace/${workspaceId}/invite`,
    WORKSPACE_INVITATIONS: (workspaceId: string) => `${API_ENDPOINT}/workspace/${workspaceId}/invitations`,
    USER_INVITATIONS: `${API_ENDPOINT}/invitations`,
    INVITATION_PROCESS: (id: string) => `${API_ENDPOINT}/invitation/${id}`,
    LIST_USERS: (workspaceId: string) => `${API_ENDPOINT}/workspace/${workspaceId}/users`,
    DOMAIN: {
      GET: (workspaceId: string) => `${API_ENDPOINT}/workspace/${workspaceId}/domain`,
      LIST: (workspaceId: string) => `${API_ENDPOINT}/workspace/${workspaceId}/domain`,
      CREATE: (workspaceId: string) => `${API_ENDPOINT}/workspace/${workspaceId}/domain`,
      DELETE: (workspaceId: string, domainId: string) => `${API_ENDPOINT}/workspace/${workspaceId}/domain/${domainId}`,
      VERIFY: (workspaceId: string, domainId: string) => `${API_ENDPOINT}/workspace/${workspaceId}/domain/${domainId}/verify`,
    },
  },
  URL: {
    CREATE: (workspaceId: string) => `${API_ENDPOINT}/url/${workspaceId}`,
    LIST: (workspaceId: string) => `${API_ENDPOINT}/url/${workspaceId}/list`,
    GET: (workspaceId: string, urlId: string) => `${API_ENDPOINT}/url/${workspaceId}/${urlId}`,
    UPDATE: (workspaceId: string, urlId: string) => `${API_ENDPOINT}/url/${workspaceId}/${urlId}`,
    DELETE: (workspaceId: string, urlId: string) => `${API_ENDPOINT}/url/${workspaceId}/${urlId}`,
    ANALYTICS: (workspaceId: string, urlId: string) => `${API_ENDPOINT}/url/${workspaceId}/${urlId}/analytics`,
    TIMESERIES: (workspaceId: string, urlId: string) => `${API_ENDPOINT}/url/${workspaceId}/${urlId}/analytics/timeseries`,
    CHECK_SHORTCODE: `${API_ENDPOINT}/url/check-shortcode`,
  },
};

export default API_URLS;
