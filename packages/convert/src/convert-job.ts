import { readFile } from 'node:fs/promises';
import { presignedUpload } from '@ziviola/sdk-core';
import type { ZiviolaTransport } from '@ziviola/sdk-core';
import type {
  CreateConvertJobOptions,
  AttachConvertFileOptions,
  AttachConvertUrlOptions,
  AttachConvertInlineOptions,
} from './types.js';
import { ConvertJobHandle } from './convert-job-handle.js';

interface CreateJobResponse {
  jobId: string;
}

export class ConvertJob {
  private readonly inputs: Array<() => Promise<void>> = [];

  constructor(
    private readonly jobId: string,
    private readonly transport: ZiviolaTransport,
    private readonly _options: CreateConvertJobOptions = {},
  ) {}

  /**
   * Attach a file via presigned upload.
   * Returns `this` for fluent chaining (queues upload; actual upload runs on .start()).
   */
  attachFile(
    source: string | Uint8Array | ReadableStream,
    options: AttachConvertFileOptions = {},
  ): ConvertJob {
    this.inputs.push(async () => {
      const { data, contentType, filename } = await resolveSource(source, options);

      await presignedUpload(
        {
          inputsUrl: `${this.transport.baseUrl}/api/v1/convert/jobs/${this.jobId}/inputs`,
          inputBody: {
            input: {
              source: 'upload',
              contentType,
              filename,
              order: options.order ?? 0,
            },
          },
          data,
          contentType,
          responseField: 'inputId',
          authHeaders: this.transport.getAuthHeaders(),
        },
        fetch,
      );
    });
    return this;
  }

  /** Attach a URL input. */
  attachUrl(url: string, options: AttachConvertUrlOptions = {}): ConvertJob {
    this.inputs.push(async () => {
      await this.transport.request({
        method: 'POST',
        path: `/api/v1/convert/jobs/${this.jobId}/inputs`,
        body: {
          input: {
            source: 'url',
            url,
            filename: options.filename,
            sourceFormat: options.sourceFormat,
            timeout: options.timeout,
            blockScripts: options.blockScripts,
            order: options.order ?? 0,
          },
        },
      });
    });
    return this;
  }

  /** Attach inline HTML / Markdown / text content. */
  attachInline(content: string, options: AttachConvertInlineOptions = {}): ConvertJob {
    this.inputs.push(async () => {
      await this.transport.request({
        method: 'POST',
        path: `/api/v1/convert/jobs/${this.jobId}/inputs`,
        body: {
          input: {
            source: 'inline',
            content: 'text',
            value: content,
            format: options.format,
            filename: options.filename,
            order: options.order ?? 0,
            baseUrl: options.baseUrl,
          },
        },
      });
    });
    return this;
  }

  /** Upload all pending inputs sequentially, then start the job. */
  async start(): Promise<ConvertJobHandle> {
    for (const upload of this.inputs) {
      await upload();
    }

    await this.transport.request<void>({
      method: 'POST',
      path: `/api/v1/convert/jobs/${this.jobId}/start`,
    });

    return new ConvertJobHandle(this.jobId, this.transport);
  }

  /** @internal — create a new job via POST /api/v1/convert/jobs */
  static async create(
    transport: ZiviolaTransport,
    options: CreateConvertJobOptions = {},
  ): Promise<ConvertJob> {
    const response = await transport.request<CreateJobResponse>({
      method: 'POST',
      path: '/api/v1/convert/jobs',
      body: options,
    });
    return new ConvertJob(response.jobId, transport, options);
  }
}

async function resolveSource(
  source: string | Uint8Array | ReadableStream,
  options: AttachConvertFileOptions,
): Promise<{ data: Uint8Array; contentType: string; filename: string }> {
  let data: Uint8Array;
  let filename: string;

  if (typeof source === 'string') {
    // File path
    data = new Uint8Array(await readFile(source));
    filename = options.filename ?? source.split(/[\\/]/).pop() ?? 'file';
  } else if (source instanceof Uint8Array) {
    data = source;
    filename = options.filename ?? 'file';
  } else {
    // ReadableStream
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
