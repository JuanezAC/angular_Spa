import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../services/cita/cita-service';
import { Cita } from '../../models/cita';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SesionService } from '../../services/sesion/sesion-service';

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
export class AdminCitas implements OnInit {
  private citaService = inject(CitaService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private sesionService = inject(SesionService);

  estado$: Observable<CitaState>;
  textoFiltro: string = '';

  ngOnInit(): void {
    this.sesionService.obtenerSesion().subscribe({
      next: (sesion) => {
        if (!sesion || sesion.rol !== 'ADMIN') {
          Swal.fire('Acceso denegado', 'Debes iniciar sesión como administrador', 'warning');
          this.router.navigate(['/login']);
          return;
        }
        this.estado$ = this.cargarCitas();
      },
      error: () => this.router.navigate(['/login'])
    });
  }

  cargarCitas(): Observable<CitaState> {
    return this.citaService.obtenerTodas().pipe( // ← OBTENER TODAS, no solo las del usuario
     //Guarda los datos y quita el login
      map(data => ({ loading: false, data, error: null })),
      //Al iniciar muestra que esta cargando
      startWith({ loading: true, data: [], error: null }),
      //Si existe un error muestra que no ah iniciado sesion, es un usuario o otro error
      catchError(err => {
        if (err.status === 401) this.router.navigate(['/login']);
        if (err.status === 403) this.router.navigate(['/sin-permisos']);
        return of({ loading: false, data: [], error: 'Error al cargar las citas' });
      })
    );
  }
  //Recarga las citas y fuerza actualizaciones
  recargarLista(): void {
    this.estado$ = this.cargarCitas();
    this.cdr.markForCheck();
  }

  filtrarCitas(citas: Cita[]): Cita[] {
    //Si esta vacio muestra todo
    if (!this.textoFiltro.trim()) return citas;
    //Retorna lo agregado a minusculas
    const f = this.textoFiltro.toLowerCase();
    //Retorna lo encontrado
    return citas.filter(c =>
      c.fecha?.toString().includes(f) ||
      c.hora?.toString().includes(f) ||
      c.usuario?.nombre?.toLowerCase().includes(f) ||
      c.profesional?.nombre?.toLowerCase().includes(f) ||
      c.servicio?.nombre?.toLowerCase().includes(f) ||
      c.observacion?.toLowerCase().includes(f)
    );
  }
  //Verifica el id de la cita si no muestra error con imagenes
  cancelarCita(cita: Cita): void {
    if (!cita.id) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se encontró el ID de la cita' });
      return;
    }
    //Se asegura que el usuario este consciente de lo que hara mostrando o que borrara
    Swal.fire({
      title: '¿Cancelar esta cita?',
      html: `
        <p><b>Usuario:</b> ${cita.usuario?.nombre || 'N/A'}</p>
        <p><b>Profesional:</b> ${cita.profesional?.nombre || 'N/A'}</p>
        <p><b>Servicio:</b> ${cita.servicio?.nombre || 'N/A'}</p>
        <p><b>Fecha/Hora:</b> ${cita.fecha} a las ${cita.hora}</p>
        <p style="color: #dc2626; font-weight: bold; margin-top: 8px;">⚠️ Esta acción liberará el horario para nuevas reservas.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      //Confirma y borra
      confirmButtonText: 'Sí, cancelar cita',
      //Retorna
      cancelButtonText: 'No, mantener',
      confirmButtonColor: '#dc2626'
    }).then(res => {
      //Si se borra
      if (res.isConfirmed) {
        //Elimina
        this.citaService.eliminar(cita.id!).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Cancelada', text: 'La cita fue cancelada correctamente' });
            this.recargarLista(); // ← Recarga con patrón de clase
          },
          //Muestra errores
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