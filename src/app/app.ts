import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { SesionService } from './services/sesion/sesion-service';
import { EventosService } from './services/eventos/eventos-service';
import { LucideService } from './services/lucide/lucide-service';
import { Footer } from './components/footer/footer';
import Swal from 'sweetalert2';

const _origSwalFire = Swal.fire.bind(Swal);
(Swal as any).fire = function (...args: any[]) {
  if (args[0] && typeof args[0] === 'object') {
    args[0].zIndex = args[0].zIndex ?? 3000;
  }
  return _origSwalFire(...args);
};

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
  esHome = false;

  ngOnInit(): void {
    this.sesionService.refrescarSesion();
    this.eventosService.conectar();
    this.lucideService.init();

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.esHome = event.urlAfterRedirects === '/';
    });

    this.esHome = this.router.url === '/';
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
