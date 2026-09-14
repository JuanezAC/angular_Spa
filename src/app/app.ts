import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SesionService } from './services/sesion/sesion-service';
import { EventosService } from './services/eventos/eventos-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private router = inject(Router);
  private sesionService = inject(SesionService);
  private eventosService = inject(EventosService);

  sesion$ = this.sesionService.sesion$;
  menuAbierto = false;

  ngOnInit(): void {
    this.sesionService.refrescarSesion();
    this.eventosService.conectar();
  }

  ngOnDestroy(): void {
    this.eventosService.desconectar();
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  cerrarSesion(): void {
    this.cerrarMenu();
    this.eventosService.desconectar();
    this.sesionService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => console.error('Error al cerrar sesión', err)
    });
  }
}
