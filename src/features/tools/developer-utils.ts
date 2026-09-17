import { diffLines } from 'diff';
export function formatJson(input: string, compact = false): string {
  if (!input.trim()) throw new Error('请先输入 JSON。');
  if (input.length > 1_000_000)
    throw new Error('JSON 内容超过 100 万字符，请缩小后重试。');
  try {
    return JSON.stringify(JSON.parse(input), null, compact ? undefined : 2);
  } catch (e) {
    throw new Error(
      `JSON 格式有误：${
        e instanceof Error ? e.message : '请检查引号、逗号和括号。'
      }`
    );
  }
}
export function compareText(before: string, after: string) {
  if (before.length + after.length > 200_000)
    throw new Error('两段文本合计不能超过 20 万字符，请分段对比。');
  const changes = diffLines(before, after, { timeout: 1000 });
  if (!changes) throw new Error('文本差异过多，请缩小范围后重新对比。');
  return changes;
}
export type TimeUnit = 'seconds' | 'milliseconds';
export function dateFromTimestamp(input: string, unit: TimeUnit): Date {
  if (!/^-?\d+$/.test(input.trim()))
    throw new Error('请输入整数时间戳，并选择秒或毫秒。');
  const value = Number(input.trim());
  const milliseconds = unit === 'seconds' ? value * 1000 : value;
  if (!Number.isSafeInteger(milliseconds))
    throw new Error('时间戳超出支持范围。');
  const date = new Date(milliseconds);
  if (Number.isNaN(date.getTime())) throw new Error('时间戳超出日期范围。');
  return date;
}
export function dateFromInput(input: string, timezone: 'local' | 'utc'): Date {
  const match = input.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/
  );
  if (!match) throw new Error('请选择完整的日期和时间。');
  const date = new Date(`${input}${timezone === 'utc' ? 'Z' : ''}`);
  const parts =
    timezone === 'utc'
      ? [
          date.getUTCFullYear(),
          date.getUTCMonth() + 1,
          date.getUTCDate(),
          date.getUTCHours(),
          date.getUTCMinutes(),
          date.getUTCSeconds(),
        ]
      : [
          date.getFullYear(),
          date.getMonth() + 1,
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
          date.getSeconds(),
        ];
  if (
    Number.isNaN(date.getTime()) ||
    parts.some((v, i) => v !== Number(match[i + 1] ?? 0))
  )
    throw new Error('日期无效，或该本地时间因夏令时调整而不存在。');
  return date;
}
export function describeDate(date: Date): string {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return `秒：${Math.floor(
    date.getTime() / 1000
  )}\n毫秒：${date.getTime()}\nUTC：${date.toISOString()}\n本地（${zone}）：${date.toLocaleString(
    'zh-CN',
    { hour12: false }
  )}`;
}
