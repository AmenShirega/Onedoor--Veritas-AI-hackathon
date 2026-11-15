export function downsampleFloat32ToInt16Pcm(
  input: Float32Array,
  inputSampleRate: number,
  targetSampleRate = 16000
): Int16Array {
  if (input.length === 0) {
    return new Int16Array(0);
  }

  let samples: Float32Array;
  if (
    !Number.isFinite(inputSampleRate) ||
    inputSampleRate <= 0 ||
    Math.abs(inputSampleRate - targetSampleRate) < 1
  ) {
    samples = input;
  } else {
    const ratio = inputSampleRate / targetSampleRate;
    const outputLength = Math.max(1, Math.floor(input.length / ratio));
    samples = new Float32Array(outputLength);
    for (let i = 0; i < outputLength; i++) {
      const start = Math.floor(i * ratio);
      const end = Math.min(input.length, Math.floor((i + 1) * ratio));
      if (end <= start) {
        samples[i] = input[Math.min(start, input.length - 1)];
      } else {
        let sum = 0;
        for (let j = start; j < end; j++) {
          sum += input[j];
        }
        samples[i] = sum / (end - start);
      }
    }
  }

  const pcm = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    pcm[i] = clamped < 0 ? Math.round(clamped * 0x8000) : Math.round(clamped * 0x7fff);
  }
  return pcm;
}

export function int16ToBase64(pcm: Int16Array): string {
  const bytes = new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

export function base64ToFloat3224k(base64: string): Float32Array {
  const binary = atob(base64);
  const byteLength = binary.length - (binary.length % 2);
  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const view = new DataView(bytes.buffer);
  const sampleCount = byteLength / 2;
  const output = new Float32Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    const sample = view.getInt16(i * 2, true);
    output[i] = sample / 32768;
  }
  return output;
}

export function mergeTranscriptChunk(previous: string, chunk: string): string {
  const cleanChunk = chunk.replace(/\s+/g, ' ');
  if (!cleanChunk.trim()) return previous;
  if (!previous) return cleanChunk.trimStart();

  const startsWithPunct = /^[,.;:!?'"’”)\]]/.test(cleanChunk);
  const endsWithSpace = /\s$/.test(previous);
  const startsWithSpace = /^\s/.test(cleanChunk);

  if (startsWithPunct) {
    return `${previous.trimEnd()}${cleanChunk.trimStart()}`;
  }
  if (endsWithSpace || startsWithSpace) {
    return `${previous}${cleanChunk}`;
  }
  return `${previous} ${cleanChunk}`;
}
