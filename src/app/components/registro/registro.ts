import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario/usuario-service';
import { Usuario } from '../../models/usuario';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule],
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoLimpio)) {
      Swal.fire({ icon: 'warning', title: 'Correo inválido', text: 'Ingresa un correo electrónico válido' });
      return;
    }

    if (pass.length < 6) {
      Swal.fire({ icon: 'warning', title: 'Contraseña muy corta', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    const nuevoUsuario: Usuario = {
      nombre: nombreLimpio,
      correo: correoLimpio,
      contrasena: pass,
      rol: 'CLIENTE'
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