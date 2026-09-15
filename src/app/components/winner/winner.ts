import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideService } from '../../services/lucide/lucide-service';

interface WinnerInfo {
  numero: number;
  titulo: string;
  subtitulo: string;
  mensaje: string;
}

@Component({
  selector: 'app-winner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './winner.html',
  styleUrl: './winner.css'
})
export class WinnerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private lucideService = inject(LucideService);

  winner: WinnerInfo | null = null;
  valido = false;

  private winners: Record<number, WinnerInfo> = {
    1: {
      numero: 1,
      titulo: '¡Felicidades!',
      subtitulo: 'Has encontrado al Ganador #1',
      mensaje: 'Exploraste Spa Relax y encontraste uno de sus secretos. ¡Felicidades, eres el Ganador #1!'
    },
    2: {
      numero: 2,
      titulo: '¡Felicidades!',
      subtitulo: 'Has encontrado al Ganador #2',
      mensaje: 'Revisaste los detalles de Spa Relax y descubriste algo especial. ¡Felicidades, eres el Ganador #2!'
    },
    3: {
      numero: 3,
      titulo: '¡Felicidades!',
      subtitulo: 'Has encontrado al Ganador #3',
      mensaje: 'Encontraste el ganador más secreto de Spa Relax. ¡Felicidades, eres el Ganador #3!'
    }
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (this.winners[id]) {
        this.winner = this.winners[id];
        this.valido = true;
      } else {
        this.valido = false;
      }
      setTimeout(() => this.lucideService.init(), 50);
    });
  }
}
