import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HorarioDisponible } from '../../models/horario-disponible';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HorarioService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/horarios`;

  obtenerTodos(): Observable<HorarioDisponible[]> {
    return this.http.get<HorarioDisponible[]>(this.apiUrl);
  }

  obtenerPorProfesional(id: number): Observable<HorarioDisponible[]> {
    return this.http.get<HorarioDisponible[]>(`${this.apiUrl}/profesional/${id}`);
  }

  crear(horario: HorarioDisponible) {
    return this.http.post(this.apiUrl, horario, { withCredentials: true });
  }

  editar(id: number, horario: HorarioDisponible) {
    return this.http.put(`${this.apiUrl}/${id}`, horario, { withCredentials: true });
  }

  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}