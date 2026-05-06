/**
 * Example 01: Synchronous document conversion
 * Converts a DOCX file to PDF in a single call.
 */
import {
  ZiviolaConvert,
  ValidationError,
  AuthenticationError,
  RateLimitError,
} from '@ziviola/convert';

async function main() {
  // Zero-config: reads ZIVIOLA_CONVERT_API_KEY from environment
  const ziviola = new ZiviolaConvert();

  try {
    const result = await ziviola.convert('./invoice.docx');
    await result.toFile('./invoice.pdf');
    console.log('Converted successfully!');
    console.log('Filename:', result.filename);
    console.log('Size:', result.contentLength, 'bytes');
  } catch (err) {
    if (err instanceof AuthenticationError) {
      console.error('Invalid API key. Set ZIVIOLA_CONVERT_API_KEY in your environment.');
    } else if (err instanceof RateLimitError) {
      console.error(`Rate limit hit. Resets at ${err.resetAt?.toISOString()}`);
    } else if (err instanceof ValidationError) {
      console.error('Validation error:', err.message, err.code);
    } else {
      throw err;
    }
  }
}

main().catch(console.error);
