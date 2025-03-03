import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import API_URLS from "./lib/api-urls";

// Function to handle token refresh
async function refreshTokenFunc(accessToken: string | undefined, refreshToken: string | undefined) {
  try {
    if (!refreshToken) {
      return { success: false }; // If no refreshToken, return failure
    }

    if (accessToken && refreshToken) {
      return { success: true }
    }
    const res = await fetch(API_URLS.AUTH.REFRESH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `refresh_token=${refreshToken}`, // Send refresh_token
      },
    });
    const data = await res.json();
    if (res.ok) {
      return {
        success: true,
        cookies: res.headers.get("Set-Cookie"),
      };
    } else {
      return { success: false }; // If refresh fails
    }
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return { success: false }; // In case of error
  }
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  const { success, cookies } = await refreshTokenFunc(accessToken, refreshToken);

  const response =  NextResponse.next();
  if (cookies) response.headers.set("Set-Cookie", cookies);
  return response

  if (pathname.startsWith("/courses")) {
    // const response =  NextResponse.next();
    // if (cookies) response.headers.set("Set-Cookie", cookies);
    // return response
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
