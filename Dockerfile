# compile frontend
FROM oven/bun:1 AS build
RUN mkdir -p /app

WORKDIR /app
COPY src/frontend /app/
RUN bun install --frozen-lockfile && bun run build

# production container
FROM nginx:latest
RUN apt-get update && apt-get install -y supervisor net-tools gettext-base && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /app/frontend/
RUN mkdir -p /app/backend/log/
RUN mkdir -p /app/database/
WORKDIR /app

# copy bun over so we can run the backend
COPY --from=build /usr/local/bin/bun /usr/local/bin/bun
# copy frontend build
COPY --from=build /app/dist /app/frontend/
# copy backend src
COPY ./src/backend/package.json ./src/backend/bun.lock /app/backend/
COPY ./src/backend/server.ts ./src/backend/tsconfig.json ./src/backend/db.ts /app/backend/
COPY ./src/backend/routers   /app/backend/routers
COPY ./src/backend/utilities /app/backend/utilities
COPY ./database/schema.ts    /app/database/

RUN ln -s /app/database /database

# copy backend automation
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# overwrite default nginx with our config
COPY site.conf /etc/nginx/conf.d/default.conf

# prep entry script and execute it
COPY entrypoint.sh /root/entrypoint.sh
RUN chmod +x /root/entrypoint.sh
CMD ["/root/entrypoint.sh"]