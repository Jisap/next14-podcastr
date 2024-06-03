import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/']) // Rutas que no necesitan autenticación

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) auth().protect();                                    // Si la ruta no es pública se requiere autenticación -> signin o signup
});

export const config = {                                                         // Define que rutas serán interceptadas por el middleware
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],                  // Captura todas las rutas menos las que contienen un punto o dentro de _next
};

// Flujo: Acceso a ruta protegida -> middleware -> sing-up -> clerk envía a http.ts el webhook -> creación en convex del usuario
//                                              -> sign-in -> clerk establece nuevo estado al usuario en el provider -> permite el acceso al resto de rutas