import { ChangeDetectorRef, Component, inject } from '@angular/core';
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
import { Observable, catchError, map, of, startWith, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ProSerService } from '../../services/proSer/pro-ser-service';
import { ProfesionalServicio } from '../../models/profesional-servicio';

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
export class Horarios {
  private horarioService = inject(HorarioService);
  private citaService = inject(CitaService);
  private servicioService = inject(ServicioService);
  private usuarioService = inject(UsuarioService);
  private sesionService = inject(SesionService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private proSerService = inject(ProSerService);

  estado$: Observable<HorarioState>;
  textoFiltro: string = '';

  // Datos para los selects
  servicios: Servicio[] = [];
  usuarios: Usuario[] = [];
  usuarioSesion: any = null;
  esAdmin: boolean = false;

  // Selección por fila (mapeo por horario.id)
  servicioSeleccionado: { [key: number]: number } = {};
  usuarioSeleccionado: { [key: number]: number } = {};
  serviciosPorProfesional: { [key: number]: Servicio[] } = {}; // Servicios disponibles por profesional

  constructor() {
    this.estado$ = this.cargarHorarios();
    this.verificarSesion();
  }

  recargarLista(): void {
    this.estado$ = this.cargarHorarios();
    this.cdr.markForCheck(); // ← Fuerza a Angular a detectar el cambio
  }

  cargarHorarios(): Observable<HorarioState> {
    return this.horarioService.obtenerTodos().pipe(
      map((data) => {
  
      console.log('Datos crudos del backend:', data);
      
      const horariosFiltrados = data.filter(h => h.disponible && h.profesional?.estado !== false);
      console.log(' Horarios filtrados:', horariosFiltrados);

      //Retorna un objeto válido: { clave: valor }
      return { loading: false, data: horariosFiltrados, error: null };
    }),
    startWith({ loading: true, data: [], error: null }),
    catchError(err => {
      if (err.status === 401) this.router.navigate(['/login']);
      return of({ loading: false, data: [], error: 'Error al cargar los horarios' });
    })
    );
  }

  cargarDatosAuxiliares(): void {
    // Cargar servicios para el select (público)
    this.servicioService.obtenerTodos().subscribe({
      next: (data) => this.servicios = data,
      error: (err) => console.error('Error al cargar servicios', err)
    });

    // Cargar asignaciones profesional-servicio y agrupar en objeto
    this.proSerService.obtenerTodos().subscribe({
      next: (asignaciones: ProfesionalServicio[]) => {
        asignaciones.forEach(asp => {
          const proId = asp.profesional?.id;
          const servicio = asp.servicio as Servicio;
          
          if (proId && servicio) {
            // Si no existe el array para este profesional, lo creamos
            if (!this.serviciosPorProfesional[proId]) {
              this.serviciosPorProfesional[proId] = [];
            }
            // Agregamos el servicio al array del profesional
            this.serviciosPorProfesional[proId].push(servicio);
          }
        });
      },
      error: (err) => console.error('Error al cargar asignaciones pro-ser', err)
    });

    // Cargar usuarios solo si es admin
    if (this.esAdmin) {
      this.usuarioService.obtenerTodos().subscribe({
        next: (data) => this.usuarios = data.filter(u => u.rol === 'CLIENTE'),
        error: (err) => console.error('Error al cargar usuarios', err)
      });
    }
  }

  
  obtenerServiciosPorProfesional(profesionalId: number | undefined): Servicio[] {
    if (!profesionalId) return [];
    return this.serviciosPorProfesional[profesionalId] || [];
  }

  verificarSesion(): void {
    this.sesionService.obtenerSesion().subscribe({
      next: (sesion) => {
        if (sesion) {
          this.usuarioSesion = sesion;
          this.esAdmin = sesion.rol === 'ADMIN';
        } else {
          this.esAdmin = false;
        }
        this.cargarDatosAuxiliares();
      },
      error: () => {
        this.esAdmin = false;
        this.cargarDatosAuxiliares();
      }
    });
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

  reservar(horario: HorarioDisponible): void {
    const servicioId = this.servicioSeleccionado[horario.id!];
    const usuarioId = this.usuarioSeleccionado[horario.id!] ?? this.usuarioSesion?.id;

    // Validaciones
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
          // Recargar la lista para actualizar disponibilidad
          this.recargarLista();
        });
      },
      error: (err) => {
        if (err.status === 401) { this.router.navigate(['/login']); return; }
        if (err.status === 403) { 
          Swal.fire('Acceso denegado', 'Requiere rol de administrador', 'error'); 
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
