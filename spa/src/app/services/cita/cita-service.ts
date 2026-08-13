import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cita } from '../../models/cita';

@Injectable({ providedIn: 'root' })
export class CitaService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/citas';

  obtenerTodas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl, { withCredentials: true });
  }

  obtenerMisCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/mis-citas`, { withCredentials: true });
  }

  crear(cita: Cita) {
    return this.http.post(this.apiUrl, cita, { withCredentials: true });
  }

  editar(id: number, cita: Cita) {
    return this.http.put(`${this.apiUrl}/${id}`, cita, { withCredentials: true });
  }

  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}