import { Cita } from "./cita";
import { HorarioDisponible } from "./horario-disponible";
import { Servicio } from "./servicio"; // 👈 Importamos Servicio

export interface Profesional {
    id?: number;
    nombre: string;
    especialidad: string;
    correo: string;
    telefono: string;
    estado: boolean;

    horarios?: HorarioDisponible[];
    citas?: Cita[];
    servicios?: Servicio[]; // 👈 Tipado estricto (ya no usamos 'any')
}