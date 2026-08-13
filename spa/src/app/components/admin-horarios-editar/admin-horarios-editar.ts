import { Component, inject, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorarioService } from '../../services/horario/horario-service';
import { ProfesionalService } from '../../services/profesional/profesional-service';
import Swal from 'sweetalert2';
import { Profesional } from '../../models/profesional';
import { HorarioDisponible } from '../../models/horario-disponible';

@Component({
  selector: 'app-admin-horarios-editar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-horarios-editar.html',
  styleUrl: './admin-horarios-editar.css'
})
export class AdminHorariosEditar implements OnChanges, OnInit {
  private horarioService = inject(HorarioService);
  private profesionalService = inject(ProfesionalService);

  @Input() horario: HorarioDisponible | null = null;
  @Output() horarioEditado = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  profesionales: Profesional[] = [];
  profesionalId: number | null = null;
  fecha: string = '';
  hora: string = '';
  disponible: boolean = true;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['horario'] && this.horario) {
      this.profesionalId = this.horario.profesional?.id || null;
      this.fecha = this.horario.fecha || '';
      this.hora = this.horario.hora || '';
      this.disponible = this.horario.disponible ?? true;
    }
  }

  ngOnInit(): void {
    this.profesionalService.obtenerTodos().subscribe({
      next: (data) => this.profesionales = data,
      error: () => Swal.fire('Error', 'No se pudieron cargar los profesionales', 'error')
    });
  }

  guardarCambios(): void {
    const id = this.horario?.id;
    if (!id || !this.profesionalId || !this.fecha || !this.hora) {
      Swal.fire('Campos obligatorios', 'Todos los campos son requeridos', 'warning');
      return;
    }

    const actualizado = {
      profesional: { id: this.profesionalId },
      fecha: this.fecha,
      hora: this.hora,
      disponible: this.disponible
    };

    this.horarioService.editar(id, actualizado as any).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Horario actualizado correctamente', 'success');
        this.horarioEditado.emit();
      },
      error: (err) => Swal.fire('Error', err.error?.mensaje || 'Error al actualizar', 'error')
    });
  }

  cerrar(): void { this.cancelar.emit(); }
}