import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import Swal from 'sweetalert2';

const _originalFire = Swal.fire.bind(Swal);
(Swal as any).fire = function (...args: any[]) {
  if (args[0] && typeof args[0] === 'object') {
    args[0].zIndex = args[0].zIndex ?? 3000;
  }
  return _originalFire(...args);
};

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
