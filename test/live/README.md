# Live Smoke Tests

This directory contains integration tests that run against a live (deployed) instance.

## How It Works

Tests in this directory are **not** included in `npm test`. They require environment variables
pointing to a running instance and valid credentials.

### Required Environment Variables

```bash
export CAPTHCA_LAND_API_URL="https://your-staging-url.example.com"
export CAPTHCA_LAND_TOKEN="your-api-token"
export CAPTHCA_LAND_TENANT_ID="your-test-tenant-id"
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
  const apiUrl = process.env.CAPTHCA_LAND_API_URL;
  const token = process.env.CAPTHCA_LAND_TOKEN;

  before(() => {
    if (!apiUrl || !token) {
      console.log("Skipping: CAPTHCA_LAND_API_URL and CAPTHCA_LAND_TOKEN not set");
      process.exit(0);
    }
  });

  it("GET /api/health returns 200", async () => {
    const res = await fetch(`${apiUrl}/api/health`);
    assert.strictEqual(res.status, 200);
  });
});
```
