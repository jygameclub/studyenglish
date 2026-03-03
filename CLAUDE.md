# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI English Speaking Assistant (AI 英语口语助手) — a zero-build web application for Chinese learners to practice English phrases. The app is split into three files: `index.html` (HTML structure), `style.css` (styles + theming), and `app.js` (application logic).

## File Structure

```
studyenglish/
├── index.html      # HTML structure (~200 lines)
├── app.js          # Application logic (~400 lines)
├── style.css       # Styles and theme variables (~180 lines)
├── favicon.svg     # Site icon (indigo + "Aa")
├── README.md       # Project documentation
└── CLAUDE.md       # AI development guidance
```

## Development

No build tools, package manager, or test framework. Open `index.html` directly in a browser to run. Refresh to see changes.

### External Dependencies (loaded via CDN)

- **Tailwind CSS** — utility-first styling (`cdn.tailwindcss.com`)
- **Lucide Icons** — icon library; call `lucide.createIcons()` after any DOM update that adds `<i data-lucide="...">` elements
- **Google Fonts** — Inter, JetBrains Mono, Noto Serif SC

### Browser APIs Used

- **Web Speech API** — `SpeechSynthesis` for TTS playback, `webkitSpeechRecognition` for shadowing/pronunciation comparison
- **Gemini API** — `generativelanguage.googleapis.com` for AI sentence explanation (requires user-supplied API key)
- **localStorage** — all phrase data and settings persist client-side under `oral_ai_*` keys

## Architecture

### UI Structure (Three Tabs)

1. **Study (练习)** — phrase cards with TTS playback, auto-play loop, category filtering, search, Chinese-hide mode, speech shadowing, AI explanation modal
2. **Manage (词库)** — add/delete/reorder phrases, JSON import/export with modal dialog
3. **Settings (设置)** — Gemini API key, voice settings (voice/rate/pitch), visual theme selection, font/size customization

### Theming System

CSS custom properties in `:root` (defined in `style.css`) define design tokens. Themes are applied via `data-theme` (light/dark) and `data-style` (modern/github/retro/academic/cyber) attributes on `<html>`. Each style override block sets the relevant CSS variables. When adding a new theme, add a `[data-style="name"]` CSS block in `style.css` and a button in the settings grid in `index.html`.

### Data Model

Phrases are stored as an array of objects: `{ id, type, en, cn, level }`. `type` is one of the category strings (餐厅, 购物, 交通, etc.). `level` is mastery (0=未, 1=疑, 2=熟). The array is persisted to `localStorage` key `oral_ai_v6_data` via `saveAndSync()`.

### Data Persistence (localStorage keys)

| Key | Content |
|-----|---------|
| `oral_ai_v6_data` | Phrase array (JSON) |
| `oral_ai_theme` | `"light"` or `"dark"` |
| `oral_ai_style` | Style name (modern/github/retro/academic/cyber) |
| `oral_ai_font` | Font family string or `"inherit"` |
| `oral_ai_font_size` | Base font size percentage (e.g. `"100"`) |
| `oral_ai_apiKey` | Gemini API key |
| `oral_ai_voice` | Selected voice index |
| `oral_ai_rate` | Speech rate (0.5–2) |
| `oral_ai_pitch` | Speech pitch (0.5–2) |

### app.js Code Organization

The JS file is organized into labeled sections:
1. **数据与状态** — constants, state variables, localStorage hydration
2. **工具函数** — `escapeHtml()`, `getFilteredPhrases()`, `saveAndSync()`, `showToast()`, `updateIndicator()`
3. **初始化** — `init()`
4. **主题与视觉** — theme toggle, style apply, font/size settings
5. **导航** — tab switching
6. **分类筛选** — category chips rendering and selection
7. **学习与播放** — study list rendering, TTS playback, auto-play, shadowing
8. **管理** — manage list rendering, add phrase
9. **排序** — move/delete/mastery
10. **导入与导出** — export JSON download, import modal with file upload + paste
11. **AI 解析** — Gemini API integration
12. **设置与其他** — API key, voices, settings, clear data

### Key Conventions

- All state mutations to `phrases` must end with `saveAndSync()` to persist and re-render
- After injecting HTML that uses Lucide icons, call `lucide.createIcons()` to initialize them
- UI language is Chinese; phrase content is English with Chinese translations
- All user content rendered into HTML must be passed through `escapeHtml()` to prevent XSS
- Study list functions use `displayIdx` (index into filtered results from `getFilteredPhrases()`), not raw `phrases` array index
