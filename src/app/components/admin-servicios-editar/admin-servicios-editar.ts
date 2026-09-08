import { Component, inject, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServicioService } from '../../services/servicio/servicio-service';
import { Servicio } from '../../models/servicio';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-servicios-editar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-servicios-editar.html',
  styleUrl: './admin-servicios-editar.css'
})
export class AdminServiciosEditar implements OnChanges {
  // 🔹 Inyección del servicio
  private servicioService = inject(ServicioService);

  // 🔹 @Input: El padre pasa el servicio a editar
  @Input() servicio: Servicio | null = null;

  // 🔹 @Output: Avisar al padre cuando termine
  @Output() servicioEditado = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  // 🔹 Objeto interno para el formulario
  servicioEditando: Servicio = {
    nombre: '',
    descripcion: '',
    duracion: 30,
    precio: 0
  };

  // 🔹 ngOnChanges: Se ejecuta cuando el padre pasa un nuevo servicio
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['servicio'] && this.servicio) {
      // Copiamos los datos para editar sin mutar el original
      this.servicioEditando = {
        id: this.servicio.id,
        nombre: this.servicio.nombre,
        descripcion: this.servicio.descripcion || '',
        duracion: this.servicio.duracion,
        precio: this.servicio.precio
      };
    }
  }

  // 🔹 Guardar cambios: valida, llama al servicio y emite evento
  guardarCambios(): void {
    const id = this.servicioEditando.id;
    const nombre = this.servicioEditando.nombre.trim();
    const descripcion = (this.servicioEditando.descripcion || '').trim();
    const duracion = this.servicioEditando.duracion;
    const precio = this.servicioEditando.precio;

    if (!id) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se encontró el ID del servicio' });
      return;
    }
    if (!nombre || !duracion || precio <= 0) {
      Swal.fire({ icon: 'warning', title: 'Campos obligatorios', text: 'Nombre, duración y precio son requeridos' });
      return;
    }

    if (duracion <= 0) {
      Swal.fire({ icon: 'warning', title: 'Duración inválida', text: 'La duración debe ser mayor a 0 minutos' });
      return;
    }

    const actualizado: Servicio = { id, nombre, descripcion, duracion, precio };

    this.servicioService.editar(id, actualizado).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Servicio actualizado correctamente' });
        this.servicioEditado.emit(); // 🔹 Avisar al padre para que recargue la lista
      },
      error: (err) => Swal.fire({ icon: 'error', title: 'Error', text: err.error?.mensaje || 'Error al actualizar' })
    });
  }

  // 🔹 Cerrar/Cancelar: avisa al padre sin guardar
  cerrar(): void {
    this.cancelar.emit();
  }
}