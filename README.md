# Next.js Dashboard App

## Description

This repository contains my implementation of the dashboard app from the official [Next.js](https://nextjs.org/) [App Router Course](https://nextjs.org/learn).

## Development instructions

### Prerequisites

You need to have the latest stable version of [Node.js](https://nodejs.org) and [npm](https://www.npmjs.com) installed.

To install all of the required package dependencies, run `npm install`.

### Database

The app uses [PostgreSQL](https://www.postgresql.org/?language=en) for its database. The easiest way to get a Postgres instance up and running is by using [Docker](https://www.docker.com/) and the [Docker Compose plugin](https://docs.docker.com/compose/). From the root directory of the project, run `docker compose up`.

To seed the database (ensuring that the database tables are created and that they contain the sample data), use `npm run seed`.

### Starting the development server

To start the local development server, use the `npm run dev` command.

### Signing in as the test user

To log in, use the following credentials:

- E-mail: `user@nextmail.com`
- Password: `123456`.
