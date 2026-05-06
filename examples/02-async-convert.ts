/**
 * Example 02: Async job — convert multiple files
 */
import { ZiviolaConvert } from '@ziviola/convert';

async function main() {
  const ziviola = new ZiviolaConvert();

  const handle = await (await ziviola
    .createJob())
    .attachFile('./report.docx')
    .attachFile('./appendix.xlsx')
    .start();

  console.log('Job started:', handle.jobId);

  const result = await handle.wait({
    onProgress: (status) => {
      const { completed, total } = status.progress;
      console.log(`Progress: ${completed}/${total}`);
    },
  });

  console.log(`Job completed with status: ${result.status}`);
  for (const file of result.files) {
    console.log(`  ${file.filename} — ${file.url}`);
  }

  if (result.failed.length > 0) {
    console.warn('Failed inputs:');
    for (const fail of result.failed) {
      console.warn(`  ${fail.filename}: ${fail.error}`);
    }
  }
}

main().catch(console.error);
