/**
 * Example 06: Webhook handler using Express — verify signature and process events
 * 
 * Run: npx ts-node examples/06-webhook-handler.ts
 * Requires: npm install express @types/express
 */
import express from 'express';
import { verifyWebhookSignature } from '@ziviola/convert';

const app = express();

app.post(
  '/webhooks/convert',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const signature = req.headers['x-webhook-signature'] as string | undefined;

    const valid = verifyWebhookSignature({
      payload: req.body as Buffer,
      signature,
      secret: process.env['ZIVIOLA_WEBHOOK_SECRET'] ?? '',
      tolerance: 300,
    });

    if (!valid) {
      console.warn('Invalid webhook signature received');
      return res.sendStatus(400);
    }

    const envelope = JSON.parse((req.body as Buffer).toString()) as {
      eventType: string;
      data: unknown;
    };
    console.log('Event received:', envelope.eventType, envelope.data);

    res.sendStatus(200);
  },
);

app.listen(3000, () => {
  console.log('Webhook handler listening on http://localhost:3000');
});
