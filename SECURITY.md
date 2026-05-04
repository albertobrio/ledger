# Security Policy

## Private Keys

Never commit private keys to the repository.

The private key should be stored using one of the following:

- Docker secrets
- cloud secret manager
- protected filesystem path
- HSM / Key Vault equivalent

## API Access

Write endpoints must be protected.

At minimum, configure:

```env
API_KEY=your-secret-key