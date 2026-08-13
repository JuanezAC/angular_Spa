import { Profesional } from "./profesional";

export interface HorarioDisponible {
    id?: number;
    fecha: string;      // YYYY-MM-DD
    hora: string;       // HH:mm:ss
    disponible: boolean;
    
    profesional: Profesional; // Relación con el profesional
    }