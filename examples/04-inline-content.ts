/**
 * Example 04: Inline content and URL inputs
 */
import { ZiviolaConvert } from '@ziviola/convert';

async function main() {
  const ziviola = new ZiviolaConvert();

  const html = `
    <!DOCTYPE html>
    <html>
      <head><title>Dynamic Report</title></head>
      <body>
        <h1>Sales Report — Q1 2026</h1>
        <p>Revenue: $1,234,567</p>
      </body>
    </html>
  `;

  const handle = await (await ziviola.createJob())
    .attachInline(html, { format: 'html', filename: 'report.html' })
    .attachUrl('https://example.com/appendix.pdf')
    .start();

  const result = await handle.wait();
  console.log('Converted files:', result.files.map((f) => f.filename));
}

main().catch(console.error);
