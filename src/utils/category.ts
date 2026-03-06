// Category definitions and keyword rules
export const categoryRules: Record<string, string[]> = {
  '前端开发': ['React', 'Vue', 'Angular', 'Webpack', 'Vite', 'CSS', 'HTML', 'JavaScript', 'TypeScript', 'JS', 'TS', 'DOM', 'BFC', 'Flex', 'Grid'],
  '后端技术': ['Node', 'PHP', 'Java', 'Python', 'Go', 'SQL', 'Database', 'Redis', 'Nginx', 'Docker', 'CentOS', 'Linux', 'SSH'],
  '计算机基础': ['HTTP', 'HTTPS', 'TCP', 'UDP', 'DNS', '网络', '算法', '数据结构', '操作系统', '进程', '线程'],
  '工程化': ['Git', 'npm', 'yarn', 'pnpm', 'CI/CD', 'Jest', 'Test', 'Eslint', 'Prettier', 'Husky', 'Commitlint'],
  '安全': ['XSS', 'CSRF', '安全', '攻击', '防御', '加密', '解密'],
  '其他': [] // Fallback
};

// Gradient colors for each category
export const categoryColors: Record<string, string> = {
  '前端开发': 'from-blue-400 to-cyan-300',
  '后端技术': 'from-emerald-400 to-green-300',
  '计算机基础': 'from-indigo-400 to-purple-300',
  '工程化': 'from-amber-400 to-orange-300',
  '安全': 'from-red-400 to-rose-300',
  '其他': 'from-slate-400 to-gray-300'
};

/**
 * Determine the category of an article based on its title.
 */
export function getCategory(title: string): string {
  if (!title) return '其他';
  
  for (const [cat, keywords] of Object.entries(categoryRules)) {
    if (cat === '其他') continue;
    if (keywords.some(k => title.toLowerCase().includes(k.toLowerCase()))) {
      return cat;
    }
  }
  return '其他';
}
