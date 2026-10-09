#!/bin/sh
# Rewrites the absolute URLs of the link previews (canonical, og:url, og:image) in index.html.
#   SITE_URL      public URL of the app, ending in / (default: the GitHub Pages demo)
#   OG_IMAGE_URL  preview image (default: ${SITE_URL}og-image.jpg)
set -eu
default='https://ateeducacion.github.io/tonga/'
html=/usr/share/nginx/html/index.html
[ -n "${SITE_URL:-}${OG_IMAGE_URL:-}" ] || exit 0
site="${SITE_URL:-$default}"
image="${OG_IMAGE_URL:-${site}og-image.jpg}"
for url in "$site" "$image"; do
  # Only plain absolute URLs: they go into an HTML attribute and a sed replacement.
  printf '%s' "$url" | grep -Eq '^https?://[^]["<>&|\\[:space:]]+$' || { echo "tonga: invalid URL: $url" >&2; exit 1; }
done
# Works from the pristine copy so a restart with other values still finds the defaults.
[ -f "$html.orig" ] || cp "$html" "$html.orig"
sed -e "s|${default}og-image.jpg|${image}|g" -e "s|${default}|${site}|g" "$html.orig" > "$html"
