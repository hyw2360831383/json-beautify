# JSON Beautify

> JSON 格式化与美化工具 —— 实时处理、语法高亮、零报错体验

[![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-blue)](https://hyw2360831383.github.io/json-beautify/)
[![Vue](https://img.shields.io/badge/Vue-3.4-42b883)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646cff)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6)](https://www.typescriptlang.org/)

## 项目概述

JSON Beautify 是一个轻量级的前端工具，专门用于 JSON 数据的格式化、压缩和语法高亮展示。它运行在浏览器中，无需后台服务器，所有处理都在本地完成，数据不会上传到任何地方。

**核心目标**：让开发者能够快速粘贴一段杂乱的 JSON 字符串，立即看到格式化后、带彩色语法高亮的结果。

### 主要特点

- ✅ **实时自动格式化** —— 输入内容后无需手动点击，300 毫秒内自动处理
- ✅ **语法高亮** —— 键名、字符串、数字、布尔值、null 各用不同颜色显示
- ✅ **零报错体验** —— 无论怎么输入都不会弹错误提示，右侧始终显示内容
- ✅ **两种处理模式** —— 格式化（美化缩进）和压缩（移除空格换行）
- ✅ **深色/浅色主题切换** —— 一键切换，偏好自动保存
- ✅ **可拖拽分栏** —— 左右面板宽度自由调节
- ✅ **一键复制** —— 复制处理后的纯文本 JSON
- ✅ **键盘快捷键** —— `Ctrl+Enter` 快速格式化

## 项目架构

项目采用组件化架构，将页面拆分为多个独立的 Vue 组件，每个组件负责一块独立的 UI 区域。业务逻辑封装在 Hook（钩子函数）中，与 UI 分离。

```
┌─────────────────────────────────────────────┐
│                 App.vue（根组件）             │
│   ┌─ Toolbar.vue        工具栏（清空+主题）  │
│   └─ ThemeSwitcher.vue  主题切换按钮         │
│   ┌──────────────┬──────────────┐            │
│   │  JsonEditor   │  JsonViewer  │            │
│   │  （输入区）    │  （结果区）   │            │
│   └──────────────┴──────────────┘            │
│   Hooks（业务逻辑层）                         │
│   useJsonProcessor / useClipboard / useTheme  │
│   useResizableSplit                          │
└─────────────────────────────────────────────┘
```

### 数据流

```
JsonEditor（输入） → useJsonProcessor（处理） → JsonViewer（显示）
```

用户在左侧输入 JSON → 通过 v-model 同步到 Hook → 经过 300ms 防抖后自动解析/格式化 → 生成带语法高亮的 HTML → 传递给右侧显示。

## 技术栈

| 类别 | 技术 | 用途 |
|------|------|------|
| 框架 | Vue 3 (Composition API) | 构建用户界面，响应式数据绑定 |
| 构建工具 | Vite 5 | 开发服务器 + 生产打包 |
| 语言 | TypeScript | 类型安全，更好的代码提示 |
| 样式 | Tailwind CSS 3 | 原子化 CSS，快速构建界面 |
| 图标 | 内联 SVG | 轻量图标，无需额外图标库 |
| 部署 | GitHub Pages | 免费静态网站托管 |

## 文件结构

```
json-beautify/
├── index.html                      ← 入口 HTML 页面
├── package.json                    ← 项目配置，记录依赖和脚本
├── vite.config.ts                  ← Vite 构建工具配置
├── tsconfig.json                   ← TypeScript 编译配置
├── tailwind.config.js              ← Tailwind CSS 配置
├── postcss.config.js               ← PostCSS 配置
├── .gitignore                      ← Git 忽略规则
├── env.d.ts                        ← TypeScript 环境声明
├── public/                         ← 静态资源目录
│   └── vite.svg                    ← 网站图标
├── src/                            ← 源码目录
│   ├── main.ts                     ← 应用启动入口
│   ├── App.vue                     ← 根组件（页面骨架）
│   ├── style.css                   ← 全局样式 + 主题变量
│   ├── types/                      ← 类型定义
│   │   └── index.ts                ← ProcessMode / Theme / JsonProcessResult
│   ├── components/                 ← UI 组件
│   │   ├── JsonEditor.vue          ← 左侧 JSON 输入区
│   │   ├── JsonViewer.vue          ← 右侧结果展示区
│   │   ├── Toolbar.vue             ← 工具栏（清空+主题）
│   │   └── ThemeSwitcher.vue       ← 主题切换按钮
│   └── hooks/                      ← 业务逻辑 Hook
│       ├── useJsonProcessor.ts     ← JSON 格式化核心逻辑
│       ├── useClipboard.ts         ← 剪贴板操作
│       ├── useTheme.ts             ← 主题管理
│       └── useResizableSplit.ts    ← 拖拽分栏
└── dist/                           ← 构建产物（部署用）
```

## 核心功能

### 1. JSON 实时格式化

用户在左侧输入 JSON 文本后，系统会自动检测输入变化。采用**防抖机制**——用户停止输入 300 毫秒后才触发一次处理，避免频繁处理造成性能问题。

- JSON 格式正确时：自动加上缩进美化显示
- JSON 格式暂不正确时：原样显示输入内容，**不报错、不空白**

### 2. 语法高亮

格式化后的 JSON 带有彩色标记，不同元素用不同颜色区分：

| 元素 | 颜色 | 说明 |
|------|------|------|
| 🔵 键名（Key） | 蓝色 | JSON 对象的属性名 |
| 🟢 字符串值（String） | 绿色 | 双引号包裹的文本 |
| 🟡 数字（Number） | 黄色 | 整数、小数、科学记数法 |
| 🟣 布尔值（true/false） | 紫色 | 布尔类型 |
| 🔴 null | 红色 | 空值 |
| ⚪ 括号（{}[]） | 灰色 | 花括号和方括号 |

采用"标记-替换-还原"三步策略实现精确高亮：先用特殊标记占位键名 → 对字符串值上色 → 还原键名并赋予不同颜色。

### 3. 压缩模式

除了格式化，工具还支持**压缩**模式。点击压缩按钮后，JSON 中的所有空格和换行都会被移除，变成一行紧凑的文本，减小文件体积。

### 4. 主题切换

支持**深色**和**浅色**两种主题。切换后整个页面的背景、文字、边框颜色都会相应变化。主题偏好自动保存到浏览器本地存储中，下次打开页面自动恢复。

### 5. 可拖拽分栏

左右面板之间的分隔条可以用鼠标拖拽，自由调整输入区和结果区的宽度比例（限制在 20% ~ 80% 之间）。

### 6. 一键复制

点击"复制"按钮可将右侧显示的内容还原为纯文本 JSON 并复制到剪贴板，成功后显示提示，2 秒后自动消失。

## 模块代码详解

### 入口文件 — `index.html`

应用入口 HTML 页面。定义空的 `<div id="app">` 容器，Vue 应用挂载到此容器中。

### 应用入口 — `main.ts`

启动文件，仅 4 行：导入 Vue → 导入 App.vue → 导入全局样式 → 挂载到 `#app`。

### 类型定义 — `types/index.ts`

定义项目中使用的数据类型：
- `ProcessMode`：FORMAT（格式化）/ COMPRESS（压缩）
- `Theme`：DARK（深色）/ LIGHT（浅色）
- `JsonProcessResult`：content（内容）、success（是否成功）、error（错误信息）

### 根组件 — `App.vue`

核心骨架，组装所有子组件。从上到下分为：
- 顶部标题栏（标题 + 快捷键提示）
- Toolbar 工具栏（清空按钮 + 主题切换）
- 主内容区（左右分栏 + 可拖拽分隔条）
- 左侧 JsonEditor + 右侧 JsonViewer

同时负责协调所有 Hook，注册 `Ctrl+Enter` 快捷键。

### 输入组件 — `JsonEditor.vue`

左侧面板，提供 textarea 输入框。顶部显示"JSON 输入"标题，右侧实时统计行数和字符数。

### 结果组件 — `JsonViewer.vue`

右侧面板，根据状态显示不同内容：
- 有结果 → 带语法高亮的 HTML
- 空状态 → 提示图标和文字

底部包含格式化、压缩、复制三个操作按钮及复制成功提示。

### 工具栏 — `Toolbar.vue` + `ThemeSwitcher.vue`

- **Toolbar**：左侧"清空"按钮（无输入时灰色禁用），右侧主题切换按钮
- **ThemeSwitcher**：太阳 ☀️ / 月亮 🌙 图标切换深色/浅色模式

### 核心 Hook — `useJsonProcessor.ts`

最重要的文件，包含 JSON 处理核心逻辑：

| 函数 | 作用 |
|------|------|
| `highlightJson()` | 将格式化后的 JSON 转为带语法高亮的 HTML |
| `escapeText()` | JSON 格式不正确时，将原始输入转为安全的 HTML 文本 |
| `processJson()` | 尝试解析 JSON，成功则格式化，失败则返回原始输入 |
| `handleProcess()` | 根据解析结果决定调用高亮还是原样显示 |

**防抖机制**：使用 `watch` 监听输入变化，不断重置 300ms 定时器，只有停止输入后才触发处理。

### 剪贴板 Hook — `useClipboard.ts`

提供 `copyToClipboard` 函数。优先使用 `navigator.clipboard` API，不支持时降级使用 `document.execCommand`。成功后显示提示，2 秒自动消失。

### 主题 Hook — `useTheme.ts`

管理深色/浅色主题。初始化时从 `localStorage` 读取上次选择，切换时修改 `<html>` 的 `data-theme` 属性，CSS 根据此属性切换颜色变量。偏好自动持久化。

### 分栏 Hook — `useResizableSplit.ts`

实现左右面板拖拽调整。默认各占 50%，拖拽时实时计算位移百分比更新宽度，限制在 20% ~ 80% 之间。

### 样式文件 — `style.css`

定义全局样式和 CSS 变量。通过 CSS 变量实现主题切换——深色变量在 `:root` 中，浅色变量在 `[data-theme="light"]` 中。还定义了语法高亮颜色类、拖拽分隔条样式和自定义滚动条。

## 部署

项目部署在 [GitHub Pages](https://hyw2360831383.github.io/json-beautify/)。

### 部署步骤

```bash
# 1. 构建项目
npm run build

# 2. 推送到 gh-pages 分支
node deploy-ghpages.cjs
```

Vite 配置中 `base` 路径设置为 `/json-beautify/`，确保子路径下资源正确加载。`.nojekyll` 文件用于告诉 GitHub Pages 不要用 Jekyll 处理此站点。

## 使用指南

1. 打开网页，在左侧文本框粘贴或输入 JSON
2. 右侧自动显示格式化后、带彩色语法高亮的结果
3. **格式化**：点击"格式化"按钮或按 `Ctrl+Enter`
4. **压缩**：点击"压缩"按钮，将 JSON 压成一行
5. **复制**：点击"复制"按钮，将结果复制到剪贴板
6. **清空**：点击"清空"按钮，清除所有内容
7. **主题切换**：点击工具栏右侧的太阳/月亮图标
8. **调整宽度**：拖拽中间分隔条调整左右面板比例

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建产物
npm run preview
```

## License

Private
