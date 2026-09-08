import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Profesional } from '../../models/profesional';

@Injectable({ providedIn: 'root' })
export class ProfesionalService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/profesionales';

  obtenerTodos(): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(this.apiUrl, { withCredentials: true });
  }

  crear(profesional: Profesional) {
    return this.http.post(this.apiUrl, profesional, { withCredentials: true });
  }

  editar(id: number, profesional: Profesional) {
    return this.http.put(`${this.apiUrl}/${id}`, profesional, { withCredentials: true });
  }

  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}