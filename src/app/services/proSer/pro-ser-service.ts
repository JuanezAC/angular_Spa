import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfesionalServicio } from '../../models/profesional-servicio';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProSerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/profesional-servicios`;

  obtenerTodos(): Observable<ProfesionalServicio[]> {
    return this.http.get<ProfesionalServicio[]>(this.apiUrl);
  }

  obtenerPorProfesional(profesionalId: number): Observable<ProfesionalServicio[]> {
    return this.http.get<ProfesionalServicio[]>(`${this.apiUrl}/profesional/${profesionalId}`);
  }

  guardar(data: { profesional: {id:number}, servicio: {id:number} }): Observable<any> {
  return this.http.post(this.apiUrl, data, { withCredentials: true });
}
eliminar(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
}

}
