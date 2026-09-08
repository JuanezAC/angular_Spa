import { HorarioDisponible } from "./horario-disponible";
import { Profesional } from "./profesional";
import { Servicio } from "./servicio";
import { UsuarioSesion } from "./usuario-sesion";

export interface Cita {
    id?: number;
    fecha: string;
    hora: string;
    observacion?: string;
    
    usuario: UsuarioSesion; // Relación con el usuario que reservó la cita
    profesional: Profesional; // Relación con el profesional asignado
    servicio: Servicio; // Relación con el servicio reservado
    horario: HorarioDisponible; // Relación con el horario reservado

}