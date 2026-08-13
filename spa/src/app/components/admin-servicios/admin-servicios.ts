import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ServicioService } from '../../services/servicio/servicio-service';
import { Servicio } from '../../models/servicio';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
// 🔹 IMPORTAR COMPONENTES HIJOS
import { AdminServiciosEditar } from '../admin-servicios-editar/admin-servicios-editar';
import { AdminServiciosCrear } from '../admin-servicios-crear/admin-servicios-crear';

interface ServicioState {
  loading: boolean;
  data: Servicio[];
  error: string | null;
}

@Component({
  selector: 'app-admin-servicios',
  standalone: true,
  // 🔹 AGREGAR HIJOS A LOS IMPORTS
  imports: [CommonModule, FormsModule, RouterLink, AdminServiciosEditar, AdminServiciosCrear],
  templateUrl: './admin-servicios.html',
  styleUrl: './admin-servicios.css'
})
export class AdminServicios {
  private servicioService = inject(ServicioService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  estado$: Observable<ServicioState>;
  textoFiltro: string = '';

  // 🔹 ESTADO DE MODALES
  modalCrearAbierto = false;
  modalEditarAbierto = false;
  servicioSeleccionado: Servicio | null = null;

  constructor() { this.estado$ = this.cargarServicios(); }

  cargarServicios(): Observable<ServicioState> {
    return this.servicioService.obtenerTodos().pipe(
      map(data => ({ loading: false, data, error: null })),
      startWith({ loading: true,  data: [], error: null }),
      catchError(err => {
        if (err.status === 401) this.router.navigate(['/login']);
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
      text: `Se eliminará "${servicio.nombre}" permanentemente.`,
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
          error: (err) => Swal.fire('Error', err.error?.mensaje || 'No se pudo eliminar', 'error')
        });
      }
    });
  }
}