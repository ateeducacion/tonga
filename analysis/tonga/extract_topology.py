#!/usr/bin/env python3
"""Extract Tonga's dependency topology into topology.json.

Sources of edges:
  * index.html / creditos.html <script> tags (static loads)
  * webpack __webpack_require__(N) inside dist/tui-image-editor.js, grouped into buckets
  * global-symbol usage across files/buckets (Tonga glues the fork to js/*.js through globals)
  * data access: lista.txt, thumbnails, user files, downloads
Run from the repo root: python3 analysis/tonga/extract_topology.py
"""
import json, os, re, sys
from collections import defaultdict

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
OUT = os.path.join(ROOT, "analysis/tonga/topology.json")
DIST = "dist/tui-image-editor.js"


def read(p):
    return open(os.path.join(ROOT, p), encoding="utf-8", errors="replace").read()


def loc(p):
    return sum(1 for l in read(p).split("\n") if l.strip())


# --- webpack modules of the fork -------------------------------------------------
lines = read(DIST).split("\n")
starts = [(i, int(m.group(1))) for i, l in enumerate(lines) if (m := re.match(r"^\s*/\* (\d+) \*/\s*$", l))]
mods = {}
for k, (i, n) in enumerate(starts):
    e = starts[k + 1][0] if k + 1 < len(starts) else len(lines)
    mods[n] = (i + 1, e, "\n".join(lines[i:e]))

# bucket id -> (name, domain, module numbers)
BUCKETS = {
    "tui-runtime": ("TUI runtime (core-js polyfills, DOM utils, Buffer)", "core", [1, *range(3, 68), *range(107, 115)]),
    "tui-imageeditor": ("ImageEditor class (mod 2)", "core", [2]),
    "tui-invoker": ("Invoker + command factory (mod 68-71)", "core", [68, 69, 70, 71]),
    "tui-consts": ("Util + constants (mod 72-73)", "core", [72, 73]),
    "tui-action": ("Action mixin: load/download/menus (mod 103)", "core", [103]),
    "tui-graphics": ("Graphics module (mod 105)", "core", [105]),
    "tui-commands": ("Commands (mod 142-159)", "core", list(range(140, 160))),
    "tui-fabric27": ("Bundled Fabric 2.7.0 fork (mod 106)", "render", [106]),
    "tui-components": ("Graphics components: crop, draw, text, icon, filter, shape (mod 115-131)", "render", [115, 116, 117, 118, *range(121, 132)]),
    "tui-fliprotate": ("Flip + rotation components (mod 119-120)", "render", [119, 120]),
    "tui-drawmodes": ("Drawing modes (mod 132-139)", "render", list(range(132, 140))),
    "tui-ui": ("Ui class + main header template (mod 74-76)", "ui", [74, 75, 76]),
    "tui-submenus": ("Submenus, theme, locale (mod 77-102)", "ui", list(range(77, 103))),
    "tui-imagetracer": ("ImageTracer (mod 104)", "io", [104]),
    "tui-imagen-ui": ("Imagen submenu template + UI (mod 161)", "repo", [160, 161]),
    "tui-imagen-gfx": ("Imagen graphics component (mod 162)", "repo", [162]),
}
mod2bucket = {n: b for b, (_, _, ns) in BUCKETS.items() for n in ns}
bucket_text = defaultdict(str)
bucket_loc = defaultdict(int)
bucket_range = {}
for n, (s, e, body) in mods.items():
    b = mod2bucket.get(n)
    if not b:
        print(f"WARN module {n} unbucketed", file=sys.stderr)
        continue
    bucket_text[b] += body
    bucket_loc[b] += e - s
    lo, hi = bucket_range.get(b, (s, e))
    bucket_range[b] = (min(lo, s), max(hi, e))

edges = set()
for n, (_, _, body) in mods.items():
    for r in set(int(x) for x in re.findall(r"__webpack_require__\((\d+)\)", body)):
        a, b = mod2bucket.get(n), mod2bucket.get(r)
        if a and b and a != b:
            edges.add((a, b, "call"))

