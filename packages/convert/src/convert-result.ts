import { writeFile } from 'node:fs/promises';
import { Readable } from 'node:stream';

export class ConvertResult {
  readonly contentType = 'application/pdf' as const;

  constructor(
    readonly filename: string | null,
    readonly contentLength: number | null,
    private readonly _buffer: Uint8Array,
  ) {}

  async toFile(path: string): Promise<void> {
    await writeFile(path, this._buffer);
  }

  async toBuffer(): Promise<Uint8Array> {
    return this._buffer;
  }

  async toStream(): Promise<ReadableStream> {
    return new ReadableStream({
      start: (controller) => {
        controller.enqueue(this._buffer);
        controller.close();
      },
    });
  }

  /** @internal */
  static async fromResponse(response: Response): Promise<ConvertResult> {
    const contentDisposition = response.headers.get('content-disposition');
    const filename = extractFilename(contentDisposition);
    const contentLength = parseContentLength(response.headers.get('content-length'));
    const buffer = new Uint8Array(await response.arrayBuffer());
    return new ConvertResult(filename, contentLength, buffer);
  }
}

function extractFilename(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;
  const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
  if (!match || !match[1]) return null;
  return match[1].replace(/['"]/g, '').trim() || null;
}

function parseContentLength(value: string | null): number | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}
