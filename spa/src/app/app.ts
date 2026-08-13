import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SesionService } from './services/sesion/sesion-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private router = inject(Router);
  private sesionService = inject(SesionService);

  // Observable que emite el usuario logueado o null
  sesion$ = this.sesionService.obtenerSesion();

  cerrarSesion(): void {
    this.sesionService.logout().subscribe({
      next: () => {
        // Recargamos el observable para que Angular detecte que la sesión se cerró
        this.sesion$ = this.sesionService.obtenerSesion();
        this.router.navigate(['/login']);
      },
      error: (err) => console.error('Error al cerrar sesión', err)
    });
  }
}
