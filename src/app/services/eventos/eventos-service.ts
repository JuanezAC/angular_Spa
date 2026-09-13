import { Injectable, NgZone } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EventosService {
  private eventSource: EventSource | null = null;
  private reconectando = false;
  private reconnectTimer: any = null;

  private servicios$ = new Subject<void>();
  private profesionales$ = new Subject<void>();
  private horarios$ = new Subject<void>();
  private citas$ = new Subject<void>();
  private usuarios$ = new Subject<void>();

  constructor(private zone: NgZone) {}

  conectar(): void {
    if (this.eventSource) return;

    this.eventSource = new EventSource(`${environment.apiUrl}/api/eventos`);

    this.eventSource.onopen = () => {
      console.log('SSE conectado');
      this.reconectando = false;
    };

    this.eventSource.addEventListener('SERVICIOS_ACTUALIZADOS', () => {
      this.zone.run(() => this.servicios$.next());
    });
    this.eventSource.addEventListener('PROFESIONALES_ACTUALIZADOS', () => {
      this.zone.run(() => this.profesionales$.next());
    });
    this.eventSource.addEventListener('HORARIOS_ACTUALIZADOS', () => {
      this.zone.run(() => this.horarios$.next());
    });
    this.eventSource.addEventListener('CITAS_ACTUALIZADAS', () => {
      this.zone.run(() => this.citas$.next());
    });
    this.eventSource.addEventListener('USUARIOS_ACTUALIZADOS', () => {
      this.zone.run(() => this.usuarios$.next());
    });

    this.eventSource.onerror = () => {
      console.warn('SSE error, reconectando en 5s...');
      this.desconectar();
      this.reconectar();
    };
  }

  private reconectar(): void {
    if (this.reconectando) return;
    this.reconectando = true;
    this.reconnectTimer = setTimeout(() => {
      this.reconectando = false;
      this.conectar();
    }, 5000);
  }

  desconectar(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  onServicios(): Observable<void> { return this.servicios$.asObservable(); }
  onProfesionales(): Observable<void> { return this.profesionales$.asObservable(); }
  onHorarios(): Observable<void> { return this.horarios$.asObservable(); }
  onCitas(): Observable<void> { return this.citas$.asObservable(); }
  onUsuarios(): Observable<void> { return this.usuarios$.asObservable(); }
}
