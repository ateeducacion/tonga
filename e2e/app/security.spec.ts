// Hostile inputs fail in a controlled way: a readable message, no script, no network, no crash.
import { expect, layers, newDrawing, test } from './fixtures';

const cases = [
  ['an SVG with a script, handlers and tracking URLs', 'tracking.svg', null],
  ['an SVG with entity expansion', 'entities.svg', /DOCTYPE/],
  ['a project from a newer version', 'future.tonga', /versión más nueva/],
  ['a project with a remote image', 'remote.tonga', /origen no permitido/],
  ['a file that only pretends to be a PNG', 'fake.png', /Formato no admitido/],
] as const;

for (const [title, file, error] of cases) {
  test(`handles ${title}`, async ({ page }) => {
    let dialogs = 0;
    page.on('dialog', (d) => {
      dialogs++;
      void d.dismiss();
    });
    await newDrawing(page);
    const input = file.endsWith('.tonga') ? '#file-project' : '#file-image';
    await page.locator(input).setInputFiles(`test/fixtures/import/${file}`);
    if (error) {
      await expect(page.getByRole('alert')).toHaveText(error);
    } else {
      // The safe parts are imported as one layer; scripts and remote URLs are gone.
      await expect(layers(page)).toHaveText(['tracking']);
    }
    expect(dialogs).toBe(0);
    // The fixture's `problems` check fails the test on any request to tracker.invalid / evil.invalid.
  });
}
