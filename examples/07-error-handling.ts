/**
 * Example 07: Typed error handling
 */
import {
  ZiviolaConvert,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  JobFailedError,
  ZiviolaError,
} from '@ziviola/convert';

async function main() {
  const ziviola = new ZiviolaConvert();

  // Sync conversion error handling
  try {
    const result = await ziviola.convert('./file.docx');
    await result.toFile('./output.pdf');
  } catch (err) {
    if (err instanceof AuthenticationError) {
      console.error('Invalid API key');
    } else if (err instanceof RateLimitError) {
      console.error(`Rate limit hit. Resets at ${err.resetAt?.toISOString()}`);
      console.error(`Limit: ${err.limit}, Remaining: ${err.remaining}`);
    } else if (err instanceof ValidationError) {
      console.error('Validation error:', err.message, err.code);
    } else if (err instanceof ZiviolaError) {
      console.error('SDK error:', err.name, err.message);
    } else {
      throw err;
    }
  }

  // Async job error handling
  try {
    const handle = await (await ziviola.createJob())
      .attachFile('./document.docx')
      .start();
    await handle.wait();
  } catch (err) {
    if (err instanceof JobFailedError) {
      console.error(`Job ${err.jobId} failed: ${err.errorMessage}`);
    } else {
      throw err;
    }
  }
}

main().catch(console.error);
