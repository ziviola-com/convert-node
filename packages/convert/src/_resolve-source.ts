async function resolveSource(
  source: string | Uint8Array | ReadableStream,
  options: { filename?: string; contentType?: string },
): Promise<{ data: Uint8Array; contentType: string; filename: string }> {
  const { readFile } = await import('node:fs/promises');

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
