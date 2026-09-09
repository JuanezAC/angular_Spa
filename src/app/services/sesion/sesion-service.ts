import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs'; // ← Importar catchError y of
import { UsuarioSesion } from '../../models/usuario-sesion';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SesionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/sesion`;

  login(correo: string, contrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { correo, contrasena }, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }

  obtenerSesion(): Observable<UsuarioSesion | null> {
    return this.http.get<UsuarioSesion>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
      // Si el backend responde 401 (no hay sesión), devolvemos null en lugar de propagar el error
      catchError(() => of(null))
    );
  }
}
