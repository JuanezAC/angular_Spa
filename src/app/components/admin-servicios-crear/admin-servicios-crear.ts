import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServicioService } from '../../services/servicio/servicio-service';
import Swal from 'sweetalert2';
import { Servicio } from '../../models/servicio';

@Component({
  selector: 'app-admin-servicios-crear',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-servicios-crear.html',
  styleUrl: './admin-servicios-crear.css',
})
export class AdminServiciosCrear {
  // 🔹 Inyección del servicio
  private servicioService = inject(ServicioService);

  // 🔹 @Output: Avisar al padre cuando termine
  @Output() servicioCreado = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  // 🔹 Objeto que representa el formulario
  servicioNuevo: Servicio = {
    nombre: '',
    descripcion: '',
    duracion: 30,
    precio: 0
  };

  // 🔹 Guardar: valida, llama al servicio, resetea formulario y emite evento
  guardarServicio(): void {
    const nombre = this.servicioNuevo.nombre.trim();
    const descripcion = (this.servicioNuevo.descripcion || '').trim();
    const duracion = this.servicioNuevo.duracion;
    const precio = this.servicioNuevo.precio;

    // Validaciones
    if (!nombre || !duracion || precio <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios',
        text: 'Nombre, duración y precio son obligatorios'
      });
      return;
    }

    if (duracion <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Duración inválida',
        text: 'La duración debe ser mayor a 0 minutos'
      });
      return;
    }

    // Construir objeto limpio para enviar
    const servicioParaGuardar: Servicio = {
      nombre,
      descripcion,
      duracion,
      precio
    };

    this.servicioService.crear(servicioParaGuardar).subscribe({
      next: () => {
        // 🔹 Resetear formulario
        this.servicioNuevo = {
          nombre: '',
          descripcion: '',
          duracion: 30,
          precio: 0
        };

        Swal.fire({
          icon: 'success',
          title: 'Servicio creado',
          text: 'El servicio se guardó correctamente'
        });

        // 🔹 Avisar al padre: "ya creé el servicio, recarga la lista"
        this.servicioCreado.emit();
      },
      error: (err) => {
        // Manejo de errores 401/403 (aunque en admin debería estar autenticado)
        if (err.status === 401 || err.status === 403) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'No tienes permisos para realizar esta acción'
          });
          return;
        }
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.mensaje || 'Ocurrió un error al crear el servicio'
        });
      }
    });
  }

  // 🔹 Cerrar/Cancelar: avisa al padre sin guardar
  cerrar(): void {
    this.cancelar.emit();
  }
}