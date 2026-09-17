# GoodBai · ImageFit 与知识平台

主站：[https://www.goodbai.baby/](https://www.goodbai.baby/)

- `/`：ImageFit 图片上传合规助手，图片仅在浏览器本地处理
- `/tools`：GoodBai 工具箱首页
- `/tools/image-privacy`：图片水印与实色遮挡，支持将结果交给 ImageFit 压缩
- `/tools/pdf`：图片转 PDF、合并、按页提取与排序
- `/tools/developer`：JSON 格式化/压缩、文本对比、时间戳转换
- `/knowledge`：原知识平台首页
- `/articles`：知识文章列表

## 开发与验证

```bash
npm install
npm run dev
npm run lint
npm run build
npx playwright install chromium
npm test
```

已安装 Chrome 时，也可运行 `PLAYWRIGHT_CHANNEL=chrome npm test`。测试覆盖图片遮挡导出与 ImageFit 衔接、PDF 页序与文件生成、开发工具转换、移动端布局和深色主题。

新增工具按路由懒加载；PDF 解析依赖在开始任务时加载到 Web Worker，旧浏览器的图片转换兼容路径单独按需加载。`config/seo-pages.json` 生成各工具的静态入口和站点地图，Vercel 重写规则见 `vercel.json`。

### 当前范围

- 图片：JPG / PNG / WebP 输入，单张 ≤20MB、≤2400 万像素；实色遮挡、可撤销、平铺或底部水印，导出 PNG。
- PDF：图片转 PDF（A4 或图片比例）、多个 PDF 合并、页码范围提取、顺序与重复页面；单个 PDF ≤50MB，总文件 ≤100MB，最多 50 个文件 / 2000 个输出页面。拆成多个文件时分别选择页码下载；暂不支持加密 PDF、交互表单及 PDF 压缩。
- 开发：标准 JSON 格式化与压缩、按行文本对比、秒/毫秒时间戳和本地/UTC 日期互转。
- 所有文件和输入内容在本地内存处理，不上传、不持久保存。图片到 ImageFit 的衔接使用一次性的内存 File。

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

### 性能与后台任务

- 图片预览最长边为 1440px，原图只在导出时解码；拖动选区通过独立覆盖层按动画帧更新，水印调整复用预览画布。导出仍使用原始分辨率和原图坐标。
- 图片导出和 PDF 解析/生成使用本地 Web Worker；PDF 缓存已解析文档，图片逐张转换并释放中间画布。移除文件、清空、取消或离开页面时释放对应后台资源。
- JSON 和文本对比在后台执行，输入框避免逐字触发整页渲染；差异结果每段显示 100 行，完整结果仍可逐段查看。
- 取消会终止当前 Worker，后续任务重新创建；旧任务的结果不能覆盖新输入。缺少 OffscreenCanvas 的浏览器使用兼容的图片处理路径。
- 性能回归：`PLAYWRIGHT_CHANNEL=chrome npm test -- performance.spec.ts --workers=1`，使用 4 倍 CPU 降速检查 24MP 图片、600 页 PDF 与 1500 行文本对比期间的主线程长任务。测量时避免同时运行构建或其他重负载任务。

### Vercel 访问统计

已接入 `@vercel/analytics/react`，并使用 React Router 的路径记录首次访问及站内页面切换。Vercel 项目后台需保持 Web Analytics 开启。

- 仅生产构建中的 `www.goodbai.baby` 和 `goodbai.baby` 记录访问；本地开发、构建预览和 Vercel 预览域名不发送统计。
- 仅记录页面浏览，不接入自定义事件；URL 查询参数和片段会被移除，`/pv` 管理入口不记录浏览。工具内容、文件和文件名不会传入统计组件。
- 访问 `/pv` 可打开项目的 Vercel Web Analytics 后台；需使用有项目权限的 Vercel 账号登录。统计数据可能延迟几分钟展示，浏览器的拦截扩展也可能阻止上报。
- 此入口已替代旧 Nginx 统计面板；Vercel 网站的流量以 Vercel 后台为准。
