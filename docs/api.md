# API Documentation

Base URL:
http://localhost:3000

## POST /entries

Create a new ledger entry.

Headers:
x-api-key: your-api-key

Body:
{
  "streamId": "grades:cvsg",
  "eventType": "GradeCreated",
  "payload": {
    "gradeId": "voto-001",
    "value": 8
  }
}

---

## GET /streams/:streamId/verify

Verify integrity of the chain.

---

## POST /streams/:streamId/digests/:date

Create Merkle root for a day.

---

## GET /streams/:streamId/digests/:date

Retrieve digest.

---

## GET /streams/:streamId/proof/:sequence

Get Merkle proof.

---

## POST /verify-proof

Verify a proof.

---

## GET /public-key

Return public key.