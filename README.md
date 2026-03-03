# AI 英语口语助手

一款面向中国英语学习者的口语练习工具，支持语音播放、跟读对比、AI 解析和多主题切换。零构建、纯前端，浏览器直接打开即可使用。

## 功能特性

- **短语练习** — 按场景分类浏览短语卡片，支持搜索、自动循环播放、中文隐藏模式
- **语音跟读** — 基于 Web Speech API 的发音对比，实时反馈准确度
- **AI 深度解析** — 接入 Gemini API，一键获取翻译、词汇、语法和例句
- **词库管理** — 添加、删除、排序短语，支持 JSON 导入导出
- **多主题切换** — Modern / GitHub / Retro / Academic / Cyber 五种视觉风格 + 明暗模式
- **自定义排版** — 可调字体、字号、语速、音调

## 快速开始

1. 克隆仓库或下载文件
2. 用浏览器打开 `index.html`
3. （可选）在设置页填入 [Gemini API Key](https://aistudio.google.com/app/apikey) 以启用 AI 解析

无需安装任何依赖或构建工具。

## 技术栈

| 技术 | 用途 |
|------|------|
| HTML / CSS / JS | 应用主体 |
| Tailwind CSS (CDN) | 工具类样式 |
| Lucide Icons (CDN) | 图标 |
| Google Fonts (CDN) | Inter / JetBrains Mono / Noto Serif SC |
| Web Speech API | 语音合成与识别 |
| Gemini API | AI 句子解析 |
| localStorage | 客户端数据持久化 |

## 目录结构

```
studyenglish/
├── index.html      # HTML 结构
├── app.js          # 应用逻辑
├── style.css       # 样式文件
├── favicon.svg     # 网站图标
├── README.md       # 项目文档
└── CLAUDE.md       # AI 开发指引
```

## 使用说明

### 练习模式
- 点击短语卡片播放发音
- 使用分类标签筛选场景（餐厅、购物、交通等）
- 点击麦克风图标开始跟读对比
- 点击 AI 图标获取句子深度解析
- 点击「顺序循环播放」自动播放当前分类

### 词库管理
- 在管理页添加新短语（英文 + 中文翻译 + 分类）
- 使用上下箭头调整顺序
- 导出为 JSON 备份，或从 JSON 文件/文本导入

### 主题设置
- 点击左上角图标切换明暗模式
- 在设置页选择视觉风格
- 自定义字体和字号大小
