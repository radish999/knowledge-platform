import { useEffect, useState } from 'react';

export interface TaskRequest<T = unknown> {
  id: number;
  payload: T;
}
export interface TaskResponse {
  id: number;
  result?: unknown;
  error?: string;
  progress?: string;
}
export function isTaskCancelled(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}
// One active job per tool. Termination interrupts synchronous work too; ignoring
// an old Promise alone would leave expensive computation running in the background.
class TaskWorker {
  private worker: Worker | null = null;
  private sequence = 0;
  private pending: {
    id: number;
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
    progress?: (message: string) => void;
  } | null = null;
  private create: () => Worker;
  constructor(create: () => Worker) {
    this.create = create;
  }
  run<T>(payload: unknown, progress?: (message: string) => void): Promise<T> {
    if (this.pending) this.cancel();
    return new Promise<T>((resolve, reject) => {
      try {
        if (!this.worker) {
          this.worker = this.create();
          this.worker.onmessage = ({ data }: MessageEvent<TaskResponse>) => {
            const pending = this.pending;
            if (!pending || data.id !== pending.id) return;
            if (data.progress !== undefined) {
              pending.progress?.(data.progress);
              return;
            }
            this.pending = null;
            if (data.error) pending.reject(new Error(data.error));
            else pending.resolve(data.result);
          };
          this.worker.onerror = () => this.fail();
          this.worker.onmessageerror = () => this.fail();
        }
        const id = ++this.sequence;
        this.pending = {
          id,
          resolve: (value) => resolve(value as T),
          reject,
          progress,
        };
        this.worker.postMessage({ id, payload });
      } catch (error) {
        this.pending = null;
        reject(error);
      }
    });
  }
  notify(payload: unknown) {
    this.worker?.postMessage({ id: 0, payload });
  }
  private fail() {
    const pending = this.pending;
    this.pending = null;
    this.worker?.terminate();
    this.worker = null;
    pending?.reject(new Error('处理组件加载失败，请刷新页面后重试。'));
  }
  cancel() {
    const pending = this.pending;
    this.pending = null;
    this.worker?.terminate();
    this.worker = null;
    pending?.reject(new DOMException('任务已取消', 'AbortError'));
  }
}
export function useTaskWorker(create: () => Worker) {
  const [client] = useState(() => new TaskWorker(create));
  useEffect(() => () => client.cancel(), [client]);
  return client;
}
