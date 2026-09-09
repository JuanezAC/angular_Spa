import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { UsuarioSesion } from '../../models/usuario-sesion';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SesionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/sesion`;
  private sesionActual$ = new BehaviorSubject<UsuarioSesion | null>(null);
  inicializado = false;

  login(correo: string, contrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { correo, contrasena }, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.sesionActual$.next(null))
    );
  }

  obtenerSesion(): Observable<UsuarioSesion | null> {
    return this.http.get<UsuarioSesion>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
      tap(sesion => this.sesionActual$.next(sesion)),
      catchError(() => {
        this.sesionActual$.next(null);
        return of(null);
      })
    );
  }

  get sesion$(): Observable<UsuarioSesion | null> {
    return this.sesionActual$.asObservable();
  }

  refrescarSesion(): void {
    this.obtenerSesion().subscribe();
  }
}
