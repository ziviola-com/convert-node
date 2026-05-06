/**
 * Example 03: Async job — merge multiple inputs into one PDF
 */
import { ZiviolaConvert } from '@ziviola/convert';

async function main() {
  const ziviola = new ZiviolaConvert();

  const handle = await (await ziviola
    .createJob({ operation: 'merge', output: { filename: 'full-report.pdf' } }))
    .attachFile('./cover.html')
    .attachUrl('https://example.com/chapter-1.docx')
    .attachInline('<h1>Appendix</h1><p>Auto-generated content.</p>', { format: 'html' })
    .start();

  console.log('Merge job started:', handle.jobId);

  const result = await handle.wait();
  console.log('Merged PDF:', result.files[0]?.url);
}

main().catch(console.error);
