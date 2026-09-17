import { useEffect, useRef, useState } from 'react';
import DiffResult from './DiffResult';
import { isTaskCancelled, useTaskWorker } from './task-worker';
import type { Change } from 'diff';
import {
  dateFromInput,
  dateFromTimestamp,
  describeDate,
} from './developer-utils';
import type { TimeUnit } from './developer-utils';
import { ErrorNotice, ToolLayout } from './shared';
import { messageOf, saveBlob } from './file-utils';

type Mode = 'json' | 'diff' | 'time';
export default function DeveloperTools() {
  const [mode, setMode] = useState<Mode>('json');
  const json = useRef('');
  const jsonInput = useRef<HTMLTextAreaElement>(null);
  const [output, setOutput] = useState('');
  const before = useRef('');
  const beforeInput = useRef<HTMLTextAreaElement>(null);
  const after = useRef('');
  const afterInput = useRef<HTMLTextAreaElement>(null);
  const [changes, setChanges] = useState<Change[] | null>(null);
  const [timestamp, setTimestamp] = useState('');
  const [unit, setUnit] = useState<TimeUnit>('seconds');
  const [dateInput, setDateInput] = useState('');
  const [timezone, setTimezone] = useState<'local' | 'utc'>('local');
  const [timeResult, setTimeResult] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const worker = useTaskWorker(
    () =>
      new Worker(new URL('./workers/developer.worker.ts', import.meta.url), {
        type: 'module',
      })
  );
  const job = useRef(0);
  useEffect(
    () => () => {
      job.current++;
    },
    []
  );
  const [busy, setBusy] = useState(false);
  function cancelTask() {
    job.current++;
    worker.cancel();
    setBusy(false);
    setStatus('');
  }
  async function processText(kind: 'json' | 'diff', compact = false) {
    const current = ++job.current;
    setBusy(true);
    setError('');
    setStatus(kind === 'json' ? '正在整理 JSON…' : '正在对比文本…');
    if (kind === 'json') setOutput('');
    else setChanges(null);
    try {
      if (kind === 'json') {
        const result = await worker.run<string>({
          kind,
          text: json.current,
          compact,
        });
        if (current === job.current) setOutput(result);
      } else {
        const result = await worker.run<Change[]>({
          kind,
          before: before.current,
          after: after.current,
        });
        if (current === job.current) setChanges(result);
      }
    } catch (error) {
      if (current === job.current && !isTaskCancelled(error))
        setError(messageOf(error));
    } finally {
      if (current === job.current) {
        setBusy(false);
        setStatus('');
      }
    }
  }
  function run(action: () => void) {
    setError('');
    setStatus('');
    try {
      action();
    } catch (e) {
      setError(messageOf(e));
    }
  }
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus('已复制到剪贴板。');
    } catch {
      setError('无法访问剪贴板，请选中结果手动复制。');
    }
  }
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <ToolLayout
      title="开发者工具箱"
      description="整理 JSON、定位文本差异、转换时间戳。输入即用，内容仅留在当前页面。"
      path="/tools/developer"
    >
      <div className="tools-tabs" aria-label="开发工具">
        {(
          [
            ['json', 'JSON 格式化'],
            ['diff', '文本对比'],
            ['time', '时间戳转换'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            aria-pressed={mode === id}
            onClick={() => {
              cancelTask();
              setMode(id);
              setError('');
              setStatus('');
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <ErrorNotice message={error} />
      {mode === 'json' && (
        <section className="tools-panel">
          <div className="tools-editor-grid">
            <label>
              输入 JSON
              <textarea
                className="tools-code"
                ref={jsonInput}
                defaultValue={json.current}
                spellCheck={false}
                placeholder={'{"name":"GoodBai","tools":["ImageFit","PDF"]}'}
                onChange={(e) => {
                  json.current = e.target.value;
                  if (busy) cancelTask();
                  setOutput('');
                  setStatus('');
                }}
              />
            </label>
            <label>
              处理结果
              <textarea
                className="tools-code"
                value={output}
                readOnly
                spellCheck={false}
                placeholder="格式化或压缩后，结果显示在这里"
              />
            </label>
          </div>
          <div className="tools-actions">
            {busy && <button onClick={cancelTask}>取消处理</button>}
            <button
              className="tools-primary"
              disabled={busy}
              onClick={() => void processText('json')}
            >
              格式化 JSON
            </button>
            <button
              disabled={busy}
              onClick={() => void processText('json', true)}
            >
              压缩 JSON
            </button>
            <button disabled={!output} onClick={() => void copy(output)}>
              复制结果
            </button>
            <button
              disabled={!output}
              onClick={() =>
                saveBlob(
                  new Blob([output], { type: 'application/json' }),
                  'formatted.json'
                )
              }
            >
              下载 JSON
            </button>
            <button
              onClick={() => {
                cancelTask();
                json.current =
                  '{"name":"GoodBai","tools":["ImageFit","PDF"],"local":true}';
                if (jsonInput.current) jsonInput.current.value = json.current;
                setOutput('');
                setError('');
                setStatus('');
              }}
            >
              填入示例
            </button>
            <button
              onClick={() => {
                cancelTask();
                json.current = '';
                if (jsonInput.current) jsonInput.current.value = '';
                setOutput('');
                setError('');
                setStatus('');
              }}
            >
              清空
            </button>
          </div>
          <p className="tools-help">
            支持标准 JSON，最多 100 万字符。超大整数请用字符串表示，避免
            JavaScript 数值精度损失。
          </p>
        </section>
      )}
      {mode === 'diff' && (
        <section className="tools-panel">
          <div className="tools-editor-grid">
            <label>
              原始文本
              <textarea
                className="tools-code"
                ref={beforeInput}
                defaultValue={before.current}
                spellCheck={false}
                placeholder="粘贴修改前的文本"
                onChange={(e) => {
                  before.current = e.target.value;
                  if (busy) cancelTask();
                  setChanges(null);
                }}
              />
            </label>
            <label>
              修改后文本
              <textarea
                className="tools-code"
                ref={afterInput}
                defaultValue={after.current}
                spellCheck={false}
                placeholder="粘贴修改后的文本"
                onChange={(e) => {
                  after.current = e.target.value;
                  if (busy) cancelTask();
                  setChanges(null);
                }}
              />
            </label>
          </div>
          <div className="tools-actions">
            {busy && <button onClick={cancelTask}>取消处理</button>}
            <button
              className="tools-primary"
              disabled={busy}
              onClick={() => void processText('diff')}
            >
              对比文本
            </button>
            <button
              onClick={() => {
                cancelTask();
                [before.current, after.current] = [
                  after.current,
                  before.current,
                ];
                if (beforeInput.current)
                  beforeInput.current.value = before.current;
                if (afterInput.current)
                  afterInput.current.value = after.current;
                setChanges(null);
              }}
            >
              交换两侧
            </button>
            <button
              onClick={() => {
                cancelTask();
                before.current = '';
                after.current = '';
                if (beforeInput.current) beforeInput.current.value = '';
                if (afterInput.current) afterInput.current.value = '';
                setChanges(null);
                setError('');
              }}
            >
              清空
            </button>
          </div>
          <p className="tools-help">
            按行对比；保留空格和换行差异。两段文本合计最多 20 万字符。
          </p>
          {changes && <DiffResult changes={changes} />}
        </section>
      )}
      {mode === 'time' && (
        <>
          <div className="tools-editor-grid">
            <section className="tools-panel">
              <h2>时间戳 → 日期</h2>
              <label>
                时间戳
                <input
                  inputMode="numeric"
                  value={timestamp}
                  placeholder="例如：0"
                  onChange={(e) => {
                    setTimestamp(e.target.value);
                    setTimeResult('');
                  }}
                />
              </label>
              <label>
                单位
                <select
                  value={unit}
                  onChange={(e) => {
                    setUnit(e.target.value as TimeUnit);
                    setTimeResult('');
                  }}
                >
                  <option value="seconds">秒（Unix 时间戳）</option>
                  <option value="milliseconds">毫秒（JavaScript）</option>
                </select>
              </label>
              <div className="tools-actions">
                <button
                  className="tools-primary"
                  onClick={() =>
                    run(() =>
                      setTimeResult(
                        describeDate(dateFromTimestamp(timestamp, unit))
                      )
                    )
                  }
                >
                  转换为日期
                </button>
                <button
                  onClick={() =>
                    run(() => {
                      const now = new Date(
                        unit === 'seconds'
                          ? Math.floor(Date.now() / 1000) * 1000
                          : Date.now()
                      );
                      setTimestamp(
                        String(
                          unit === 'seconds'
                            ? Math.floor(now.getTime() / 1000)
                            : now.getTime()
                        )
                      );
                      setTimeResult(describeDate(now));
                    })
                  }
                >
                  使用当前时间
                </button>
              </div>
            </section>
            <section className="tools-panel">
              <h2>日期 → 时间戳</h2>
              <label>
                日期与时间
                <input
                  type="datetime-local"
                  step="0.001"
                  value={dateInput}
                  onChange={(e) => {
                    setDateInput(e.target.value);
                    setTimeResult('');
                  }}
                />
              </label>
              <label>
                输入时区
                <select
                  value={timezone}
                  onChange={(e) => {
                    setTimezone(e.target.value as 'local' | 'utc');
                    setTimeResult('');
                  }}
                >
                  <option value="local">本地 · {localZone}</option>
                  <option value="utc">UTC</option>
                </select>
              </label>
              <button
                className="tools-primary"
                onClick={() =>
                  run(() =>
                    setTimeResult(
                      describeDate(dateFromInput(dateInput, timezone))
                    )
                  )
                }
              >
                转换为时间戳
              </button>
            </section>
          </div>
          {timeResult && (
            <section className="tools-panel" style={{ marginTop: 20 }}>
              <h2>转换结果</h2>
              <pre className="tools-result" role="status">
                {timeResult}
              </pre>
              <div className="tools-actions">
                <button onClick={() => void copy(timeResult)}>
                  复制转换结果
                </button>
              </div>
            </section>
          )}
        </>
      )}
      <p className="tools-success" role="status">
        {status}
      </p>
    </ToolLayout>
  );
}
