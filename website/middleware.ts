import { NextRequest, NextResponse } from "next/server";
import API_URLS from "./lib/api-urls";


// FIXME: This middleware is not working as expected.
// It should let user in when they have a valid session cookie.
// But it doesn't work.
export default async function middleware(req: NextRequest) {
    // Skip middleware for public resources
    if (isPublicResource(req.nextUrl.pathname)) {
        return NextResponse.next();
    }
    
    // Check if the user has a session cookie
    const sessionCookie = req.cookies.get("session")?.value;
    
    // If there's no session and the user is trying to access a protected route,
    // check if they're logged in through the check endpoint
    if (!sessionCookie && isProtectedRoute(req.nextUrl.pathname)) {
        try {
            // Use the check endpoint to verify login status
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

    // For API requests, we may need to handle token refresh
    if (req.nextUrl.pathname.startsWith('/api')) {
        try {
            // Create the request with the original cookies
            const originalRequest = new Request(req.url, {
                method: req.method,
                headers: req.headers,
                body: req.body,
                redirect: 'manual',  // Prevent auto-redirects
                credentials: 'include'
            });

            // Make the request
            const response = await fetch(originalRequest);
            
            // Handle 401 Unauthorized by refreshing the token
            if (response.status === 401) {
                // Try to refresh the session
                const refreshedResponse = await refreshSession(req);
                
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
    
    // For non-API requests to protected routes, check if the user is authenticated
    if (isProtectedRoute(req.nextUrl.pathname)) {
        if (!sessionCookie) {
            try {
                // Try to refresh the session if there's no session cookie
                const refreshedResponse = await refreshSession(req);
                
                if (refreshedResponse) {
                    // Session refreshed, continue with the request
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

// Helper function to refresh the session
async function refreshSession(req: NextRequest): Promise<NextResponse | null> {
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
            const response = NextResponse.next();
            
            // The refresh endpoint will set the necessary cookies in its response,
            // but we need to copy those cookies to our response
            const setCookieHeader = refreshResponse.headers.get('Set-Cookie');
            if (setCookieHeader) {
                response.headers.set('Set-Cookie', setCookieHeader);
            }
            
            return response;
        }
        
        // If we reach here, session refresh failed
        return null;
    } catch (err) {
        console.error("Session refresh error:", err);
        return null;
    }
}

// Helper function to redirect to login
function redirectToLogin(req: NextRequest): NextResponse {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?returnUrl=${encodeURIComponent(req.nextUrl.pathname)}`;
    
    return NextResponse.redirect(url);
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