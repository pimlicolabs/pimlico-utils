# @pimlico/webhook

A library for verifying webhook requests from Pimlico. [Example](./../../examples/webhook).

## Installation

```bash
pnpm install @pimlico/webhook
```

## Usage

```typescript
import { pimlicoWebhookVerifier } from "@pimlico/webhook"

const verifyWebhook = pimlicoWebhookVerifier(process.env.PIMLICO_API_KEY)

const body = await verifyWebhook(
    req.headers as Record<string, string>,
    Buffer.from(JSON.stringify(req.body))
)
```
