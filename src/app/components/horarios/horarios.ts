import { ChangeDetectorRef, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorarioService } from '../../services/horario/horario-service';
import { CitaService } from '../../services/cita/cita-service';
import { ServicioService } from '../../services/servicio/servicio-service';
import { UsuarioService } from '../../services/usuario/usuario-service';
import { SesionService } from '../../services/sesion/sesion-service';
import { HorarioDisponible } from '../../models/horario-disponible';
import { Cita } from '../../models/cita';
import { Servicio } from '../../models/servicio';
import { Usuario } from '../../models/usuario';
import { Observable, catchError, map, of, startWith, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ProSerService } from '../../services/proSer/pro-ser-service';
import { ProfesionalServicio } from '../../models/profesional-servicio';
import { EventosService } from '../../services/eventos/eventos-service';

interface HorarioState {
  loading: boolean;
  data: HorarioDisponible[];
  error: string | null;
}

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './horarios.html',
  styleUrl: './horarios.css'
})
export class Horarios implements OnInit, OnDestroy {
  private horarioService = inject(HorarioService);
  private citaService = inject(CitaService);
  private servicioService = inject(ServicioService);
  private usuarioService = inject(UsuarioService);
  private sesionService = inject(SesionService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private proSerService = inject(ProSerService);
  private eventosService = inject(EventosService);

  estado$!: Observable<HorarioState>;
  textoFiltro: string = '';
  private sub = new Subscription();

  servicios: Servicio[] = [];
  usuarios: Usuario[] = [];
  usuarioSesion: any = null;
  esAdmin: boolean = false;

  servicioSeleccionado: { [key: number]: number } = {};
  usuarioSeleccionado: { [key: number]: number } = {};
  serviciosPorProfesional: { [key: number]: Servicio[] } = {};

  constructor() {
    this.estado$ = of({ loading: true, data: [], error: null });
  }

  ngOnInit(): void {
    this.cargarServicios();
    this.cargarAsignacionesYHorarios();
    this.sub.add(this.eventosService.onHorarios().subscribe(() => {
      this.recargarLista();
    }));
    this.sesionService.obtenerSesion().subscribe({
      next: (sesion) => {
        if (sesion) {
          this.usuarioSesion = sesion;
          this.esAdmin = sesion.rol === 'ADMIN';
          if (this.esAdmin) {
            this.usuarioService.obtenerTodos().subscribe({
              next: (data) => this.usuarios = data.filter(u => u.rol === 'CLIENTE'),
              error: (err) => console.error('Error al cargar usuarios', err)
            });
          }
        } else {
          this.esAdmin = false;
        }
      },
      error: () => {
        this.esAdmin = false;
      }
    });
  }

  cargarHorariosDisponibles(): Observable<HorarioState> {
    return this.horarioService.obtenerDisponibles().pipe(
      map((data) => ({ loading: false, data, error: null })),
      startWith({ loading: true, data: [], error: null }),
      catchError(err => {
        return of({ loading: false, data: [], error: 'Error al cargar los horarios disponibles' });
      })
    );
  }

  recargarLista(): void {
    this.estado$ = this.cargarHorariosDisponibles();
    this.cdr.markForCheck();
  }

  cargarServicios(): void {
    this.servicioService.obtenerTodos().subscribe({
      next: (data) => this.servicios = data,
      error: (err) => console.error('Error al cargar servicios', err)
    });
  }

  cargarAsignacionesYHorarios(): void {
    this.proSerService.obtenerTodos().subscribe({
      next: (asignaciones: ProfesionalServicio[]) => {
        this.poblarServiciosPorProfesional(asignaciones);
        this.estado$ = this.cargarHorariosDisponibles();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar asignaciones pro-ser', err);
        this.estado$ = this.cargarHorariosDisponibles();
        this.cdr.markForCheck();
      }
    });
  }

  private poblarServiciosPorProfesional(asignaciones: ProfesionalServicio[]): void {
    asignaciones.forEach(asp => {
      const proId = asp.profesional?.id;
      const servicio = asp.servicio as Servicio;
      if (proId && servicio) {
        if (!this.serviciosPorProfesional[proId]) {
          this.serviciosPorProfesional[proId] = [];
        }
        this.serviciosPorProfesional[proId].push(servicio);
      }
    });
  }

  obtenerServiciosPorProfesional(profesionalId: number | undefined): Servicio[] {
    if (!profesionalId) return this.servicios;
    const asignados = this.serviciosPorProfesional[profesionalId];
    if (asignados && asignados.length > 0) return asignados;
    return this.servicios;
  }

  filtrarHorarios(horarios: HorarioDisponible[]): HorarioDisponible[] {
    if (!this.textoFiltro.trim()) return horarios;
    const f = this.textoFiltro.toLowerCase();
    return horarios.filter(h =>
      h.fecha?.toString().includes(f) ||
      h.hora?.toString().includes(f) ||
      h.profesional?.nombre?.toLowerCase().includes(f) ||
      h.profesional?.especialidad?.toLowerCase().includes(f)
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  reservar(horario: HorarioDisponible): void {
    const servicioId = this.servicioSeleccionado[horario.id!];
    const usuarioId = this.usuarioSeleccionado[horario.id!] ?? this.usuarioSesion?.id;

    if (!servicioId) {
      Swal.fire({ icon: 'warning', title: 'Selecciona un servicio', text: 'Debes elegir un servicio para reservar' });
      return;
    }
    if (!usuarioId) {
      Swal.fire({ icon: 'warning', title: 'Usuario no identificado', text: 'Debes iniciar sesión o seleccionar un usuario' });
      return;
    }

    if (horario.profesional && !horario.profesional.estado) {
      Swal.fire({ icon: 'warning', title: 'Profesional inactivo', text: 'Este profesional no está disponible para reservas' });
      return;
    }

    const observacionReserva = this.esAdmin
    ? 'Reserva realizada por administrador'
    : 'Reserva web';

    const citaParaEnviar: Cita = {
      fecha: horario.fecha,
      hora: horario.hora,
      observacion: observacionReserva,
      usuario: { id: usuarioId } as any,
      profesional: { id: horario.profesional?.id } as any,
      servicio: { id: servicioId } as any,
      horario: { id: horario.id } as any
    };

    this.citaService.crear(citaParaEnviar).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Cita reservada!',
          text: `Reservado para el ${horario.fecha} a las ${horario.hora}`
        }).then(() => {
          this.recargarLista();
        });
      },
      error: (err) => {
        if (err.status === 401) { this.router.navigate(['/login']); return; }
        if (err.status === 403) {
          Swal.fire('Acceso denegado', 'Requiere rol de administrador', 'error');
          return;
        }
        if (err.status === 409) {
          Swal.fire({
            icon: 'warning',
            title: 'Horario no disponible',
            text: 'Este horario acaba de ser reservado por otro usuario. Por favor selecciona otro horario.'
          }).then(() => {
            this.recargarLista();
          });
          return;
        }
        Swal.fire({
          icon: 'error',
          title: 'Error al reservar',
          text: err.error?.mensaje || 'No se pudo agendar la cita. Verifica que el horario siga disponible.'
        });
      }
    });
  }
}
