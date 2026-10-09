# Tonga served by nginx. Build dist/ first (npm run build); release.yml does it and pushes
# the image to ghcr.io/ateeducacion/tonga on every v* tag.
#   docker run -p 8080:80 -e SITE_URL=https://example.org/tonga/ ghcr.io/ateeducacion/tonga:latest
FROM nginx:1.31-alpine
COPY dist/ /usr/share/nginx/html/
COPY docker/default.conf /etc/nginx/conf.d/default.conf
COPY docker/40-tonga-site-url.sh /docker-entrypoint.d/
