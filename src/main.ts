import './styles/app.css';
import { App } from './app/app';
import { toast } from './ui/dom';

const app = new App();

// Last line of defence: no silent failures, no unhandled rejections in the console.
window.addEventListener('unhandledrejection', (e) => {
  e.preventDefault();
  app.fail(e.reason);
});
window.addEventListener('error', (e) => {
  console.error(e.error ?? e.message);
  toast('Algo ha ido mal. Si se repite, guarda tu trabajo y recarga la página.', 'error');
});

void app.start().catch((err: unknown) => app.fail(err, 'Tonga no ha podido arrancar.'));
