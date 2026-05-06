/**
 * Example 05: Webhook setup — create, list, update, rotate secret
 */
import { ZiviolaConvert } from '@ziviola/convert';

async function main() {
  const ziviola = new ZiviolaConvert();

  // Create a new webhook
  const webhook = await ziviola.webhooks.create({
    key: 'build-reports',
    url: 'https://your-app.example.com/webhooks/convert',
    events: ['job.completed', 'job.failed'],
  });
  console.log('Webhook created:', webhook.key);
  console.log('Webhook secret (store securely):', webhook.secret);

  // List all webhooks for this product
  const all = await ziviola.webhooks.list();
  console.log('All webhooks:', all.map((w) => w.key));

  // Update the webhook URL
  const updated = await ziviola.webhooks.update('build-reports', {
    url: 'https://your-app.example.com/webhooks/convert/v2',
  });
  console.log('Updated URL:', updated.url);

  // Rotate the secret
  const rotated = await ziviola.webhooks.rotateSecret('build-reports');
  console.log('New secret:', rotated.secret);
}

main().catch(console.error);
