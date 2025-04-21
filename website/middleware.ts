import { NextRequest, NextResponse } from "next/server";
import API_URLS from "./lib/api-urls";

export default async function middleware(req: NextRequest) {
    // Skip middleware for public resources
    if (isPublicResource(req.nextUrl.pathname)) {
        return NextResponse.next();
    }
    
    const accessToken = req.cookies.get("accessToken")?.value;
    
    // If there's no access token and the user is trying to access a protected route,
    // first check if they're already logged in (cookies might be missing)
    if (!accessToken && isProtectedRoute(req.nextUrl.pathname)) {
        try {
            // Use the new check endpoint to verify login status
            const checkResponse = await fetch(API_URLS.AUTH.CHECK, {
                credentials: 'include',
                headers: {
                    Cookie: req.cookies.toString(),
                }
            });
            
            const checkData = await checkResponse.json();
            
            // If not logged in, redirect to login
            if (!checkData.data?.logged_in) {
                return redirectToLogin(req);
            }
        } catch {
            // If check fails, redirect to login
            return redirectToLogin(req);
        }
    }

    // Clone the request and set the Authorization header if the access token exists
    const requestHeaders = new Headers(req.headers);
    if (accessToken) {
        requestHeaders.set("Authorization", `Bearer ${accessToken}`);
    }

    // For API requests, we need to handle authentication
    if (req.nextUrl.pathname.startsWith('/api')) {
        // Create the modified request with the updated headers
        const originalRequest = new Request(req.url, {
            method: req.method,
            headers: requestHeaders,
            body: req.body,
            redirect: 'manual',  // Prevent auto-redirects
        });

        try {
            const response = await fetch(originalRequest);
            
            // Handle 401 Unauthorized by refreshing the token
            if (response.status === 401) {
                // Try to refresh the token
                const refreshedResponse = await refreshToken(req);
                
                if (refreshedResponse) {
                    // Successfully refreshed, return the modified response
                    return refreshedResponse;
                } else {
                    // Token refresh failed, redirect to login
                    return redirectToLogin(req);
                }
            }
            
            // For any other response, return it as is
            return response;
        } catch (err) {
            console.error("Middleware error:", err);
            return NextResponse.next();
        }
    }
    
    // For non-API requests to protected routes, just check if the user is authenticated
    if (isProtectedRoute(req.nextUrl.pathname)) {
        if (!accessToken) {
            try {
                // Try to refresh the token if there's no access token
                const refreshedResponse = await refreshToken(req);
                
                if (refreshedResponse) {
                    // Token refreshed, continue with the request
                    return NextResponse.next();
                } else {
                    // Redirect to login
                    return redirectToLogin(req);
                }
            } catch {
                // Redirect to login on error
                return redirectToLogin(req);
            }
        }
    }
    
    // Continue with the request for all other cases
    return NextResponse.next();
}

// Helper function to refresh the token
async function refreshToken(req: NextRequest): Promise<NextResponse | null> {
    try {
        const refreshResponse = await fetch(API_URLS.AUTH.REFRESH, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                Cookie: req.cookies.toString(),
            },
        });

        if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            
            // Extract the new token from the response based on API documentation
            const newAccessToken = data.data?.token?.access_token;
            
            if (newAccessToken) {
                // Create a new response
                const response = NextResponse.next();
                
                // Set the new access token cookie
                response.cookies.set({
                    name: "accessToken",
                    value: newAccessToken,
                    path: "/",
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict"
                });
                
                return response;
            }
        }
        
        // If we reach here, token refresh failed
        return null;
    } catch (err) {
        console.error("Token refresh error:", err);
        return null;
    }
}

// Helper function to redirect to login
function redirectToLogin(req: NextRequest): NextResponse {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?returnUrl=${encodeURIComponent(req.nextUrl.pathname)}`;
    
    const response = NextResponse.redirect(url);
    
    // Clear the access token cookie
    response.cookies.delete("accessToken");
    
    return response;
}

// Helper function to check if a route should be protected
function isProtectedRoute(pathname: string): boolean {
    const protectedRoutes = [
        '/dashboard',
        '/profile',
        '/settings',
        '/workspace'
    ];
    
    return protectedRoutes.some(route => pathname.startsWith(route));
}

// Helper function to check if a resource is public (static files, etc.)
function isPublicResource(pathname: string): boolean {
    return (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.endsWith('.ico') ||
        pathname.endsWith('.svg') ||
        pathname.endsWith('.jpg') ||
        pathname.endsWith('.jpeg') ||
        pathname.endsWith('.png') ||
        pathname.endsWith('.css') ||
        pathname.endsWith('.js')
    );
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};