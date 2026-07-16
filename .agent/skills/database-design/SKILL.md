---
name: database-design
description: Use when planning how data will be stored, organizing the database, or deciding between SQL and NoSQL — schema design, indexing strategy, ORM selection, serverless databases. Also triggers on "modelar o banco", "estrutura de dados", "como guardar isso?", "tabelas do banco", or "schema do banco".
allowed-tools: Read, Write, Edit, Glob, Grep
permissions: [file_read]
---

# Database Design

> **Learn to THINK, not copy SQL patterns.**

## 🎯 Selective Reading Rule

**Read ONLY files relevant to the request!** Check the content map, find what you need.

| File | Description | When to Read |
|------|-------------|--------------|
| `database-selection.md` | PostgreSQL vs Neon vs Turso vs SQLite | Choosing database |
| `orm-selection.md` | Drizzle vs Prisma vs Kysely | Choosing ORM |
| `schema-design.md` | Normalization, PKs, relationships | Designing schema |
| `indexing.md` | Index types, composite indexes | Performance tuning |
| `optimization.md` | N+1, EXPLAIN ANALYZE | Query optimization |
| `migrations.md` | Safe migrations, serverless DBs | Schema changes |

---

## ⚠️ Core Principle

- ASK user for database preferences when unclear
- Choose database/ORM based on CONTEXT
- Don't default to PostgreSQL for everything

---

## Decision Checklist

Before designing schema:

- [ ] Asked user about database preference?
- [ ] Chosen database for THIS context?
- [ ] Considered deployment environment?
- [ ] Planned index strategy?
- [ ] Defined relationship types?

---

## Concurrency & Race Conditions

When enforcing a limit or claiming a slot under concurrent access, never read-then-decide-then-write in application code — that's a check-then-act race (TOCTOU). Use a single conditional UPDATE instead: `UPDATE ... SET count = count + 1 WHERE count < max AND NOT expired`, then check the affected-row count (1 = success, 0 = limit hit/lost the race). This needs no explicit lock and stays correct under any concurrency level.

---

## Anti-Patterns

❌ Default to PostgreSQL for simple apps (SQLite may suffice)
❌ Skip indexing
❌ Use SELECT * in production
❌ Store JSON when structured data is better
❌ Ignore N+1 queries
❌ Read a counter, check it in code, then write it back (check-then-act race)
