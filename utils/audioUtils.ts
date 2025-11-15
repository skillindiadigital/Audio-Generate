
// Base64 decode function
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Decode raw PCM data into an AudioBuffer
export async function decodeBase64Audio(
  base64: string,
  ctx: AudioContext,
): Promise<AudioBuffer> {
    const data = decode(base64);
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length; // Assuming mono audio (numChannels = 1)
    const numChannels = 1;
    const sampleRate = 24000; // Gemini TTS returns 24kHz audio
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
}


// Stitch multiple AudioBuffers together
export function stitchAudioBuffers(buffers: AudioBuffer[], context: AudioContext): AudioBuffer {
  if (buffers.length === 0) {
    return context.createBuffer(1, 1, context.sampleRate);
  }

  const totalLength = buffers.reduce((acc, buffer) => acc + buffer.length, 0);
  const outputBuffer = context.createBuffer(
    1, // mono
    totalLength,
    context.sampleRate
  );

  const outputData = outputBuffer.getChannelData(0);
  let offset = 0;

  for (const buffer of buffers) {
    outputData.set(buffer.getChannelData(0), offset);
    offset += buffer.length;
  }

  return outputBuffer;
}


// Convert an AudioBuffer to a WAV Blob
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  const channels: Float32Array[] = [];
  let i: number, sample: number;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (i = 0; i < buffer.numberOfChannels; i++)
    channels.push(buffer.getChannelData(i));

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true); // write 16-bit sample
      pos += 2;
    }
    offset++; // next source sample
  }

  return new Blob([view], { type: "audio/wav" });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}
