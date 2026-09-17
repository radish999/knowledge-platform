export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}
export function messageOf(error: unknown) {
  return error instanceof Error
    ? error.message
    : '处理失败，请检查输入后重试。';
}
