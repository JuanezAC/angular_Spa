import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfesionalService } from '../../services/profesional/profesional-service';
import { Profesional } from '../../models/profesional';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminProfesionalesCrear } from '../admin-profesionales-crear/admin-profesionales-crear';
import { AdminProfesionalesEditar } from '../admin-profesionales-editar/admin-profesionales-editar';

interface ProfesionalState {
  loading: boolean;
  data: Profesional[];
  error: string | null;
}

@Component({
  selector: 'app-admin-profesionales',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminProfesionalesCrear, AdminProfesionalesEditar],
  templateUrl: './admin-profesionales.html',
  styleUrl: './admin-profesionales.css'
})
export class AdminProfesionales {
  private profesionalService = inject(ProfesionalService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  estado$: Observable<ProfesionalState>;
  textoFiltro: string = '';

  // Estado de modales
  modalCrearAbierto = false;
  modalEditarAbierto = false;
  profesionalSeleccionado: Profesional | null = null;

  constructor() { this.estado$ = this.cargarProfesionales(); }

  cargarProfesionales(): Observable<ProfesionalState> {
    return this.profesionalService.obtenerTodos().pipe(
      map(data => ({ loading: false, data, error: null })),
      startWith({ loading: true, data: [], error: null }),
      catchError(err => {
        if (err.status === 401) this.router.navigate(['/login']);
        return of({ loading: false, data: [], error: 'Error al cargar profesionales' });
      })
    );
  }

  recargarLista(): void {
    this.estado$ = this.cargarProfesionales();
    this.cdr.markForCheck();
  }

  filtrar(profesionales: Profesional[]): Profesional[] {
    if (!this.textoFiltro.trim()) return profesionales;
    const f = this.textoFiltro.toLowerCase();
    return profesionales.filter(p => 
      p.nombre?.toLowerCase().includes(f) || 
      p.especialidad?.toLowerCase().includes(f) ||
      p.correo?.toLowerCase().includes(f)
    );
  }

  abrirModalCrear(): void { this.modalCrearAbierto = true; }
  cerrarModalCrear(): void { this.modalCrearAbierto = false; }

  abrirModalEditar(profesional: Profesional): void {
    this.profesionalSeleccionado = { ...profesional }; // Copia segura
    this.modalEditarAbierto = true;
  }
  cerrarModalEditar(): void {
    this.modalEditarAbierto = false;
    this.profesionalSeleccionado = null;
  }

  eliminar(profesional: Profesional): void {
    if (!profesional.id) return;
    Swal.fire({
      title: '¿Eliminar profesional?',
      html: `Se eliminará <b>"${profesional.nombre}"</b>.<br><span style="color:#dc2626">⚠️ Esto también eliminará sus horarios, citas y asignaciones.</span>`,
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar TODO', cancelButtonText: 'Cancelar', confirmButtonColor: '#dc2626'
    }).then(res => {
      if (res.isConfirmed) {
        this.profesionalService.eliminar(profesional.id!).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Profesional y relaciones eliminados correctamente', 'success');
            this.recargarLista();
          },
          error: (err) => {
            if (err.status === 409) Swal.fire({ icon: 'warning', title: 'No se puede eliminar', text: err.error?.mensaje });
            else Swal.fire('Error', err.error?.mensaje || 'No se pudo eliminar', 'error');
          }
        });
      }
    });
  }
}