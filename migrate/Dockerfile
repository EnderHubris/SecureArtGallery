FROM oven/bun:1
RUN mkdir -p /app/database

WORKDIR /app

COPY ./drizzle.config.ts bun.lock package.json better_migration.ts /app
COPY ./database/schema.ts ./database/init_db.ts /app/database

RUN bun install