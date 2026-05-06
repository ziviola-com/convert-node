// ─── Main client ───────────────────────────────────────────────────────────────
export { ZiviolaConvert } from './client.js';

// ─── Result class ──────────────────────────────────────────────────────────────
export { ConvertResult } from './convert-result.js';

// ─── Job classes ───────────────────────────────────────────────────────────────
export { ConvertJob } from './convert-job.js';
export { ConvertJobHandle } from './convert-job-handle.js';

// ─── Types ─────────────────────────────────────────────────────────────────────
export type {
  ConvertInputFormat,
  ConvertOperation,
  ConvertOptions,
  ConvertPdfOptions,
  CreateConvertJobOptions,
  AttachConvertFileOptions,
  AttachConvertUrlOptions,
  AttachConvertInlineOptions,
  ConvertJobStatus,
  ConvertInputStatus,
  ConvertJobStatusResponse,
  ConvertResultFile,
  ConvertFailedInput,
  ConvertJobResult,
} from './types.js';

// ─── Error classes (re-exported from core) ────────────────────────────────────
export {
  ZiviolaError,
  ApiError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  PayloadTooLargeError,
  InternalServerError,
  TimeoutError,
  ConnectionError,
  JobFailedError,
} from '@ziviola/sdk-core';

// ─── Webhook signature verification ──────────────────────────────────────────
export { verifyWebhookSignature } from '@ziviola/sdk-core';
export type { VerifyWebhookSignatureOptions } from '@ziviola/sdk-core';

// ─── Shared types ─────────────────────────────────────────────────────────────
export type {
  ZiviolaClientOptions,
  ZiviolaAuth,
  WaitOptions,
  ProductUsageSummary,
  WebhookEvent,
  CreateWebhookConfig,
  UpdateWebhookConfig,
  WebhookConfig,
  WebhookWithSecret,
  RotateSecretResponse,
  WebhookTestResponse,
} from '@ziviola/sdk-core';

// ─── Mock client ───────────────────────────────────────────────────────────────
export { MockZiviolaConvert } from './mock.js';
