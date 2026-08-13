import { Component, EventEmitter, inject, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorarioService } from '../../services/horario/horario-service';
import { ProfesionalService } from '../../services/profesional/profesional-service';
import Swal from 'sweetalert2';
import { Profesional } from '../../models/profesional';

@Component({
  selector: 'app-admin-horarios-crear',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-horarios-crear.html',
  styleUrl: './admin-horarios-crear.css'
})
export class AdminHorariosCrear implements OnInit {
  private horarioService = inject(HorarioService);
  private profesionalService = inject(ProfesionalService);
  @Output() horarioCreado = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  profesionales: Profesional[] = [];
  profesionalId: number | null = null;
  fecha: string = '';
  hora: string = '';
  disponible: boolean = true;

  ngOnInit(): void {
    this.profesionalService.obtenerTodos().subscribe({
      next: (data) => this.profesionales = data,
      error: () => Swal.fire('Error', 'No se pudieron cargar los profesionales', 'error')
    });
  }

  guardar(): void {
    if (!this.profesionalId || !this.fecha || !this.hora) {
      Swal.fire('Campos obligatorios', 'Profesional, fecha y hora son requeridos', 'warning');
      return;
    }

    const nuevo = {
      profesional: { id: this.profesionalId },
      fecha: this.fecha,
      hora: this.hora,
      disponible: this.disponible
    };

    this.horarioService.crear(nuevo as any).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Horario creado correctamente', 'success');
        this.resetForm();
        this.horarioCreado.emit();
      },
      error: (err) => Swal.fire('Error', err.error?.mensaje || 'Error al crear', 'error')
    });
  }

  resetForm(): void {
    this.profesionalId = null;
    this.fecha = '';
    this.hora = '';
    this.disponible = true;
  }

  cerrar(): void { this.cancelar.emit(); }
}
