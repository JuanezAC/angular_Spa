import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfesionalService } from '../../services/profesional/profesional-service';
import { ProSerService } from '../../services/proSer/pro-ser-service';
import { Profesional } from '../../models/profesional';
import { ProfesionalServicio } from '../../models/profesional-servicio';
import { Observable, catchError, map, of, startWith, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { Servicio } from '../../models/servicio';

interface ProfesionalState {
  loading: boolean;
  data: Profesional[];
  error: string | null;
}

@Component({
  selector: 'app-profesionales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profesionales.html',
  styleUrl: './profesionales.css'
})
export class Profesionales {
  private profesionalService = inject(ProfesionalService);
  private proSerService = inject(ProSerService);
  private router = inject(Router);

  estado$: Observable<ProfesionalState>;
  textoFiltro: string = '';

  constructor() {
    this.estado$ = this.cargarProfesionales();
  }

  cargarProfesionales(): Observable<ProfesionalState> {
    return this.profesionalService.obtenerTodos().pipe(
      switchMap(profesionales => {
        if (!profesionales?.length) return of(profesionales);
        
        return this.proSerService.obtenerTodos().pipe(
          map((asignaciones: ProfesionalServicio[]) => {
            const proSerMap = new Map<number, Servicio[]>();
            
            asignaciones.forEach(asp => {
              const proId = asp.profesional?.id;
              const servicio = asp.servicio; // El backend ya serializa el objeto Servicio
              if (proId && servicio) {
                if (!proSerMap.has(proId)) proSerMap.set(proId, []);
                proSerMap.get(proId)!.push(servicio as Servicio);
              }
            });

            return profesionales.map(pro => ({
              ...pro,
              servicios: proSerMap.get(pro.id!) || []
            }));
          })
        );
      }),
      map(data => ({ loading: false, data, error: null })),
      startWith({ loading: true, data: [], error: null }),
      catchError(err => {
        if (err.status === 401) this.router.navigate(['/login']);
        if (err.status === 403) this.router.navigate(['/sin-permisos']);
        return of({ loading: false, data: [], error: 'Error al cargar los profesionales' });
      })
    );
  }

  filtrarProfesionales(profesionales: Profesional[]): Profesional[] {
    if (!this.textoFiltro.trim()) return profesionales;
    const f = this.textoFiltro.toLowerCase();
    return profesionales.filter(p =>
      p.nombre?.toLowerCase().includes(f) ||
      p.especialidad?.toLowerCase().includes(f) ||
      p.correo?.toLowerCase().includes(f)
    );
  }

  obtenerNombresServicios(servicios: Servicio[] | undefined): string {
    if (!servicios || servicios.length === 0) return 'Sin servicios asignados';
    return servicios.map(s => s.nombre).join(', ');
  }
}