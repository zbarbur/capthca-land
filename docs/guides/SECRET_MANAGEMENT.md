# Secret Management — Rotation, Storage, Access Control

## Storage Tiers

Secrets must be stored appropriately for each environment. Never use the same mechanism everywhere.

| Environment | Storage | Access |
|---|---|---|
| Local development | `.env` file (gitignored) | Developer machine only |
| CI/CD | Pipeline secrets (GitHub Actions secrets, Cloud Build substitutions) | Build-time only |
| Staging | Secret Manager (GCP/AWS/Azure) | IAM-controlled runtime access |
| Production | Secret Manager with audit logging | IAM-controlled, logged, alerting on access |

### Environment Variables for Development

```bash
# .env — NEVER committed to git
DATABASE_URL=postgresql://localhost:5432/myapp_dev
API_SECRET=dev-secret-not-for-production
TYPESENSE_WRITE_KEY=xyz123
```

Ensure `.env` is in `.gitignore`. Add a `.env.example` with placeholder values (no real secrets) for onboarding.

## The SecretProvider Abstraction

Abstract secret access behind an interface so the application works identically in development (env vars) and production (Secret Manager).

```typescript
// lib/secrets.ts
export interface SecretProvider {
	get(name: string): Promise<string>;
}

// Local implementation — reads from environment
export class EnvSecretProvider implements SecretProvider {
	async get(name: string): Promise<string> {
		const value = process.env[name];
		if (!value) throw new Error(`Secret not found in env: ${name}`);
		return value;
	}
}

// Cloud implementation — reads from Secret Manager
export class CloudSecretProvider implements SecretProvider {
	constructor(private readonly projectId: string) {}

	async get(name: string): Promise<string> {
		const client = new SecretManagerServiceClient();
		const [version] = await client.accessSecretVersion({
			name: `projects/${this.projectId}/secrets/${name}/versions/latest`,
		});
		return version.payload?.data?.toString() ?? "";
	}
}

// Factory
export function createSecretProvider(): SecretProvider {
	if (process.env.NODE_ENV === "production" || process.env.USE_SECRET_MANAGER) {
		return new CloudSecretProvider(process.env.GCP_PROJECT_ID!);
	}
	return new EnvSecretProvider();
}
```

## Key Rotation with Transition Window

Rotating a secret must not cause downtime. Always support a transition window where both old and new secrets are valid.

### Rotation Procedure

1. **Generate** new secret/key
2. **Deploy** new secret alongside old one (both valid)
3. **Update** all consumers to use the new secret
4. **Verify** all consumers are using the new secret (check logs/metrics)
5. **Revoke** old secret after transition window (24-72 hours)

### Implementation Pattern

```typescript
// Support multiple valid keys during rotation
const VALID_API_KEYS = [
	process.env.API_KEY_CURRENT,
	process.env.API_KEY_PREVIOUS, // valid during rotation window
].filter(Boolean);

function validateApiKey(key: string): boolean {
	const keyHash = sha256(key);
	return VALID_API_KEYS.some((valid) => {
		const validHash = sha256(valid!);
		return timingSafeEqual(Buffer.from(keyHash), Buffer.from(validHash));
	});
}
```

### Rotation Schedule

| Secret type | Rotation frequency | Transition window |
|---|---|---|
| API tokens | 90 days | 24 hours |
| Service account keys | 90 days | 48 hours |
| Database passwords | 180 days | 72 hours |
| Signing keys (JWT, HMAC) | 365 days | 7 days |
| Encryption keys | 365 days | 30 days |

## Permission Documentation

Every service that accesses secrets must have its permissions explicitly documented. This prevents the "who has access to what?" scramble during incidents.

```markdown
## Secret Access Matrix

| Secret | Services | Permission | Purpose |
|---|---|---|---|
| `db-password` | api-server, collector | secretAccessor | Database connection |
| `typesense-write-key` | collector | secretAccessor | Search index writes |
| `typesense-search-key` | dashboard | secretAccessor | Search queries |
| `auth-signing-key` | dashboard | secretAccessor | Session cookie signing |
| `admin-api-key` | typesense-vm | secretAccessor | Typesense admin operations |
```

## IAM Pre-Granting

Grant Secret Manager access to service accounts **before** deploying the service. A deploy that fails because of missing IAM permissions is a preventable outage.

```bash
# Grant BEFORE deploy
gcloud secrets add-iam-policy-binding my-secret \
  --member="serviceAccount:my-service@project.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Then deploy
bin/deploy-staging.sh my-service
```

Add IAM grants to your deploy script's pre-flight checks.

## Backup and Recovery

### Secret Backup Rules

- Secret Manager provides versioning — previous versions are retained
- Document which version is active and which are retained for rollback
- For critical secrets (encryption keys, signing keys), maintain offline backup in a secure vault
- Test recovery procedures quarterly

### Recovery Procedure

1. Identify the compromised or lost secret
2. Rotate to a new secret immediately (see rotation procedure above)
3. Revoke the old secret
4. Audit logs for unauthorized access during the exposure window
5. Update the secret access matrix documentation

## Docker Image Security

**Never bake secrets into Docker images.** Images are stored in registries, cached on build servers, and pulled by multiple services. A secret in an image is a secret shared with everyone.

```dockerfile
# BAD — secret baked into image
COPY .env /app/.env
ENV API_SECRET=hunter2

# GOOD — secrets injected at runtime
# In Cloud Run, Kubernetes, or docker-compose:
# env vars set via --set-secrets, secretKeyRef, or environment block
```

## Git Security

**Never commit secrets.** Use these safeguards:

1. **`.gitignore`** — Exclude `.env`, `*.pem`, `credentials.json`, `service-account-*.json`
2. **Pre-commit hook** — Scan for high-entropy strings and known secret patterns
3. **Git history** — If a secret was ever committed, rotate it immediately. Removing from history is insufficient — the secret is compromised.

```bash
# .gitignore
.env
.env.*
*.pem
*.key
service-account-*.json
credentials.json
```

## Audit Logging

All secret access should be logged for security audit purposes.

### What to Log

- Secret name accessed (never the value)
- Service/identity that accessed it
- Timestamp
- Success/failure of access

### What Never to Log

- The secret value itself
- Partial secret values (even "last 4 characters" can reduce entropy)
- Decrypted payloads

### Cloud Secret Manager Audit

Enable Data Access audit logs for Secret Manager in GCP:

```bash
# Enable audit logging for secret access
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="domain:example.com" \
  --role="roles/logging.viewer"
```

Set up alerts for unusual access patterns: access from unexpected service accounts, access outside business hours, or burst access to multiple secrets.
