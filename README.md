# @ziviola/convert

Official Node.js SDK for the [Ziviola Convert](https://ziviola.com) document-to-PDF conversion API.

## Install

```bash
npm install @ziviola/convert
# or
pnpm add @ziviola/convert
```

## Zero-config quick start

Set `ZIVIOLA_CONVERT_API_KEY` in your environment, then:

```typescript
import { ZiviolaConvert } from '@ziviola/convert';

const ziviola = new ZiviolaConvert();
```

## Sync conversion

Convert a single file to PDF in one call:

```typescript
import { ZiviolaConvert } from '@ziviola/convert';

const ziviola = new ZiviolaConvert();

const result = await ziviola.convert('./invoice.docx');
await result.toFile('./invoice.pdf');
```

Access the result as a buffer or readable stream:

```typescript
const buffer = await result.toBuffer();
const stream = await result.toStream();
```

## Async job — convert multiple files

```typescript
const handle = await (await ziviola.createJob())
  .attachFile('./report.docx')
  .attachFile('./appendix.xlsx')
  .start();

const result = await handle.wait();

for (const file of result.files) {
  console.log(`${file.filename} — ${file.url}`);
}
```

## Async job — merge into one PDF

```typescript
const handle = await (await ziviola
  .createJob({ operation: 'merge', output: { filename: 'full-report.pdf' } }))
  .attachFile('./cover.html')
  .attachUrl('https://example.com/chapter-1.docx')
  .attachInline('<h1>Appendix</h1>', { format: 'html' })
  .start();

const result = await handle.wait();
console.log('Merged PDF:', result.files[0]?.url);
```

## Error handling

```typescript
import {
  ZiviolaConvert,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  JobFailedError,
} from '@ziviola/convert';

try {
  const result = await ziviola.convert('./file.docx');
  await result.toFile('./output.pdf');
} catch (err) {
  if (err instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (err instanceof RateLimitError) {
    console.error(`Rate limited. Resets at ${err.resetAt?.toISOString()}`);
  } else if (err instanceof ValidationError) {
    console.error('Validation:', err.message, err.code);
  } else if (err instanceof JobFailedError) {
    console.error(`Job ${err.jobId} failed:`, err.errorMessage);
  } else {
    throw err;
  }
}
```

## Webhook verification

```typescript
import { verifyWebhookSignature } from '@ziviola/convert';

// In an Express route (use raw body middleware)
app.post('/webhooks/convert', express.raw({ type: '*/*' }), (req, res) => {
  const valid = verifyWebhookSignature({
    payload: req.body,
    signature: req.headers['x-webhook-signature'],
    secret: process.env.ZIVIOLA_WEBHOOK_SECRET,
  });
  if (!valid) return res.sendStatus(400);
  // process event...
  res.sendStatus(200);
});
```

## Webhook management

```typescript
const webhook = await ziviola.webhooks.create({
  key: 'my-webhook',
  url: 'https://your-app.example.com/hooks/convert',
  events: ['job.completed', 'job.failed'],
});
console.log('Secret:', webhook.secret);

await ziviola.webhooks.list();
await ziviola.webhooks.rotateSecret('my-webhook');
await ziviola.webhooks.delete('my-webhook');
```

## Mock client (testing)

```typescript
import { MockZiviolaConvert } from '@ziviola/convert';

const client = new MockZiviolaConvert();

client.mock('POST', '/api/v1/convert/jobs', { jobId: 'test-job-1' });

const job = await client.createJob();
console.log(client.calls); // inspect recorded calls

client.reset();
```

## Environment variables

| Variable | Purpose |
|---|---|
| `ZIVIOLA_CONVERT_API_KEY` | API key (zero-config fallback) |

## Requirements

- Node.js 18+
- `ZIVIOLA_CONVERT_API_KEY` environment variable or explicit `auth` option

## License

MIT
