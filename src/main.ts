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

// Offline support. A new version never takes over by itself: the person decides when to reload,
// after the autosave has been written.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Reload only after the person chose «Actualizar»: the first install also changes the controller.
  let updateRequested = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (updateRequested) location.reload();
  });
  void navigator.serviceWorker.register('./sw.js').then((reg) => {
    const offer = (worker: ServiceWorker) =>
      toast('Hay una versión nueva de Tonga.', 'info', 0, {
        label: 'Actualizar',
        run: () =>
          void app.flush().finally(() => {
            updateRequested = true;
            worker.postMessage('skip-waiting');
          }),
      });
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) offer(worker);
      });
    });
  }).catch((err: unknown) => console.warn('Service worker not registered', err));
}
