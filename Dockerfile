FROM nginx:1.27-alpine

# Copy the static site files into nginx's default serve directory
COPY pages/ /usr/share/nginx/html/

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Railway injects the PORT environment variable at runtime.
# nginx needs to listen on that port, not the hardcoded 80.
# We do a runtime substitution via the entrypoint below.
CMD ["/bin/sh", "-c", \
  "envsubst '$PORT' < /etc/nginx/conf.d/default.conf > /tmp/nginx.conf \
   && nginx -c /tmp/nginx.conf -g 'daemon off;'"]
