# Loop Ledger Service

![Node.js](https://img.shields.io/badge/node-20.x-green)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
![Fastify](https://img.shields.io/badge/fastify-4.x-black)
![MySQL](https://img.shields.io/badge/mysql%2Fmariadb-supported-orange)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

Loop Ledger Service is a lightweight cryptographic append-only ledger built with Node.js, TypeScript, Fastify and MySQL/MariaDB.

It provides tamper-evident event storage using:

- SHA-256 hash chains
- Ed25519 digital signatures
- daily Merkle roots
- verifiable Merkle proofs
- public verification endpoints
- API-key protected write endpoints

---

## Features

- Append-only ledger
- Hash chain integrity
- Digital signatures (Ed25519)
- Daily Merkle tree aggregation
- Proof verification
- Public verification APIs
- API key protection for writes

---

## Architecture

```
Client
  ↓
Ledger API
  ↓
MySQL
  ↓
Hash Chain
  ↓
Merkle Tree
  ↓
Signed Digest
```

---

## Installation

```bash
npm install
npm run build
npm start
```

---

## Configuration

Create a `.env` file:

```env
API_KEY=change-me

DB_HOST=localhost
DB_PORT=3306
DB_USER=ledger_user
DB_PASS=change-me
DB_NAME=ledger

PRIVATE_KEY_PATH=./private.pem
PUBLIC_KEY_PATH=./public.pem

PORT=3000
```

---

## Generate Keys

```bash
node generate-keys.cjs
```

This creates:

```
private.pem
public.pem
```

⚠️ Never commit private keys.

---

## Database Setup

```sql
CREATE DATABASE ledger;
```

Then run:

```
sql/schema.sql
```

---

## API

### Create Entry

```http
POST /entries
```

Header:

```
x-api-key: your-api-key
```

Body:

```json
{
  "streamId": "grades:cvsg",
  "eventType": "GradeCreated",
  "payload": {
    "gradeId": "grade-001",
    "value": 8
  }
}
```

---

### Verify Chain

```http
GET /streams/:streamId/verify
```

---

### Create Digest

```http
POST /streams/:streamId/digests/:date
```

---

### Get Digest

```http
GET /streams/:streamId/digests/:date
```

---

### Get Proof

```http
GET /streams/:streamId/proof/:sequence
```

---

### Verify Proof

```http
POST /verify-proof
```

---

### Public Key

```http
GET /public-key
```

---

## Security Notes

- Do not store personal data in payloads
- Use hashed identifiers
- Protect private key
- Protect write endpoints

---

## Docker

```bash
docker build -t ledger .
docker run -p 3000:3000 ledger
```

---

## License

MIT