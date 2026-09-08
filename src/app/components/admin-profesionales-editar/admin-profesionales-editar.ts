import { Component, inject, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfesionalService } from '../../services/profesional/profesional-service';
import { ServicioService } from '../../services/servicio/servicio-service';
import { ProSerService } from '../../services/proSer/pro-ser-service';
import Swal from 'sweetalert2';
import { Profesional } from '../../models/profesional';
import { Servicio } from '../../models/servicio';
import { ProfesionalServicio } from '../../models/profesional-servicio';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-profesionales-editar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-profesionales-editar.html',
  styleUrl: './admin-profesionales-editar.css'
})
export class AdminProfesionalesEditar implements OnChanges, OnInit {
  private profesionalService = inject(ProfesionalService);
  private servicioService = inject(ServicioService);
  private proSerService = inject(ProSerService);

  @Input() profesional: Profesional | null = null;
  @Output() profesionalEditado = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  profesionalEditando: Profesional = { nombre: '', especialidad: '', correo: '', telefono: '', estado: false };
  serviciosDisponibles: Servicio[] = [];
  serviciosSeleccionados: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['profesional'] && this.profesional) {
      this.profesionalEditando = { ...this.profesional };
    }
  }

  ngOnInit(): void { this.cargarServiciosYAsignaciones(); }

  cargarServiciosYAsignaciones(): void {
    this.servicioService.obtenerTodos().subscribe(async (servicios) => {
      this.serviciosDisponibles = servicios;
      if (this.profesionalEditando.id) {
        const asignaciones = await firstValueFrom(this.proSerService.obtenerPorProfesional(this.profesionalEditando.id));
        this.serviciosSeleccionados = asignaciones.filter(a => a.servicio?.id).map(a => a.servicio!.id!);
      }
    });
  }

  toggleServicio(id: number): void {
    const idx = this.serviciosSeleccionados.indexOf(id);
    idx > -1 ? this.serviciosSeleccionados.splice(idx, 1) : this.serviciosSeleccionados.push(id);
  }

  async guardarCambios(): Promise<void> {
    const id = this.profesionalEditando.id;
    if (!id) { Swal.fire('Error', 'ID no encontrado', 'error'); return; }

    const nombre = this.profesionalEditando.nombre.trim();
    const especialidad = this.profesionalEditando.especialidad.trim();
    const correo = this.profesionalEditando.correo.trim();
    const telefono = this.profesionalEditando.telefono.trim();

    if (!nombre || !especialidad || !correo || !telefono) {
      Swal.fire('Campos obligatorios', 'Todos los campos son requeridos', 'warning'); return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      Swal.fire('Correo inválido', 'Ingresa un correo electrónico válido', 'warning'); return;
    }

    if (this.serviciosSeleccionados.length === 0) {
      Swal.fire('Servicios requeridos', 'Debe asignar al menos un servicio al profesional', 'warning'); return;
    }

    try {
      // 1. Actualizar datos del profesional
      await firstValueFrom(this.profesionalService.editar(id, {
        id, nombre, especialidad, correo, telefono, estado: this.profesionalEditando.estado
      }));

      // 2. Sincronizar asignaciones (borrar antiguas + crear nuevas)
      await this.sincronizarAsignaciones(id);

      Swal.fire('Éxito', 'Profesional y servicios actualizados', 'success');
      this.profesionalEditado.emit();
    } catch (err: any) {
      Swal.fire('Error', err.error?.mensaje || 'Error al actualizar', 'error');
    }
  }

  async sincronizarAsignaciones(profesionalId: number): Promise<void> {
    const actuales = await firstValueFrom(this.proSerService.obtenerPorProfesional(profesionalId));
    
    // Eliminar todas las existentes
    await Promise.all(actuales.map(a => firstValueFrom(this.proSerService.eliminar(a.id!))));
    
    // Crear las nuevas seleccionadas
    const nuevas = this.serviciosSeleccionados.map(serId => ({
      profesional: { id: profesionalId }, servicio: { id: serId }
    }));
    if (nuevas.length > 0) {
      await Promise.all(nuevas.map(n => firstValueFrom(this.proSerService.guardar(n))));
    }
  }

  cerrar(): void { this.cancelar.emit(); }
}