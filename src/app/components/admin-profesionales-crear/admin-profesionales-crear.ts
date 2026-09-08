import { Component, EventEmitter, inject, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfesionalService } from '../../services/profesional/profesional-service';
import { ServicioService } from '../../services/servicio/servicio-service';
import { ProSerService } from '../../services/proSer/pro-ser-service';
import Swal from 'sweetalert2';
import { Profesional } from '../../models/profesional';
import { Servicio } from '../../models/servicio';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-profesionales-crear',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-profesionales-crear.html',
  styleUrl: './admin-profesionales-crear.css',
})
export class AdminProfesionalesCrear implements OnInit {
  private profesionalService = inject(ProfesionalService);
  private servicioService = inject(ServicioService);
  private proSerService = inject(ProSerService);

  @Output() profesionalCreado = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  profesionalNuevo: Profesional = { nombre: '', especialidad: '', correo: '', telefono: '', estado: true };
  serviciosDisponibles: Servicio[] = [];
  serviciosSeleccionados: number[] = [];

  ngOnInit(): void {
    this.servicioService.obtenerTodos().subscribe({
      next: (data) => this.serviciosDisponibles = data,
      error: () => Swal.fire('Error', 'No se pudieron cargar los servicios', 'error')
    });
  }

  toggleServicio(id: number): void {
    const idx = this.serviciosSeleccionados.indexOf(id);
    idx > -1 ? this.serviciosSeleccionados.splice(idx, 1) : this.serviciosSeleccionados.push(id);
  }

  async guardarProfesional(): Promise<void> {
    const nombre = this.profesionalNuevo.nombre.trim();
    const especialidad = this.profesionalNuevo.especialidad.trim();
    const correo = this.profesionalNuevo.correo.trim();
    const telefono = this.profesionalNuevo.telefono.trim();

    if (!nombre || !especialidad || !correo || !telefono) {
      Swal.fire('Campos obligatorios', 'Todos los campos básicos son requeridos', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      Swal.fire('Correo inválido', 'Ingresa un correo electrónico válido', 'warning');
      return;
    }

    if (this.serviciosSeleccionados.length === 0) {
      Swal.fire('Servicios requeridos', 'Debe asignar al menos un servicio al profesional', 'warning');
      return;
    }

    try {
      // ✅ 1. Crear profesional con type assertion para que TypeScript sepa que tiene 'id'
      const creado = await firstValueFrom(
        this.profesionalService.crear({
          nombre, especialidad, correo, telefono, estado: this.profesionalNuevo.estado
        })
      ) as { id: number }; // ← AGREGAR ESTO: le dice a TS que la respuesta tiene un 'id: number'

      // ✅ 2. Asignar servicios seleccionados (ahora creado.id sí existe para TS)
      if (creado.id && this.serviciosSeleccionados.length > 0) {
        const asignaciones = this.serviciosSeleccionados.map(serId => ({
          profesional: { id: creado.id },
          servicio: { id: serId }
        }));
        await Promise.all(asignaciones.map(a => firstValueFrom(this.proSerService.guardar(a))));
      }

      this.limpiarFormulario();
      Swal.fire('Éxito', 'Profesional y servicios asignados correctamente', 'success');
      this.profesionalCreado.emit();
    } catch (err: any) {
      Swal.fire('Error', err.error?.mensaje || 'Error al crear profesional', 'error');
    }
  }

  limpiarFormulario(): void {
    this.profesionalNuevo = { nombre: '', especialidad: '', correo: '', telefono: '', estado: true };
    this.serviciosSeleccionados = [];
  }

  cerrar(): void { this.cancelar.emit(); }
}