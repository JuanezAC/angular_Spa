import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicioService } from '../../services/servicio/servicio-service';
import { Servicio } from '../../models/servicio';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { Router } from '@angular/router';

interface ServicioState {
  loading: boolean;
  data: Servicio[];
  error: string | null;
}

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css'
})
export class Servicios {
  private servicioService = inject(ServicioService);
  private router = inject(Router);

  estado$: Observable<ServicioState>;
  textoFiltro: string = '';

  constructor() {
    this.estado$ = this.cargarServicios();
  }

  cargarServicios(): Observable<ServicioState> {
    return this.servicioService.obtenerTodos().pipe(
      map(data => ({ loading: false, data, error: null })),
      startWith({ loading: true, data: [], error: null }),
      catchError(err => {
        if (err.status === 401) this.router.navigate(['/login']);
        if (err.status === 403) this.router.navigate(['/sin-permisos']);
        return of({ loading: false, data: [], error: 'Error al cargar los servicios' });
      })
    );
  }

  filtrarServicios(servicios: Servicio[]): Servicio[] {
    if (!this.textoFiltro.trim()) return servicios;
    const f = this.textoFiltro.toLowerCase();
    return servicios.filter(s =>
      s.nombre?.toLowerCase().includes(f) ||
      s.descripcion?.toLowerCase().includes(f) ||
      s.id?.toString().includes(f)
    );
  }
}