# --- standalone files ---------------------------------------------------------
JS = {
    "js/repositorio.js": ("repo", "Repository loader (thumbnails, insert, background)"),
    "js/customiseControls.js": ("render", "customiseControls (pixolith, MIT)"),
    "js/fabric.js": ("render", "Fabric 3.0.0 (loaded, shadowed)"),
    "js/jquery.min.js": ("vendor", "jQuery 1.7.2"),
    "js/jquery-ui.min.js": ("vendor", "jQuery UI 1.8.21"),
    "js/jquery.modal.min.js": ("vendor", "jquery-modal"),
    "js/axios.min.js": ("vendor", "axios 1.9.0"),
    "js/jspdf.min.js": ("io", "jsPDF 2.1.1"),
    "js/FileSaver.min.js": ("io", "FileSaver"),
    "js/xml2json.js": ("io", "X2JS (xml2json)"),
    "js/tui-code-snippet.js": ("vendor", "tui-code-snippet"),
    "js/tui-color-picker.min.js": ("vendor", "tui-color-picker 2.2.0"),
    "js/image-picker.js": ("vendor", "image-picker (loaded, never called)"),
    "js/theme/black-theme.js": ("shell", "Black theme config"),
    "js/theme/white-theme.js": ("dead", "White theme (unused)"),
    "js/service-basic.js": ("dead", "NHN sample: service-basic"),
    "js/service-mobile.js": ("dead", "NHN sample: service-mobile"),
    "js/repositorio.min.js": ("dead", "Stale minified repositorio"),
    "js/fabric.min.js": ("dead", "Fabric 3.0.0 min (unused)"),
    "js/axios.js": ("dead", "axios 0.19.0 (unused)"),
    "js/xml2json.min.js": ("dead", "X2JS min (unused)"),
    "js/tui-code-snippet.min.js": ("dead", "tui-code-snippet min (unused)"),
    "dist/esquema_comandos.js": ("dead", "Hand-made outline of fork commands"),
    "dist/tui-image-editor_esquema.js": ("dead", "Hand-made outline of the fork"),
    "dist/estudio_nuevos_comandos.js": ("dead", "Pasted Fabric study"),
}
SCREENS = {
    "index.html": ("shell", "index.html (entry, locale_es, editor config)"),
    "creditos.html": ("credits", "creditos.html (credits dialog)"),
    "creditos_completo.html": ("dead", "creditos_completo.html (unlinked)"),
}
JOBS = {
    ".github/workflows/ci.yml": ("build", "CI: deploy whole repo to gh-pages"),
    "Makefile": ("build", "Makefile (up/update/package)"),
    "package.json": ("build", "package.json + npm run update"),
}
STORES = {
    "ds:catalog-root": ("repositorios/lista.txt", "Root catalogue (sections + collections)"),
    "ds:collections": ("repositorios/*/lista.txt + images + thumbnails/", "Collection lists, images, thumbnails"),
    "ds:ui-assets": ("img/, dist/svg/, sounds/, webfonts/", "UI assets (icons, logos, sound, fonts)"),
    "ds:user-files": ("<input type=file>", "User's local image/SVG files"),
    "ds:exports": ("browser download", "Exported PNG/JPG/SVG/PDF"),
    "ds:gh-pages": ("branch gh-pages", "Published site branch"),
}

nid = {p: "f:" + p for p in [*JS, *SCREENS, *JOBS]}

# static <script> loads
for page in ["index.html", "creditos.html"]:
    for src in re.findall(r'<script[^>]*src="\./?([^"]+)"', re.sub(r"<!--.*?-->", "", read(page), flags=re.S)):
        if src in nid:
            edges.add((nid[page], nid[src], "call"))
        elif src == DIST:
            edges.add((nid[page], "tui-imageeditor", "call"))

# global-symbol glue: symbol -> defining node; usage anywhere else is an edge
GLOBALS = {
    "cargarRepositorio": nid["js/repositorio.js"],
    "insertarImagen": nid["js/repositorio.js"],
    "_imageEncode": nid["js/repositorio.js"],
    "jsPDF": nid["js/jspdf.min.js"],
    "saveAs": nid["js/FileSaver.min.js"],
    "X2JS": nid["js/xml2json.js"],
    "customiseCornerIcons": nid["js/customiseControls.js"],
    "axios": nid["js/axios.min.js"],
    "registerCustomImagen": "tui-action",
    "cargarFondo": "tui-imageeditor",
    "_invoker": "tui-imageeditor",
    "\\$\\.modal|\\.modal\\(": nid["js/jquery.modal.min.js"],
    "\\.dialog\\(": nid["js/jquery-ui.min.js"],
    "blackTheme": nid["js/theme/black-theme.js"],
}
sources = {b: bucket_text[b] for b in BUCKETS}
for p in ["js/repositorio.js", "index.html", "creditos.html", "js/customiseControls.js"]:
    sources[nid[p]] = read(p)
