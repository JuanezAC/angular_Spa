import { Routes } from '@angular/router';

import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';

// USUARIO
import { Servicios } from './components/servicios/servicios';
import { Profesionales } from './components/profesionales/profesionales';
import { Horarios } from './components/horarios/horarios';
import { MisCitas } from './components/mis-citas/mis-citas';

// ADMIN
import { AdminServicios } from './components/admin-servicios/admin-servicios';
import { AdminProfesionales } from './components/admin-profesionales/admin-profesionales';
import { AdminHorarios } from './components/admin-horarios/admin-horarios';
import { AdminCitas } from './components/admin-citas/admin-citas';
import { AdminUsuarios } from './components/admin-usuarios/admin-usuarios';
import { AdminServiciosEditar } from './components/admin-servicios-editar/admin-servicios-editar';
import { AdminServiciosCrear } from './components/admin-servicios-crear/admin-servicios-crear';
import { AdminProfesionalesEditar } from './components/admin-profesionales-editar/admin-profesionales-editar';
import { AdminProfesionalesCrear } from './components/admin-profesionales-crear/admin-profesionales-crear';
import { SinPermisos } from './components/sin-permisos/sin-permisos';

export const routes: Routes = [
  { path: '', redirectTo: 'servicios', pathMatch: 'full' },

  // USUARIO
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'servicios', component: Servicios },
  { path: 'profesionales', component: Profesionales },
  { path: 'horarios', component: Horarios },
  { path: 'mis-citas', component: MisCitas },

  // ADMIN
  { path: 'admin/servicios', component: AdminServicios },
  { path: 'admin/servicios/crear', component: AdminServiciosCrear },
  { path: 'admin/servicios/editar/:id', component: AdminServiciosEditar },
  { path: 'admin/profesionales/crear', component: AdminProfesionalesCrear }, // Opcional si solo usas modal
  { path: 'admin/profesionales/editar/:id', component: AdminProfesionalesEditar }, // Opcional si solo usas modal
  { path: 'admin/profesionales', component: AdminProfesionales },
  { path: 'admin/horarios', component: AdminHorarios },
  { path: 'admin/citas', component: AdminCitas },
  { path: 'admin/usuarios', component: AdminUsuarios },
  { path: 'sin-permisos', component: SinPermisos },
  { path: '**', redirectTo: 'servicios' }
];
