# Live Smoke Tests

This directory contains integration tests that run against a live (deployed) instance.

## How It Works

Tests in this directory are **not** included in `npm test`. They require environment variables
pointing to a running instance and valid credentials.

### Required Environment Variables

```bash
export {{ENV_PREFIX}}API_URL="https://your-staging-url.example.com"
export {{ENV_PREFIX}}TOKEN="your-api-token"
export {{ENV_PREFIX}}TENANT_ID="your-test-tenant-id"
```

### Running

```bash
# Via helper script
bin/api-smoke-test.sh

# Or directly
node --test --import tsx test/live/*.test.ts
```

### Skip Pattern

Tests should self-skip when env vars are missing:

```typescript
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";

describe("API smoke tests", () => {
  const apiUrl = process.env.{{ENV_PREFIX}}API_URL;
  const token = process.env.{{ENV_PREFIX}}TOKEN;

  before(() => {
    if (!apiUrl || !token) {
      console.log("Skipping: {{ENV_PREFIX}}API_URL and {{ENV_PREFIX}}TOKEN not set");
      process.exit(0);
    }
  });

  it("GET /api/health returns 200", async () => {
    const res = await fetch(`${apiUrl}/api/health`);
    assert.strictEqual(res.status, 200);
  });
});
```
