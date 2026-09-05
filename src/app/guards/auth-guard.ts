// guards/auth-guard.ts
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // ✅ côté serveur (SSR), on ne peut pas vérifier localStorage : on laisse passer,
  // le vrai contrôle se refera côté navigateur après hydratation
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};