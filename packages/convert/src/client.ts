import { readFile } from 'node:fs/promises';
import {
  ZiviolaTransport,
  ZiviolaWebhooks,
  fetchUsage,
  validateAuth,
} from '@ziviola/sdk-core';
import type { ZiviolaClientOptions, ProductUsageSummary } from '@ziviola/sdk-core';
import { ConvertResult } from './convert-result.js';
import { ConvertJob } from './convert-job.js';
import { ConvertJobHandle } from './convert-job-handle.js';
import type { ConvertOptions, CreateConvertJobOptions } from './types.js';

const VERSION = '0.1.0';

async function resolveSource(
  source: string | Uint8Array | ReadableStream,
  options: { filename?: string; contentType?: string },
): Promise<{ data: Uint8Array; contentType: string; filename: string }> {
  let data: Uint8Array;
  let filename: string;

  if (typeof source === 'string') {
    data = new Uint8Array(await readFile(source));
    filename = options.filename ?? source.split(/[\\/]/).pop() ?? 'file';
  } else if (source instanceof Uint8Array) {
    data = source;
    filename = options.filename ?? 'file';
  } else {
    const reader = source.getReader();
    const chunks: Uint8Array[] = [];
    let totalLength = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value as Uint8Array);
      totalLength += (value as Uint8Array).length;
    }
    data = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      data.set(chunk, offset);
      offset += chunk.length;
    }
    filename = options.filename ?? 'file';
  }

  const contentType = options.contentType ?? 'application/octet-stream';
  return { data, contentType, filename };
}

export class ZiviolaConvert {
  private readonly transport: ZiviolaTransport;
  readonly webhooks: ZiviolaWebhooks;

  constructor(options?: ZiviolaClientOptions) {
    if (options?.auth) {
      validateAuth(options.auth);
    }

    this.transport = ZiviolaTransport.fromClientOptions(
      options,
      process.env['ZIVIOLA_CONVERT_API_KEY'],
      'convert',
      'node',
      VERSION,
    );

    this.webhooks = new ZiviolaWebhooks(this.transport, 'convert');
  }

  /**
   * Synchronous single-file PDF conversion.
   * POST /api/v1/convert/pdf (multipart)
   */
  async convert(
    source: string | Uint8Array | ReadableStream,
    options: ConvertOptions = {},
  ): Promise<ConvertResult> {
    const { data, contentType, filename } = await resolveSource(source, options);

    const form = new FormData();
    form.append('file', new Blob([data], { type: contentType }), filename);

    if (options.pdfOptions) {
      form.append('pdfOptions', JSON.stringify(options.pdfOptions));
    }
    if (options.output) {
      form.append('output', JSON.stringify(options.output));
    }

    const response = await this.transport.request<Response>({
      method: 'POST',
      path: '/api/v1/convert/pdf',
      body: form,
      raw: true,
    });

    return ConvertResult.fromResponse(response);
  }

  /**
   * Create an async conversion job (fluent builder).
   */
  createJob(options?: CreateConvertJobOptions): Promise<ConvertJob> {
    return ConvertJob.create(this.transport, options);
  }

  /**
   * Access a previously created job by ID.
   */
  job(jobId: string): ConvertJobHandle {
    return new ConvertJobHandle(jobId, this.transport);
  }

  /**
   * Current month's Convert usage for the authenticated user.
   */
  async usage(): Promise<ProductUsageSummary> {
    return fetchUsage(this.transport, 'convert');
  }
}
