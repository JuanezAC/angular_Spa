import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario/usuario-service';
import { Usuario } from '../../models/usuario';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);

  nombre: string = '';
  correo: string = '';
  contrasena: string = '';

  registrar(): void {
    const nombreLimpio = this.nombre.trim();
    const correoLimpio = this.correo.trim();
    const pass = this.contrasena.trim();

    if (!nombreLimpio || !correoLimpio || !pass) {
      Swal.fire({ icon: 'warning', title: 'Campos obligatorios', text: 'Todos los campos son requeridos' });
      return;
    }

    const nuevoUsuario: Usuario = {
      nombre: nombreLimpio,
      correo: correoLimpio,
      contrasena: pass
    };

    this.usuarioService.registrar(nuevoUsuario).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Registro exitoso', text: 'Tu cuenta ha sido creada. Ya puedes iniciar sesión' });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.mensaje || 'Error al registrar el usuario' });
      }
    });
  }
}