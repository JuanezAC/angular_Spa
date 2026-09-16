import { Routes } from '@angular/router';

import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { SinPermisos } from './components/sin-permisos/sin-permisos';
import { authGuard, adminGuard } from './guards/auth.guard';

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

export const routes: Routes = [
  { path: '', component: Home },

  // PUBLIC
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'sin-permisos', component: SinPermisos },

  // USER (auth required)
  { path: 'servicios', component: Servicios },
  { path: 'profesionales', component: Profesionales },
  { path: 'horarios', component: Horarios },
  { path: 'mis-citas', component: MisCitas, canActivate: [authGuard] },

  // ADMIN (admin role required)
  { path: 'admin/servicios', component: AdminServicios, canActivate: [adminGuard] },
  { path: 'admin/servicios/crear', component: AdminServiciosCrear, canActivate: [adminGuard] },
  { path: 'admin/servicios/editar/:id', component: AdminServiciosEditar, canActivate: [adminGuard] },
  { path: 'admin/profesionales', component: AdminProfesionales, canActivate: [adminGuard] },
  { path: 'admin/profesionales/crear', component: AdminProfesionalesCrear, canActivate: [adminGuard] },
  { path: 'admin/profesionales/editar/:id', component: AdminProfesionalesEditar, canActivate: [adminGuard] },
  { path: 'admin/horarios', component: AdminHorarios, canActivate: [adminGuard] },
  { path: 'admin/citas', component: AdminCitas, canActivate: [adminGuard] },
  { path: 'admin/usuarios', component: AdminUsuarios, canActivate: [adminGuard] },

  { path: '**', redirectTo: '' }
];
