# BookSlot Backend

- [NOTE]: I have used AI for some extent for nest.js code and structure because I am new to nest.js and I have used it only once before. so I have used AI to understand the structure and code of nest.js and some code generation.

## Prerequisites

1. Install packages using any package manager.
```bash
npm install
```
2. Copy `.env.example` variables into `.env` file and set their values.
3. Create database which is mentioned in `.env`'s database url
```sql
CREATE DATABASE bookslot;
```
4. Generate db client.
```bash
npx prisma generate
```
4. Run Below command for migrating database it.
```bash
npx prisma migrate dev
```
5. Start application
```bash
npm run start:dev
```