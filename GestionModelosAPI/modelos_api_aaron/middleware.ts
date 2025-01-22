import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api/(.*)']);

export default clerkMiddleware(async (auth, request) => {
  // Excluir rutas públicas (incluyendo el webhook)
  if (isPublicRoute(request)) {
    return; // No aplicar autenticación para estas rutas
  }


  try {
    await auth.protect(); 
  } catch (error) {
    console.error('Error de autenticación en middleware:', error);
  }
});


export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/api/:path*',  // Este patrón debería ser suficiente para las rutas de API
  ],
};