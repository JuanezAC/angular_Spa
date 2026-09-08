import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../services/cita/cita-service';
import { Cita } from '../../models/cita';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

interface CitaState {
  loading: boolean;
  data: Cita[];
  error: string | null;
}

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-citas.html',
  styleUrl: './mis-citas.css'
})
export class MisCitas {
  private citaService = inject(CitaService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef); // ← NUEVO: Para recargar vista

  estado$: Observable<CitaState>;
  textoFiltro: string = '';

  constructor() {
    this.estado$ = this.cargarMisCitas();
  }

  cargarMisCitas(): Observable<CitaState> {
    return this.citaService.obtenerMisCitas().pipe(
      map(data => ({ loading: false, data, error: null })),
      startWith({ loading: true, data: [], error: null }),
      catchError(err => {
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
        return of({ loading: false, data: [], error: 'Error al cargar tus citas' });
      })
    );
  }

  
  recargarLista(): void {
    this.estado$ = this.cargarMisCitas();
    this.cdr.markForCheck(); // ← Fuerza a Angular a detectar el cambio
  }

  filtrarCitas(citas: Cita[]): Cita[] {
    if (!this.textoFiltro.trim()) return citas;
    const f = this.textoFiltro.toLowerCase();
    return citas.filter(c =>
      c.fecha?.toString().includes(f) ||
      c.hora?.toString().includes(f) ||
      c.profesional?.nombre?.toLowerCase().includes(f) ||
      c.servicio?.nombre?.toLowerCase().includes(f) ||
      c.observacion?.toLowerCase().includes(f)
    );
  }


  eliminarCita(cita: Cita): void {
    if (!cita.id) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se encontró el ID de la cita' });
      return;
    }

    Swal.fire({
      title: '¿Cancelar esta cita?',
      text: `Se cancelará la cita del ${cita.fecha} a las ${cita.hora} con ${cita.profesional?.nombre || 'el profesional'}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, mantener',
      confirmButtonColor: '#dc2626'
    }).then(res => {
      if (res.isConfirmed) {
        this.citaService.eliminar(cita.id!).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Cancelada', text: 'La cita fue cancelada correctamente' });
            this.recargarLista(); // ← Recarga la lista con el patrón de clase
          },
          error: (err) => {
            if (err.status === 401) { this.router.navigate(['/login']); return; }
            if (err.status === 403) {
              Swal.fire('Acceso denegado', 'No tienes permisos para cancelar esta cita', 'error');
              return;
            }
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err.error?.mensaje || 'No se pudo cancelar la cita'
            });
          }
        });
      }
    });
  }
}