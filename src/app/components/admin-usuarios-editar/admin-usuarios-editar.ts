import { Component, inject, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario/usuario-service';
import Swal from 'sweetalert2';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-admin-usuarios-editar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-usuarios-editar.html',
  styleUrl: './admin-usuarios-editar.css'
})
export class AdminUsuariosEditar implements OnChanges {
  private usuarioService = inject(UsuarioService);
  @Input() usuario: Usuario | null = null;
  @Output() usuarioEditado = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  usuarioEditando: Usuario = { nombre: '', correo: '', rol: 'CLIENTE' };
  contrasenaNueva: string = ''; // Solo se envía si el admin escribe algo nuevo

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuario'] && this.usuario) {
      this.usuarioEditando = {
        id: this.usuario.id,
        nombre: this.usuario.nombre,
        correo: this.usuario.correo,
        rol: this.usuario.rol
      };
      this.contrasenaNueva = ''; // Reset campo contraseña al abrir modal
    }
  }

  guardarCambios(): void {
    const id = this.usuarioEditando.id;
    if (!id) { Swal.fire('Error', 'ID no encontrado', 'error'); return; }

    const nombre = this.usuarioEditando.nombre?.trim() || '';
    const correo = this.usuarioEditando.correo?.trim() || '';
    const rol = this.usuarioEditando.rol || 'CLIENTE';
    const contrasena = this.contrasenaNueva.trim();

    if (!nombre || !correo) {
      Swal.fire('Campos obligatorios', 'Nombre y correo son requeridos', 'warning'); return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      Swal.fire('Correo inválido', 'Ingresa un correo electrónico válido', 'warning'); return;
    }

    if (contrasena && contrasena.length < 6) {
      Swal.fire('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres', 'warning'); return;
    }

    
    const payload: any = { id, nombre, correo, rol };
    if (contrasena) payload.contrasena = contrasena;

    this.usuarioService.editar(id, payload as Usuario).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Usuario actualizado correctamente', 'success');
        this.usuarioEditado.emit();
      },
      error: (err) => Swal.fire('Error', err.error?.mensaje || 'Error al actualizar', 'error')
    });
  }

  cerrar(): void { this.cancelar.emit(); }
}