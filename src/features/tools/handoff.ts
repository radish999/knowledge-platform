// One-shot in-memory handoff. Reads remain pure for React StrictMode/concurrent rendering.
let pendingImage: File | null = null;
export function queueImageForCompression(file: File) {
  pendingImage = file;
}
export function peekImageForCompression() {
  return pendingImage;
}
export function consumeImageForCompression(file: File) {
  if (pendingImage === file) pendingImage = null;
}
