import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Vérifie si on est dans le navigateur (évite l'erreur SSR)
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('authToken');
    if (token) {
      return true;
    }
  }

  // Si pas connecté ou si on est en SSR, redirige vers /auth
  router.navigate(['/auth']);
  return false;
};