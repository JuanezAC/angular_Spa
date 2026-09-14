import { Component, inject, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../services/cita/cita-service';
import { Cita } from '../../models/cita';
import { Observable, catchError, map, of, startWith, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SesionService } from '../../services/sesion/sesion-service';
import { EventosService } from '../../services/eventos/eventos-service';

interface CitaState {
  loading: boolean;
  data: Cita[];
  error: string | null;
}

@Component({
  selector: 'app-admin-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-citas.html',
  styleUrl: './admin-citas.css'
})
export class AdminCitas implements OnInit, OnDestroy {
  private citaService = inject(CitaService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private sesionService = inject(SesionService);
  private eventosService = inject(EventosService);

  estado$!: Observable<CitaState>;
  textoFiltro: string = '';
  private sub = new Subscription();

  ngOnInit(): void {
    this.sesionService.obtenerSesion().subscribe({
      next: (sesion) => {
        if (!sesion || sesion.rol !== 'ADMIN') {
          Swal.fire('Acceso denegado', 'Debes iniciar sesión como administrador', 'warning');
          this.router.navigate(['/login']);
          return;
        }
        this.estado$ = this.cargarCitas();
        this.sub.add(this.eventosService.onCitas().subscribe(() => {
          this.recargarLista();
        }));
      },
      error: () => this.router.navigate(['/login'])
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  cargarCitas(): Observable<CitaState> {
    return this.citaService.obtenerTodas().pipe(
      map(data => ({ loading: false, data, error: null })),
      startWith({ loading: true, data: [], error: null }),
      catchError(err => {
        if (err.status === 401) this.router.navigate(['/login']);
        if (err.status === 403) this.router.navigate(['/sin-permisos']);
        return of({ loading: false, data: [], error: 'Error al cargar las citas' });
      })
    );
  }

  recargarLista(): void {
    this.estado$ = this.cargarCitas();
    this.cdr.markForCheck();
  }

  filtrarCitas(citas: Cita[]): Cita[] {
    if (!this.textoFiltro.trim()) return citas;
    const f = this.textoFiltro.toLowerCase();
    return citas.filter(c =>
      c.fecha?.toString().includes(f) ||
      c.hora?.toString().includes(f) ||
      c.usuario?.nombre?.toLowerCase().includes(f) ||
      c.profesional?.nombre?.toLowerCase().includes(f) ||
      c.servicio?.nombre?.toLowerCase().includes(f) ||
      c.observacion?.toLowerCase().includes(f)
    );
  }

  cancelarCita(cita: Cita): void {
    if (!cita.id) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se encontró el ID de la cita' });
      return;
    }
    Swal.fire({
      title: '¿Cancelar esta cita?',
      html: `
        <p style="margin:6px 0"><b>Usuario:</b> ${cita.usuario?.nombre || 'N/A'}</p>
        <p style="margin:6px 0"><b>Profesional:</b> ${cita.profesional?.nombre || 'N/A'}</p>
        <p style="margin:6px 0"><b>Servicio:</b> ${cita.servicio?.nombre || 'N/A'}</p>
        <p style="margin:6px 0"><b>Fecha/Hora:</b> ${cita.fecha} a las ${cita.hora}</p>
        <p style="color: var(--color-error); font-weight: bold; margin-top: 12px;">Esta acción liberará el horario para nuevas reservas.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar cita',
      cancelButtonText: 'No, mantener',
      confirmButtonColor: 'var(--color-error)'
    }).then(res => {
      if (res.isConfirmed) {
        this.citaService.eliminar(cita.id!).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Cancelada', text: 'La cita fue cancelada correctamente' });
            this.recargarLista();
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
