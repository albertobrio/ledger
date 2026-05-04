# Cryptography

## Hashing

Algorithm: SHA-256

Used for:
- entry hashing
- chain linking
- Merkle tree

## Digital Signature

Algorithm: Ed25519

Properties:
- fast
- secure
- small keys

## Hash Chain

current_hash = sha256(sequence + payload + previous_hash)

## Merkle Tree

Binary structure:

root = sha256(left + right)

## Proof

Allows verifying inclusion without exposing all data.