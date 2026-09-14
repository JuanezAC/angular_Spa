import { Component, inject, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicioService } from '../../services/servicio/servicio-service';
import { Servicio } from '../../models/servicio';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-servicios-editar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-servicios-editar.html',
  styleUrl: './admin-servicios-editar.css'
})
export class AdminServiciosEditar implements OnChanges {
  private servicioService = inject(ServicioService);

  @Input() servicio: Servicio | null = null;
  @Output() servicioEditado = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  servicioEditando: Servicio = { nombre: '', descripcion: '', duracion: 30, precio: 0, imagenUrl: '' };
  imagenError = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['servicio'] && this.servicio) {
      this.servicioEditando = {
        id: this.servicio.id,
        nombre: this.servicio.nombre,
        descripcion: this.servicio.descripcion || '',
        duracion: this.servicio.duracion,
        precio: this.servicio.precio,
        imagenUrl: this.servicio.imagenUrl || ''
      };
      this.imagenError = false;
    }
  }

  onImagenUrlChange(): void {
    this.imagenError = false;
  }

  guardarCambios(): void {
    const id = this.servicioEditando.id;
    const nombre = this.servicioEditando.nombre.trim();
    const descripcion = (this.servicioEditando.descripcion || '').trim();
    const duracion = this.servicioEditando.duracion;
    const precio = this.servicioEditando.precio;

    if (!id) { Swal.fire({ icon: 'error', title: 'Error', text: 'No se encontro el ID del servicio' }); return; }
    if (!nombre || !duracion || precio <= 0) {
      Swal.fire({ icon: 'warning', title: 'Campos obligatorios', text: 'Nombre, duracion y precio son requeridos' }); return;
    }
    if (duracion <= 0) {
      Swal.fire({ icon: 'warning', title: 'Duracion invalida', text: 'La duracion debe ser mayor a 0 minutos' }); return;
    }

    const actualizado: Servicio = { id, nombre, descripcion, duracion, precio, imagenUrl: (this.servicioEditando.imagenUrl || '').trim() };

    this.servicioService.editar(id, actualizado).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Servicio actualizado correctamente' });
        this.servicioEditado.emit();
      },
      error: (err) => Swal.fire({ icon: 'error', title: 'Error', text: err.error?.mensaje || 'Error al actualizar' })
    });
  }

  cerrar(): void { this.cancelar.emit(); }
}
