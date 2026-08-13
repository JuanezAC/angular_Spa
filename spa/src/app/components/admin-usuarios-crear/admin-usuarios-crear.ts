import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario/usuario-service';
import Swal from 'sweetalert2';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-admin-usuarios-crear',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-usuarios-crear.html',
  styleUrl: './admin-usuarios-crear.css',
})
export class AdminUsuariosCrear {
  private usuarioService = inject(UsuarioService);
  @Output() usuarioCreado = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  usuarioNuevo: Partial<Usuario> = {
    nombre: '', correo: '', contrasena: '', rol: 'CLIENTE'
  };

  guardarUsuario(): void {
    const nombre = this.usuarioNuevo.nombre?.trim() || '';
    const correo = this.usuarioNuevo.correo?.trim() || '';
    const contrasena = this.usuarioNuevo.contrasena || '';
    const rol = this.usuarioNuevo.rol || 'CLIENTE';

    if (!nombre || !correo || !contrasena) {
      Swal.fire('Campos obligatorios', 'Nombre, correo y contraseña son requeridos', 'warning');
      return;
    }

    this.usuarioService.crear({ nombre, correo, contrasena, rol } as Usuario).subscribe({
      next: () => {
        this.usuarioNuevo = { nombre: '', correo: '', contrasena: '', rol: 'CLIENTE' };
        Swal.fire('Éxito', 'Usuario creado correctamente', 'success');
        this.usuarioCreado.emit();
      },
      error: (err) => Swal.fire('Error', err.error?.mensaje || 'Error al crear', 'error')
    });
  }

  cerrar(): void { this.cancelar.emit(); }
}