export type ConvertInputFormat =
  | 'pdf'
  | 'docx'
  | 'doc'
  | 'html'
  | 'markdown'
  | 'txt'
  | 'png'
  | 'jpeg'
  | 'webp';

// ─── Job Creation Options ──────────────────────────────────────────────────────

export type ConvertOperation = 'convert' | 'merge';

export interface CreateConvertJobOptions {
  operation?: ConvertOperation;
  output?: { filename?: string };
  idempotencyKey?: string;
  webhookKey?: string;
  metadata?: Record<string, string | number | boolean>;
  pdfOptions?: ConvertPdfOptions;
}

export interface ConvertPdfOptions {
  pageSize?: string;
  landscape?: boolean;
  margins?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  password?: string;
  pdfa?: boolean;
}

// ─── Input Attach Options ──────────────────────────────────────────────────────

export interface AttachConvertFileOptions {
  filename?: string;
  contentType?: string;
  order?: number;
}

export interface AttachConvertUrlOptions {
  filename?: string;
  sourceFormat?: ConvertInputFormat | 'auto';
  timeout?: number;
  blockScripts?: boolean;
  order?: number;
}

export interface AttachConvertInlineOptions {
  format?: 'html' | 'markdown' | 'txt';
  filename?: string;
  order?: number;
  baseUrl?: string;
}

// ─── Sync Conversion ────────────────────────────────────────────────────────

export interface ConvertOptions {
  filename?: string;
  contentType?: string;
  output?: { filename?: string };
  pdfOptions?: ConvertPdfOptions;
}

// ─── Job Status and Results ───────────────────────────────────────────────────

export type ConvertJobStatus =
  | 'created'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'partial_success'
  | 'failed'
  | 'cancelled';

export interface ConvertInputStatus {
  id: string;
  filename: string;
  source: 'upload' | 'url' | 'inline';
  content: ConvertInputFormat;
  status: 'pending_upload' | 'pending' | 'processing' | 'completed' | 'failed';
  order: number;
  mergeGroupId?: string;
  errorMessage?: string;
}

export interface ConvertJobStatusResponse {
  jobId: string;
  status: ConvertJobStatus;
  operation: ConvertOperation;
  outputFilename: string;
  progress: {
    total: number;
    completed: number;
    failed: number;
    processing: number;
  };
  inputs: ConvertInputStatus[];
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface ConvertResultFile {
  url: string;
  filename: string;
  size: number;
  expiresAt: string;
  inputId?: string;
  mergeGroupId?: string;
}

export interface ConvertFailedInput {
  inputId: string;
  filename: string;
  error: string;
}

export interface ConvertJobResult {
  jobId: string;
  status: ConvertJobStatus;
  files: ConvertResultFile[];
  failed: ConvertFailedInput[];
}
