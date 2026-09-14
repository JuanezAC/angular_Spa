import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicioService } from '../../services/servicio/servicio-service';
import Swal from 'sweetalert2';
import { Servicio } from '../../models/servicio';

@Component({
  selector: 'app-admin-servicios-crear',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-servicios-crear.html',
  styleUrl: './admin-servicios-crear.css',
})
export class AdminServiciosCrear {
  private servicioService = inject(ServicioService);

  @Output() servicioCreado = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  servicioNuevo: Servicio = {
    nombre: '',
    descripcion: '',
    duracion: 30,
    precio: 0,
    imagenUrl: ''
  };

  imagenError = false;

  onImagenUrlChange(): void {
    this.imagenError = false;
  }

  guardarServicio(): void {
    const nombre = this.servicioNuevo.nombre.trim();
    const descripcion = (this.servicioNuevo.descripcion || '').trim();
    const duracion = this.servicioNuevo.duracion;
    const precio = this.servicioNuevo.precio;

    if (!nombre || !duracion || precio <= 0) {
      Swal.fire({ icon: 'warning', title: 'Campos obligatorios', text: 'Nombre, duracion y precio son obligatorios' });
      return;
    }
    if (duracion <= 0) {
      Swal.fire({ icon: 'warning', title: 'Duracion invalida', text: 'La duracion debe ser mayor a 0 minutos' });
      return;
    }

    const servicioParaGuardar: Servicio = {
      nombre,
      descripcion,
      duracion,
      precio,
      imagenUrl: (this.servicioNuevo.imagenUrl || '').trim()
    };

    this.servicioService.crear(servicioParaGuardar).subscribe({
      next: () => {
        this.servicioNuevo = { nombre: '', descripcion: '', duracion: 30, precio: 0, imagenUrl: '' };
        this.imagenError = false;
        Swal.fire({ icon: 'success', title: 'Servicio creado', text: 'El servicio se guardo correctamente' });
        this.servicioCreado.emit();
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'No tienes permisos para realizar esta accion' });
          return;
        }
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.mensaje || 'Ocurrio un error al crear el servicio' });
      }
    });
  }

  cerrar(): void {
    this.cancelar.emit();
  }
}
