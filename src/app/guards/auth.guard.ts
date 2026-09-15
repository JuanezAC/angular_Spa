import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from '../services/sesion/sesion-service';
import { map, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const sesionService = inject(SesionService);
  const router = inject(Router);

  return sesionService.obtenerSesion().pipe(
    map(sesion => {
      if (sesion) return true;
      router.navigate(['/login']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};

export const adminGuard: CanActivateFn = () => {
  const sesionService = inject(SesionService);
  const router = inject(Router);

  return sesionService.obtenerSesion().pipe(
    map(sesion => {
      if (sesion?.rol === 'ADMIN') return true;
      router.navigate(['/sin-permisos']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
