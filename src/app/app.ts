import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SesionService } from './services/sesion/sesion-service';
import { EventosService } from './services/eventos/eventos-service';
import { LucideService } from './services/lucide/lucide-service';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private router = inject(Router);
  private sesionService = inject(SesionService);
  private eventosService = inject(EventosService);
  private lucideService = inject(LucideService);

  sesion$ = this.sesionService.sesion$;
  menuAbierto = false;

  ngOnInit(): void {
    this.sesionService.refrescarSesion();
    this.eventosService.conectar();
    this.lucideService.init();
  }

  ngOnDestroy(): void {
    this.eventosService.desconectar();
    this.lucideService.ngOnDestroy();
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
