# Security Model

## Guarantees

- tamper-evident data
- verifiable integrity
- signed entries
- Merkle proofs

## Threats mitigated

- data modification
- silent corruption
- record reordering

## Not mitigated

- full server compromise
- key theft

## Mitigations

- external anchor
- API protection
- audit logs

## Best Practices

- never store personal data directly
- hash identifiers
- protect private key