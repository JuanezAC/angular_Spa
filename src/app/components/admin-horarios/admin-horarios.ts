import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorarioService } from '../../services/horario/horario-service';
import { HorarioDisponible } from '../../models/horario-disponible';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminHorariosCrear } from '../admin-horarios-crear/admin-horarios-crear';
import { AdminHorariosEditar } from '../admin-horarios-editar/admin-horarios-editar';
import { SesionService } from '../../services/sesion/sesion-service';

interface HorarioState {
  loading: boolean;
  data: HorarioDisponible[];
  error: string | null;
}

@Component({
  selector: 'app-admin-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminHorariosCrear, AdminHorariosEditar],
  templateUrl: './admin-horarios.html',
  styleUrl: './admin-horarios.css'
})
//Define el componente/clase que maneja las citas del admin
export class AdminHorarios implements OnInit {
  private horarioService = inject(HorarioService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private sesionService = inject(SesionService);

  estado$!: Observable<HorarioState>;
  textoFiltro: string = '';

  modalCrearAbierto = false;
  modalEditarAbierto = false;
  horarioSeleccionado: HorarioDisponible | null = null;
  sesionVerificada = false;

  ngOnInit(): void {
    this.sesionService.obtenerSesion().subscribe({
      next: (sesion) => {
        if (!sesion || sesion.rol !== 'ADMIN') {
          Swal.fire('Acceso denegado', 'Debes iniciar sesión como administrador', 'warning');
          this.router.navigate(['/login']);
          return;
        }
        this.sesionVerificada = true;
        this.estado$ = this.cargarHorarios();
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  cargarHorarios(): Observable<HorarioState> {
    return this.horarioService.obtenerTodos().pipe(
      map(data => ({ loading: false, data, error: null })),
      startWith({ loading: true, data: [], error: null }),
      catchError(err => {
        if (err.status === 401) this.router.navigate(['/login']);
        if (err.status === 403) this.router.navigate(['/sin-permisos']);
        return of({ loading: false, data: [], error: 'Error al cargar horarios' });
      })
    );
  }

  recargarLista(): void {
    this.estado$ = this.cargarHorarios();
    this.cdr.markForCheck();
  }

  filtrar(horarios: HorarioDisponible[]): HorarioDisponible[] {
    if (!this.textoFiltro.trim()) return horarios;
    const f = this.textoFiltro.toLowerCase();
    return horarios.filter(h =>
      h.fecha?.toString().includes(f) ||
      h.hora?.toString().includes(f) ||
      h.profesional?.nombre?.toLowerCase().includes(f) ||
      h.profesional?.especialidad?.toLowerCase().includes(f)
    );
  }

  abrirModalCrear(): void { this.modalCrearAbierto = true; }
  cerrarModalCrear(): void { this.modalCrearAbierto = false; }

  abrirModalEditar(horario: HorarioDisponible): void {
    this.horarioSeleccionado = { ...horario };
    this.modalEditarAbierto = true;
  }
  cerrarModalEditar(): void {
    this.modalEditarAbierto = false;
    this.horarioSeleccionado = null;
  }

  eliminar(horario: HorarioDisponible): void {
    if (!horario.id) return;
    Swal.fire({
      title: '¿Eliminar horario?',
      html: `Se eliminará el slot del <b>${horario.fecha}</b> a las <b>${horario.hora}</b>.<br><span style="color:#dc2626">⚠️ Si tiene citas asociadas, también se cancelarán.</span>`,
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar', confirmButtonColor: '#dc2626'
    }).then(res => {
      if (res.isConfirmed) {
        this.horarioService.eliminar(horario.id!).subscribe({
          next: () => { Swal.fire('Eliminado', 'Horario eliminado correctamente', 'success'); this.recargarLista(); },
          error: (err) => {
            if (err.status === 409) Swal.fire({ icon: 'warning', title: 'No se puede eliminar', text: err.error?.mensaje });
            else Swal.fire('Error', err.error?.mensaje || 'No se pudo eliminar', 'error');
          }
        });
      }
    });
  }
}