/**
 * Example 08: Async job with polling progress and timeout handling
 */
import { ZiviolaConvert, TimeoutError } from '@ziviola/convert';

async function main() {
  const ziviola = new ZiviolaConvert();

  const handle = await (await ziviola.createJob())
    .attachFile('./large-document.docx')
    .start();

  console.log('Job started:', handle.jobId);

  try {
    const result = await handle.wait({
      pollInterval: 2000,     // poll every 2 seconds
      timeout: 120_000,       // give up after 2 minutes
      onProgress: (status) => {
        const { completed, total, processing } = status.progress;
        console.log(
          `[${new Date().toISOString()}] Status: ${status.status} — ${completed}/${total} done, ${processing} processing`,
        );
      },
    });

    console.log('Job completed:', result.status);
    for (const file of result.files) {
      console.log('  Output:', file.filename, '-', file.url);
    }
  } catch (err) {
    if (err instanceof TimeoutError) {
      console.error('Job did not complete within the timeout. Check status later:', handle.jobId);
    } else {
      throw err;
    }
  }
}

main().catch(console.error);
