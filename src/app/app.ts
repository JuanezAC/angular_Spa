import { Component, inject, OnInit } from '@angular/core';
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
export class App implements OnInit {
  private router = inject(Router);
  private sesionService = inject(SesionService);

  sesion$ = this.sesionService.sesion$;

  ngOnInit(): void {
    this.sesionService.refrescarSesion();
  }

  cerrarSesion(): void {
    this.sesionService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => console.error('Error al cerrar sesión', err)
    });
  }
}
