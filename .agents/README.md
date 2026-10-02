# Skills para agentes

El árbol canónico es `.agents/skills/`. `.claude/skills/` es una copia completa, generada con `rsync`. Ante un conflicto con un skill, manda [`../AGENTS.md`](../AGENTS.md).

Se instalan con `gh skill add` (la revisión exacta queda en `metadata.github-*` de cada `SKILL.md`). El origen para reinstalarlos y su licencia están en [`upstream-skills.txt`](upstream-skills.txt); los avisos de licencia, en [`licenses/`](licenses/). No se editan a mano: un cambio se hace aguas arriba y se vuelve a instalar.

| Skill | Para qué en Tonga | Origen | Licencia |
| --- | --- | --- | --- |
| `github-actions-hardening` | Revisar o escribir los workflows | github/awesome-copilot `skills/github-actions-hardening` | MIT |
| `security-audit` | Auditar la aplicación estática (importación de SVG/proyectos, CSP) | cloudflare/security-audit-skill `skills/security-audit` | MIT |
| `playwright-cli` | Explorar la app y depurar flujos E2E | microsoft/playwright-cli `skills/playwright-cli` | Apache-2.0 |
| `playwright-trace` | Inspeccionar la traza de un E2E que falla | microsoft/playwright `packages/playwright-core/src/tools/skills/playwright-trace` | Apache-2.0 |
| `test-gap-audit` | Ver qué comportamiento no tiene un test que lo fije | github/awesome-copilot `skills/test-gap-audit` | MIT |

```bash
gh skill add github.com/OWNER/REPO PATH --dir .agents/skills
rsync -a --delete --exclude .DS_Store --exclude .venv .agents/skills/ .claude/skills/
```
