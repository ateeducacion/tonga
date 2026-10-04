// «¿Qué diapositiva abres?»: when an eXeLearning file has several Slide iDevices, the user picks
// one from cards with its preview and its page's name. Native <dialog> and radio buttons, so
// it works with the keyboard and a screen reader.
import type { SlideChoice } from '../import/exe';
import { byId, h, openDialog } from './dom';

/** The slide's own static preview as an image (an SVG in an <img> runs no script). */
function preview(svg: string): HTMLElement {
  if (!svg) return h('span', { class: 'slide-thumb empty', 'aria-hidden': 'true' }, 'Sin vista previa');
  return h('img', { class: 'slide-thumb', alt: '', src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` });
}

/** Resolves with the chosen slide, or null if the user cancels. */
export function chooseSlide(slides: SlideChoice[]): Promise<SlideChoice | null> {
  const dialog = byId<HTMLDialogElement>('dlg-slides');
  const list = byId('slides-list');
  list.replaceChildren(...slides.map((s, i) =>
    h('label', { class: 'slide-card' },
      h('input', { type: 'radio', name: 'slide', value: String(i), checked: i === 0 }),
      preview(s.svg),
      h('span', { class: 'slide-title' }, s.title),
      h('small', { class: 'muted' }, `${s.width} × ${s.height} px`))));
  byId('slides-count').textContent = `Este fichero tiene ${slides.length} diapositivas. Elige la que quieres abrir:`;
  const form = dialog.querySelector('form') as HTMLFormElement;
  return new Promise((resolve) => {
    const done = (e: SubmitEvent) => {
      form.removeEventListener('submit', done);
      dialog.removeEventListener('cancel', cancel);
      const open = e.submitter instanceof HTMLButtonElement && e.submitter.value === 'open';
      resolve(open ? (slides[Number(new FormData(form).get('slide'))] ?? null) : null);
    };
    const cancel = () => {
      form.removeEventListener('submit', done);
      dialog.removeEventListener('cancel', cancel);
      resolve(null);
    };
    form.addEventListener('submit', done);
    dialog.addEventListener('cancel', cancel);
    openDialog(dialog);
  });
}
