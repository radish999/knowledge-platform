import { memo, useMemo, useRef, useState } from 'react';
import type { Change } from 'diff';
const PAGE_SIZE = 100;
export default memo(function DiffResult({ changes }: { changes: Change[] }) {
  const [page, setPage] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  function changePage(delta: number) {
    setPage((p) => p + delta);
    container.current?.scrollTo({ top: 0 });
  }
  const result = useMemo(() => {
    const rows: { text: string; kind: string; noNewline: boolean }[] = [];
    let added = 0,
      removed = 0;
    for (const change of changes) {
      if (change.added) added += change.count ?? 0;
      if (change.removed) removed += change.count ?? 0;
      const lines = change.value.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (i === lines.length - 1 && !lines[i]) continue;
        rows.push({
          text: lines[i],
          kind: change.added ? 'added' : change.removed ? 'removed' : '',
          noNewline: i === lines.length - 1,
        });
      }
    }
    return { rows, added, removed };
  }, [changes]);
  const start = page * PAGE_SIZE;
  return (
    <>
      <p className="tools-success" role="status">
        {result.added || result.removed
          ? `新增 ${result.added} 行 · 删除 ${result.removed} 行`
          : '两段文本完全一致。'}
      </p>
      <div ref={container} className="tools-diff" aria-label="文本差异结果">
        {result.rows.slice(start, start + PAGE_SIZE).map((row, i) => (
          <div key={start + i} className={row.kind}>
            {row.kind === 'added' ? '+ ' : row.kind === 'removed' ? '− ' : '  '}
            {row.text || ' '}
            {row.noNewline && <span> ⟵ 文件末尾无换行</span>}
          </div>
        ))}
      </div>
      {result.rows.length > PAGE_SIZE && (
        <div className="tools-actions">
          <button disabled={page === 0} onClick={() => changePage(-1)}>
            上一段
          </button>
          <span className="tools-help">
            第 {start + 1}–{Math.min(start + PAGE_SIZE, result.rows.length)} 行
            / 共 {result.rows.length} 行
          </span>
          <button
            disabled={start + PAGE_SIZE >= result.rows.length}
            onClick={() => changePage(1)}
          >
            下一段
          </button>
        </div>
      )}
    </>
  );
});
