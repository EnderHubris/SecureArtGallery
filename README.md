# Secure Art Gallery - BIBIFI Project

## What is this about?
This is a web-based application for managing an art gallery. The system tracks guests and employees
entering and leaving the gallery and individual rooms.

This project serves to demonstrate secure-programming concepts such as:
- Secure credential transport
- Authentication and Authorization
- Validating user-controlled input
- Ensuring data confidentiality
- Secure database design
- Exploitation mitigations (XSS/SQLI/CSRF/SSRF/IDOR)
- Session security
- Information Disclosure
- Securing secrets
- Error handling
- Security Auditing

For more information regarding the back-end API consolidate the [documentation](./src/backend/README.md).

## Who's on the Team
- [Noah A](https://github.com/EnderHubris/)
- [Conner B](https://github.com/ManOfNeptune27/)

## Tech Stack
Front-end: React with TypeScript
Back-end:  Express with TypeScript
Database:  Postgresql with Drizzle-ORM (ORM natively provides sql query security)

All brought together through [bun](https://bun.com/) the lightning fast JavaScript package manager & toolkit.

## Developer's Note
If you are working on either the front-end or back-end software, if you need to modify the packages included
via `bun add [package]` or `bun rm [package]`, make sure your terminal's cwd is within either `src/frontend` or `src/backend`.

## System Architecture


## Build
Make sure you've installed [bun](https://bun.com/) and [docker](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository) on your system so you can install project dependencies
and run the project locally as a developer.

The front-end and back-end are separate components meaning locally you will need two terminals to run the
separate processes.

### Front-End Build
```console
# run the front-end locally (start from project root)
cd src/frontend
bun install .
bun run dev
```

### Back-End Build
```
# run the back-end locally (start from project root)

# first have a local psql database ready (replace env.* values for values in your local '.env' file)
docker run -d \
  --name myapp_db \
  -e POSTGRES_USER=env.PG_USER \
  -e POSTGRES_PASSWORD=env.PG_PASSWORD \
  -e POSTGRES_DB=env.PG_DATABASE \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16
bun install .
bunx drizzle-kit migrate

# second spin-up the backend API server
cd src/backend
bun install .
bun server.ts
```