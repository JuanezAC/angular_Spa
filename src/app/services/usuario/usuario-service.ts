import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../../models/usuario';

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/usuarios';

  obtenerTodos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl, { withCredentials: true });
  }

  crear(usuario: Usuario) {
    return this.http.post(this.apiUrl, usuario, { withCredentials: true });
  }

  registrar(usuario: Usuario) {
    return this.http.post(`${this.apiUrl}/registro`, usuario);
  }

  editar(id: number, usuario: Usuario) {
    return this.http.put(`${this.apiUrl}/${id}`, usuario, { withCredentials: true });
  }

  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