dispatch_syms = {"cargarRepositorio", "insertarImagen"}  # reached via inline on*="" handlers
for sym, target in GLOBALS.items():
    for node, text in sources.items():
        if node != target and re.search(r"(?<!\w)" + sym if sym[0].isalpha() or sym[0] == "_" else sym, text):
            edges.add((node, target, "dispatch" if sym in dispatch_syms else "call"))
edges.add((nid["index.html"], nid["creditos.html"], "dispatch"))  # $dialog.load('creditos.html')
edges.add((nid["js/customiseControls.js"], "tui-fabric27", "call"))
edges.add(("tui-invoker", "tui-commands", "dispatch"))  # commands self-register in commandFactory; invoker executes by name  # patches window.fabric (2.7 wins)

# data access
edges |= {
    ("tui-imagen-ui", "ds:catalog-root", "read"),
    (nid["js/repositorio.js"], "ds:collections", "read"),
    ("tui-action", "ds:user-files", "read"),
    ("tui-action", "ds:exports", "write"),
    (nid["js/theme/black-theme.js"], "ds:ui-assets", "read"),
    ("tui-action", "ds:ui-assets", "read"),  # fondoBlanco.jpg, transparente_falso.png
    (nid[".github/workflows/ci.yml"], "ds:gh-pages", "write"),
    (nid["Makefile"], nid["package.json"], "call"),
}

# --- tree -----------------------------------------------------------------------
DOMAINS = {
    "shell": "Shell / bootstrap", "core": "Editor core (TUI fork)", "render": "Render engine (Fabric)",
    "ui": "UI chrome / menus", "repo": "Asset repository", "io": "Import / export",
    "credits": "Credits / legal", "vendor": "Vendored libraries", "build": "Build / deploy",
    "dead": "Dead / reference code",
}
children = defaultdict(list)
for b, (name, dom, _) in BUCKETS.items():
    s, e = bucket_range[b]
    children[dom].append({"id": b, "name": name, "kind": "module", "language": "javascript",
                          "loc": bucket_loc[b], "file": f"{DIST}#L{s}-L{e}" if len(BUCKETS[b][2]) == 1 else f"{DIST}#{b}"})
for p, (dom, name) in JS.items():
    children[dom].append({"id": nid[p], "name": name, "kind": "module", "language": "javascript", "loc": loc(p), "file": p})
for p, (dom, name) in SCREENS.items():
    children[dom].append({"id": nid[p], "name": name, "kind": "screen", "language": "html", "loc": loc(p), "file": p})
for p, (dom, name) in JOBS.items():
    children[dom].append({"id": nid[p], "name": name, "kind": "job", "loc": loc(p), "file": p})
stores = [{"id": k, "name": n, "kind": "datastore", "file": loc_} for k, (loc_, n) in STORES.items()]

root = {"id": "sys", "name": "tonga", "kind": "system",
        "children": [{"id": "dom:" + d, "name": DOMAINS[d], "kind": "domain", "children": children[d]} for d in DOMAINS if children[d]]
                    + [{"id": "dom:data", "name": "Data stores", "kind": "domain", "children": stores}]}

leaves = {c["id"] for d in root["children"] for c in d["children"]}
bad = [e for e in edges if e[0] not in leaves or e[1] not in leaves]
assert not bad, bad
entry = [nid["index.html"], nid[".github/workflows/ci.yml"], nid["Makefile"]]
inbound = {t for _, t, _ in edges}
dead = sorted(l for l in leaves if l not in inbound and l not in entry and not l.startswith("ds:"))

