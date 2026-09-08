import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sin-permisos',
  standalone: true,
  imports: [],
  templateUrl: './sin-permisos.html',
  styleUrl: './sin-permisos.css'
})
export class SinPermisos {
  private router = inject(Router);

  constructor() {
    Swal.fire({
      icon: 'warning',
      title: 'Sin permisos',
      text: 'No tienes permisos para acceder a esta sección',
      confirmButtonText: 'Volver'
    }).then(() => {
      this.router.navigate(['/servicios']);
    });
  }

  volver(): void {
    this.router.navigate(['/servicios']);
  }
}
