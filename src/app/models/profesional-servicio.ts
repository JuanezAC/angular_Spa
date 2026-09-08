export interface ProfesionalServicio {
  id?: number;
  // El backend devuelve objetos anidados, no solo IDs
  profesional?: { 
    id: number; 
    nombre: string; 
    especialidad?: string 
  };
  servicio?: { 
    id: number; 
    nombre: string; 
    precio?: number 
  };
}