topo = {
    "system": "Tonga",
    "root": root,
    "edges": [{"source": s, "target": t, "kind": k} for s, t, k in sorted(edges)],
    "entryPoints": entry,
    "deadEnds": dead,
    "observations": [
        "The TUI fork (dist/tui-image-editor.js) is a single point of failure: 16 internal buckets, no source, 271 JBD hand edits; tui-action (mod 103) is the hub for load, download, menus and Tonga-specific features.",
        "Two Fabric copies: index.html loads js/fabric.js 3.0.0, then the bundled 2.7.0 overwrites window.fabric; customiseControls.js patches the 2.7 copy. js/fabric.js has inbound edges only from the <script> tag.",
        "The fork and js/repositorio.js are glued through globals in both directions (imageEditor, _imageEncode, cargarRepositorio via inline onClick, imageEditor._invoker._isLocked): extraction candidate = a typed asset-library module with a public editor API.",
        "Inline on*=\"\" handlers built from lista.txt strings (cargarRepositorio, insertarImagen) are dispatch edges invisible to import analysis; they are the XSS sinks SEC-006.",
        "image-picker.js, jquery.min.js 1.7.2 and jquery-ui 1.8.21 are loaded for one dialog and one modal; the rewrite replaces them with <dialog>.",
        "Build/deploy nodes do not touch the runtime graph at all: CI writes the whole repo to gh-pages with no build or test step.",
    ],
    "flows": [
        {"name": "Crear un dibujo con la biblioteca", "persona": "Docente o alumnado",
         "description": "Una persona abre Tonga, empieza un lienzo transparente, inserta imágenes de una colección y las coloca.",
         "steps": [
             {"label": "Abre Tonga en el navegador", "nodes": [nid["index.html"], "tui-imageeditor", "tui-ui"]},
             {"label": "Pulsa Comenzar (lienzo transparente)", "nodes": ["tui-ui", "tui-action", "tui-imageeditor"]},
             {"label": "Abre Imagen y despliega una colección", "nodes": ["tui-imagen-ui", "ds:catalog-root"]},
             {"label": "Ve las miniaturas", "nodes": [nid["js/repositorio.js"], "ds:collections", nid["js/jquery.modal.min.js"]]},
             {"label": "Doble clic: inserta la imagen o la pone de fondo", "nodes": [nid["js/repositorio.js"], "tui-action", "tui-imagen-gfx", "tui-fabric27"]},
             {"label": "Mueve, gira, voltea y ordena capas", "nodes": ["tui-fliprotate", "tui-commands", "tui-invoker", "tui-graphics"]},
         ]},
        {"name": "Exportar el trabajo", "persona": "Docente o alumnado",
         "description": "La persona descarga su dibujo como PNG, JPG, SVG o PDF para usarlo en clase.",
         "steps": [
             {"label": "Pulsa el botón de formato", "nodes": ["tui-ui", "tui-action"]},
             {"label": "Se rasteriza o serializa el lienzo", "nodes": ["tui-graphics", "tui-fabric27"]},
             {"label": "SVG: se reescribe con X2JS y se incrusta el fondo", "nodes": [nid["js/xml2json.js"]]},
             {"label": "PDF: se maqueta en A4 con jsPDF", "nodes": [nid["js/jspdf.min.js"]]},
             {"label": "Se descarga el fichero", "nodes": [nid["js/FileSaver.min.js"], "ds:exports"]},
         ]},
        {"name": "Retomar un dibujo guardado como SVG", "persona": "Alumnado",
         "description": "La persona vuelve a cargar un SVG exportado por Tonga para seguir editándolo.",
         "steps": [
             {"label": "Elige Cargar imagen y selecciona el SVG", "nodes": ["tui-ui", "tui-action", "ds:user-files"]},
             {"label": "Fabric parsea el SVG y recupera el fondo", "nodes": ["tui-fabric27", "tui-graphics"]},
             {"label": "Sigue editando con texto, formas y dibujo", "nodes": ["tui-components", "tui-drawmodes", "tui-submenus"]},
         ]},
        {"name": "Consultar los créditos", "persona": "Visitante",
         "description": "La persona abre los créditos para ver autoría y licencias de las colecciones.",
         "steps": [
             {"label": "Pulsa Créditos", "nodes": ["tui-ui", nid["index.html"]]},
             {"label": "Se abre el diálogo con creditos.html", "nodes": [nid["js/jquery-ui.min.js"], nid["creditos.html"]]},
         ]},
    ],
}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(topo, open(OUT, "w"), indent=1, ensure_ascii=False)

print(f"leaves={len(leaves)} edges={len(edges)} webpack_modules={len(mods)}")
for d in root["children"]:
    print(f"  {d['name']}: {len(d['children'])}")
by_kind = defaultdict(int)
for *_, k in edges:
    by_kind[k] += 1
print("edges by kind:", dict(by_kind))
print("entryPoints:", entry)
print("deadEnds:", dead)
