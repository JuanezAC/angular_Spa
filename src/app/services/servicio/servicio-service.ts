import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Servicio } from '../../models/servicio';

@Injectable({ providedIn: 'root' })
export class ServicioService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/servicios';

  obtenerTodos(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(this.apiUrl, { withCredentials: true });
  }

  crear(servicio: Servicio) {
    return this.http.post(this.apiUrl, servicio, { withCredentials: true });
  }

  editar(id: number, servicio: Servicio) {
    return this.http.put(`${this.apiUrl}/${id}`, servicio, { withCredentials: true });
  }

  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}