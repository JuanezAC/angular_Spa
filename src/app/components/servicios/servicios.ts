import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicioService } from '../../services/servicio/servicio-service';
import { Servicio } from '../../models/servicio';
import { Observable, catchError, map, of, startWith, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { EventosService } from '../../services/eventos/eventos-service';

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
export class Servicios implements OnInit, OnDestroy {
  private servicioService = inject(ServicioService);
  private router = inject(Router);
  private eventosService = inject(EventosService);
  private cdr = inject(ChangeDetectorRef);

  estado$: Observable<ServicioState>;
  textoFiltro: string = '';
  private sub = new Subscription();
  imagenesConError: Set<number> = new Set();

  constructor() {
    this.estado$ = this.cargarServicios();
  }

  ngOnInit(): void {
    this.sub.add(this.eventosService.onServicios().subscribe(() => {
      this.estado$ = this.cargarServicios();
      this.cdr.markForCheck();
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  cargarServicios(): Observable<ServicioState> {
    return this.servicioService.obtenerTodos().pipe(
      map(data => ({ loading: false, data, error: null })),
      startWith({ loading: true, data: [], error: null }),
      catchError(err => {
        if (err.status === 401) this.router.navigate(['/login']);
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

  onImageError(id: number | undefined): void {
    if (id !== undefined) this.imagenesConError.add(id);
  }

  hasImageError(id: number | undefined): boolean {
    return id !== undefined && this.imagenesConError.has(id);
  }
}
