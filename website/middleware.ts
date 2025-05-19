import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import API_URLS from "./lib/api-urls";

// Define the return type for the refresh function
interface RefreshResult {
  success: boolean;
  cookies?: string[];
}

// Function to handle token refresh
async function refreshTokenFunc(
  accessToken: string | undefined,
  refreshToken: string | undefined
): Promise<RefreshResult> {

  try {
    if (!refreshToken) {
      return { success: false };
    }

    // If both tokens exist and are valid, no refresh needed
    if (accessToken && refreshToken) {
      return { success: true };
    }
    // If we get here, we need to refresh the token
    const res = await fetch(API_URLS.AUTH.REFRESH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refresh_token=${refreshToken}`,
      },
      credentials: "include",
    });

    if (res.ok) {
      // In Node.js/Next.js, headers.get only returns the first value
      // We need to manually extract and process all Set-Cookie headers
      const cookies: string[] = [];
      const setCookie = res.headers.get('set-cookie');
      
      if (setCookie) {
        // If there's a single Set-Cookie header with multiple cookies separated by commas
        // Split them into individual cookies
        cookies.push(...setCookie.split(',').map(c => c.trim()));
      }
      
      // Also check if there are multiple Set-Cookie headers
      // by iterating through all headers
      const headerEntries = Array.from(res.headers.entries());
      headerEntries.forEach(([key, value]) => {
        if (key.toLowerCase() === 'set-cookie' && !cookies.includes(value)) {
          cookies.push(value);
        }
      });
      
      return {
        success: true,
        cookies,
      };
    } else {
      console.error("Token refresh failed:", await res.text());
      return { success: false };
    }
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return { success: false };
  }
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Skip authentication for non-private routes
  if (!privateRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Handle authentication for private routes
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;


  // Try to refresh token if needed
  const { success, cookies } = await refreshTokenFunc(
    accessToken,
    refreshToken
  );

  // If authentication failed, redirect to login
  if (!success) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Authentication succeeded
  const response = NextResponse.next();
  
  // Apply new cookies if provided
  if (cookies && cookies.length > 0) {
    cookies.forEach((cookieString) => {
      if (cookieString) {
        response.headers.append('Set-Cookie', cookieString);
      }
    });
  }

  return response;
}

// Routes that require authentication
const privateRoutes = ["/dashboard", "/workspace"];

export const config = {
  matcher: ["/:path*"],
};
