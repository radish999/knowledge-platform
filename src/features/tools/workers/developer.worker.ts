import { compareText, formatJson } from '../developer-utils';
import type { TaskRequest } from '../task-worker';

type Request =
  | { kind: 'json'; text: string; compact: boolean }
  | { kind: 'diff'; before: string; after: string };
self.onmessage = ({ data }: MessageEvent<TaskRequest<Request>>) => {
  const { id, payload } = data;
  try {
    const result =
      payload.kind === 'json'
        ? formatJson(payload.text, payload.compact)
        : compareText(payload.before, payload.after);
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : '处理失败，请重试。',
    });
  }
};
