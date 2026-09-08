import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario/usuario-service';
import { Usuario } from '../../models/usuario';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminUsuariosCrear } from '../admin-usuarios-crear/admin-usuarios-crear';
import { AdminUsuariosEditar } from '../admin-usuarios-editar/admin-usuarios-editar';
import { SesionService } from '../../services/sesion/sesion-service';

interface UsuarioState {
  loading: boolean;
  data: Usuario[];
  error: string | null;
}

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminUsuariosCrear, AdminUsuariosEditar],
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.css'
})
export class AdminUsuarios implements OnInit {
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private sesionService = inject(SesionService);

  estado$!: Observable<UsuarioState>;
  textoFiltro: string = '';

  modalCrearAbierto = false;
  modalEditarAbierto = false;
  usuarioSeleccionado: Usuario | null = null;

  ngOnInit(): void {
    this.sesionService.obtenerSesion().subscribe({
      next: (sesion) => {
        if (!sesion || sesion.rol !== 'ADMIN') {
          Swal.fire('Acceso denegado', 'Debes iniciar sesión como administrador', 'warning');
          this.router.navigate(['/login']);
          return;
        }
        this.estado$ = this.cargarUsuarios();
      },
      error: () => this.router.navigate(['/login'])
    });
  }

  cargarUsuarios(): Observable<UsuarioState> {
    return this.usuarioService.obtenerTodos().pipe(
      map(data => ({ loading: false, data, error: null })),
      startWith({ loading: true, data: [], error: null }),
      catchError(err => {
        if (err.status === 401) this.router.navigate(['/login']);
        if (err.status === 403) this.router.navigate(['/sin-permisos']);
        return of({ loading: false, data: [], error: 'Error al cargar usuarios' });
      })
    );
  }

  recargarLista(): void {
    this.estado$ = this.cargarUsuarios();
    this.cdr.markForCheck();
  }

  filtrar(usuarios: Usuario[]): Usuario[] {
    if (!this.textoFiltro.trim()) return usuarios;
    const f = this.textoFiltro.toLowerCase();
    return usuarios.filter(usuario => 
      usuario.nombre?.toLowerCase().includes(f) || 
      usuario.correo?.toLowerCase().includes(f) ||
      usuario.rol?.toLowerCase().includes(f)
    );
  }

  abrirModalCrear(): void { 
    this.modalCrearAbierto = true; 
  }
  cerrarModalCrear(): void { 
    this.modalCrearAbierto = false; 
  }

  abrirModalEditar(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.modalEditarAbierto = true;
  }
  cerrarModalEditar(): void {
    this.modalEditarAbierto = false;
    this.usuarioSeleccionado = null;
  }

  eliminar(usuario: Usuario): void {
    if (!usuario.id) return;
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: `Se eliminará a "${usuario.nombre}" permanentemente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(res => {
      if (res.isConfirmed) {
        this.usuarioService.eliminar(usuario.id!).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Usuario eliminado correctamente', 'success');
            this.recargarLista();
          },
          error: (err) => Swal.fire('Error', err.error?.mensaje || 'No se pudo eliminar', 'error')
        });
      }
    });
  }
}