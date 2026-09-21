import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DecodedJwtToken, decodeToken } from './lib/auth';
import { JWTPayload } from 'jose';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("Path name: ", pathname);
  
  // 1. Bypass standard Next.js internal paths and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Extract the clientCode from the URL
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return NextResponse.next();
  }
  const clientCode = segments[0];


  // 3. Identify if the user is currently trying to access the login page
  const isLoginPage = pathname.endsWith('/login');
  console.log("Is login page : ", isLoginPage);

  // 4. Retrieve the cookie name from environment variables
  const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME;
  console.log("cookie name : ", cookieName);
  
  if (!cookieName) {
    console.error("NEXT_PUBLIC_COOKIE_NAME is missing in environment variables.");
    // Fail open or closed depending on your security preference. 
    // Allowing next() prevents breaking the app if the ENV fails to load temporarily.
    return NextResponse.next(); 
  }

  // 5. Extract the token from the request cookies
  const token = request.cookies.get(cookieName)?.value;
  console.log("token : ", token);

  // 6. Redirect to login if no token exists (avoiding redirect loops on the login page itself)
  if (!token && !isLoginPage) {
    
    const loginUrl = new URL(`/${clientCode}/login`, request.url);
    console.log("Login page : ", loginUrl);
    return NextResponse.redirect(loginUrl);
  }

  // 7. Redirect to dashboard/select role if they have a token but try to view the login page
  if (token && isLoginPage) {
    const decodedToken:DecodedJwtToken = await decodeToken(token);
    console.log("Decoded token : ", decodedToken);
    const roles = decodedToken.roles;
    console.log("Roles : ", roles);
    if (roles.length === 1) {
        const dashboardUrl = new URL(`/${clientCode}/${roles[0].toLowerCase()}`, request.url);
        console.log("Dashboard: ", dashboardUrl);
        return NextResponse.redirect(dashboardUrl);
    };
    if (roles.length > 1) {
        const selectRoleUrl = new URL(`/${clientCode}/selectrole`);
        return NextResponse.redirect(selectRoleUrl);
    }
}

  return NextResponse.next();
}

// Config matcher targets all paths but uses a regex negative lookahead 
// to automatically ignore static assets, images, and api routes.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};