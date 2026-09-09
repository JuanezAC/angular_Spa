import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SesionService } from '../../services/sesion/sesion-service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private router = inject(Router);
  public sesionService = inject(SesionService);

  correo: string = '';
  contrasena: string = '';

  iniciarSesion(): void {
    const correoLimpio = this.correo.trim();
    const contrasenaLimpia = this.contrasena.trim();

    if (!correoLimpio || !contrasenaLimpia) {
      Swal.fire({ icon: 'warning', title: 'Campos obligatorios', text: 'Por favor, ingresa tu correo y contraseña' });
      return;
    }

    this.sesionService.login(correoLimpio, contrasenaLimpia).subscribe({
      next: (respuesta) => {
        // Mostramos el modal y esperamos a que se cierre (por timer o clic en OK)
        Swal.fire({ 
          icon: 'success', 
          title: '¡Bienvenido!', 
          text: respuesta.mensaje || 'Inicio de sesión exitoso',
          timer: 1500,
          timerProgressBar: true
        }).then(() => {
          this.sesionService.refrescarSesion();
          this.router.navigate(['/servicios']);
        });
      },
      error: (err) => {
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.mensaje || 'Credenciales incorrectas' });
      }
    });
  }
}
