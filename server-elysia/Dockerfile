FROM docker.io/bun:latest
RUN mkdir /app /music
COPY ./ /app/
WORKDIR /app
RUN bun install
CMD bun run src/index.ts