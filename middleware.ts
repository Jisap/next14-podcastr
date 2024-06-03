import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/']) // Rutas que no necesitan autenticación

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) auth().protect();                                    // Si la ruta no es pública se requiere autenticación
});

export const config = {                                                         // Define que rutas serán interceptadas por el middleware
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],                  // Captura todas las rutas menos las que contienen un punto o dentro de _next
};