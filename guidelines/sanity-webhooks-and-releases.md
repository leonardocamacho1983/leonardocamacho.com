# Sanity Webhooks and Releases Runbook

This runbook documents the P0 Sanity operations setup for this project:

- Incoming webhook endpoint in the app: `/api/sanity/webhook`
- Editorial release workflow with Scheduled Drafts / Content Releases

## 1) Webhook endpoint behavior

Endpoint:

- `POST /api/sanity/webhook`
- `GET /api/sanity/webhook` (health/config check)

Security:

- Requires `Authorization: Bearer <SANITY_WEBHOOK_BEARER_TOKEN>`
- Rejects unauthorized requests with `401`
- Deduplicates repeated deliveries using `idempotency-key` or document revision fallback
- Optionally restricts accepted datasets with `SANITY_WEBHOOK_ALLOWED_DATASETS`

Current action:

- Runs an automated SEO infra audit (MVP) for impacted routes
  - Scope: status, canonical, robots, sitemap consistency
  - Out of scope: editorial/content quality checks
- Emits alerts only for `P0` and `P1` findings (optional webhook)
- Logs sanitized event metadata (`operation`, `dataset`, `_id`, `_type`, `slug`) and audit summary
- Returns a JSON acknowledgement with `seoAudit` summary

## 2) Environment variables

Set in local `.env` and in Vercel Production:

- `SANITY_WEBHOOK_BEARER_TOKEN`
- `SANITY_WEBHOOK_ALLOWED_DATASETS` (comma-separated, default `production`)
- `SEO_AUDIT_ALERT_WEBHOOK_URL` (optional; receives only P0/P1 alerts)

Recommended token generation:

```bash
openssl rand -hex 32
```

## 3) Configure webhook in Sanity Manage

At `sanity.io/manage` -> Project -> API -> Webhooks:

1. Create a **Document webhook**.
2. URL: `https://www.leonardocamacho.com/api/sanity/webhook`
3. Method: `POST`
4. Dataset: `production`
5. Trigger on: `create`, `update`, `delete`
6. Filter (launch/content scope example):

```groq
_type in ["post", "category", "homePage", "aboutPage", "writingPage", "siteSettings"]
```

7. Add header:

- `Authorization: Bearer <SANITY_WEBHOOK_BEARER_TOKEN>`

8. Keep payload default, or use projection if you want smaller payloads.

## 4) Quick verification

Local check:

```bash
curl -sS http://localhost:4321/api/sanity/webhook
```

Expected:

- `ok: true`
- `tokenConfigured: true` when env is set

Manual POST check:

```bash
curl -sS -X POST http://localhost:4321/api/sanity/webhook \
  -H "Authorization: Bearer $SANITY_WEBHOOK_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -H "sanity-dataset: production" \
  -H "sanity-operation: update" \
  -d '{"_id":"drafts.test","_type":"post","_rev":"test-rev","slug":{"current":"test"}}'
```

## 5) Scheduled Drafts and Releases (editorial flow)

Scheduled Drafts are built on top of Content Releases.

Operational guidance:

1. Editors create/update drafts normally.
2. For one-document timed publish, use **Schedule** action on the document.
3. For multi-document coordinated publish, use **Content Releases**.
4. Keep webhook enabled to get operational visibility for create/update/delete events.

Notes:

- Scheduled Drafts is a paid feature in Sanity (Growth plan).
- Studio and API version requirements apply; keep project dependencies current.

## 6) Guardrails

- Treat webhook token as secret; never commit to git.
- Prefer draft-first editorial updates; publish with human approval.
- Keep destructive automation (`unpublish`, `delete`) behind explicit review.
