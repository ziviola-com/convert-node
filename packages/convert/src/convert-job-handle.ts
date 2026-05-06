import { poll } from '@ziviola/sdk-core';
import type { WaitOptions } from '@ziviola/sdk-core';
import type { ZiviolaTransport } from '@ziviola/sdk-core';
import type {
  ConvertJobStatusResponse,
  ConvertJobResult,
} from './types.js';

export class ConvertJobHandle {
  constructor(
    readonly jobId: string,
    private readonly transport: ZiviolaTransport,
  ) {}

  async status(): Promise<ConvertJobStatusResponse> {
    return this.transport.request<ConvertJobStatusResponse>({
      method: 'GET',
      path: `/api/v1/convert/jobs/${this.jobId}`,
    });
  }

  async results(): Promise<ConvertJobResult> {
    return this.transport.request<ConvertJobResult>({
      method: 'GET',
      path: `/api/v1/convert/jobs/${this.jobId}/results`,
    });
  }

  async wait(options?: WaitOptions<ConvertJobStatusResponse>): Promise<ConvertJobResult> {
    await poll(
      () => this.status(),
      'convert',
      options,
    );
    return this.results();
  }

  async cancel(): Promise<void> {
    await this.transport.request<void>({
      method: 'POST',
      path: `/api/v1/convert/jobs/${this.jobId}/cancel`,
    });
  }

  async delete(): Promise<void> {
    await this.transport.request<void>({
      method: 'DELETE',
      path: `/api/v1/convert/jobs/${this.jobId}`,
    });
  }
}
