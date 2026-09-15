import { Component, inject, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicioService } from '../../services/servicio/servicio-service';
import { Servicio } from '../../models/servicio';
import { Observable, catchError, map, of, startWith, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminServiciosEditar } from '../admin-servicios-editar/admin-servicios-editar';
import { AdminServiciosCrear } from '../admin-servicios-crear/admin-servicios-crear';
import { SesionService } from '../../services/sesion/sesion-service';
import { EventosService } from '../../services/eventos/eventos-service';

interface ServicioState {
  loading: boolean;
  data: Servicio[];
  error: string | null;
}

@Component({
  selector: 'app-admin-servicios',
  standalone: true,
  // 🔹 AGREGAR HIJOS A LOS IMPORTS
  imports: [CommonModule, FormsModule, AdminServiciosEditar, AdminServiciosCrear],
  templateUrl: './admin-servicios.html',
  styleUrl: './admin-servicios.css'
})
export class AdminServicios implements OnInit, OnDestroy {
  private servicioService = inject(ServicioService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private sesionService = inject(SesionService);
  private eventosService = inject(EventosService);

  estado$!: Observable<ServicioState>;
  textoFiltro: string = '';
  private sub = new Subscription();

  modalCrearAbierto = false;
  modalEditarAbierto = false;
  servicioSeleccionado: Servicio | null = null;

  ngOnInit(): void {
    this.sesionService.obtenerSesion().subscribe({
      next: (sesion) => {
        if (!sesion || sesion.rol !== 'ADMIN') {
          Swal.fire('Acceso denegado', 'Debes iniciar sesión como administrador', 'warning');
          this.router.navigate(['/login']);
          return;
        }
        this.estado$ = this.cargarServicios();
        this.sub.add(this.eventosService.onServicios().subscribe(() => {
          this.recargarLista();
        }));
      },
      error: () => this.router.navigate(['/login'])
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  cargarServicios(): Observable<ServicioState> {
    return this.servicioService.obtenerTodos().pipe(
      map(data => ({ loading: false, data, error: null })),
      startWith({ loading: true,  data: [], error: null }),
      catchError(err => {
        if (err.status === 401) this.router.navigate(['/login']);
        if (err.status === 403) this.router.navigate(['/sin-permisos']);
        return of({ loading: false,  data: [], error: 'Error al cargar servicios' });
      })
    );
  }

  recargarLista(): void {
    this.estado$ = this.cargarServicios();
    this.cdr.markForCheck();
  }

  filtrar(servicios: Servicio[]): Servicio[] {
    if (!this.textoFiltro.trim()) return servicios;
    const f = this.textoFiltro.toLowerCase();
    return servicios.filter(s => s.nombre?.toLowerCase().includes(f) || s.descripcion?.toLowerCase().includes(f));
  }

  // 🔹 ABRIR/CERRAR MODAL CREAR
  abrirModalCrear(): void { 
    this.modalCrearAbierto = true; 
  }
  cerrarModalCrear(): void { 
    this.modalCrearAbierto = false; 
  }

  // 🔹 ABRIR/CERRAR MODAL EDITAR
  abrirModalEditar(servicio: Servicio): void {
    this.servicioSeleccionado = servicio;
    this.modalEditarAbierto = true;
  }
  cerrarModalEditar(): void {
    this.modalEditarAbierto = false;
    this.servicioSeleccionado = null;
  }

  eliminar(servicio: Servicio): void {
    if (!servicio.id) return;
    Swal.fire({
      title: '¿Eliminar servicio?',
      html: `Se eliminará <b>"${servicio.nombre}"</b> permanentemente.<br><br><span style="color:#6b7280">Si algún profesional tiene este servicio asignado, deberás desasignarlo antes de eliminar.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(res => {
      if (res.isConfirmed) {
        this.servicioService.eliminar(servicio.id!).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Servicio eliminado correctamente', 'success');
            this.recargarLista();
          },
          error: (err) => {
            if (err.status === 409) {
              Swal.fire({ icon: 'warning', title: 'No se puede eliminar', text: err.error?.mensaje });
            } else {
              Swal.fire('Error', err.error?.mensaje || 'No se pudo eliminar', 'error');
            }
          }
        });
      }
    });
  }
}