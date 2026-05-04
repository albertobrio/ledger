# Architecture

## Overview

Loop Ledger Service is a microservice implementing a tamper-evident ledger.

It uses:
- append-only storage
- hash chain
- Ed25519 signatures
- Merkle trees
- external anchoring

## Data Flow

Client
↓
POST /entries
↓
Ledger Service
↓
MySQL (append-only)
↓
Hash Chain
↓
Daily Merkle Root
↓
Signature
↓
External Anchor

## Components

### Ledger Entry

Each entry contains:
- sequence_number
- stream_id
- payload
- previous_hash
- current_hash
- signature

### Hash Chain

Each entry references the previous one:

H(n) = sha256(entry(n) + H(n-1))

### Merkle Tree

Daily aggregation:

leaf = entry hash  
node = sha256(left + right)

### External Anchor

Merkle root is stored outside the DB to prevent full history rewrite attacks.