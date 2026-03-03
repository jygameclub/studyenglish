# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI English Speaking Assistant (AI 英语口语助手) — a single-file, zero-build web application for Chinese learners to practice English phrases. Everything lives in `index.html` (HTML + CSS + JS, ~650 lines).

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
2. **Manage (词库)** — add/delete/reorder phrases, JSON import/export
3. **Settings (设置)** — Gemini API key, visual theme selection, font/size customization

### Theming System

CSS custom properties in `:root` define the design tokens. Themes are applied via `data-theme` (light/dark) and `data-style` (modern/github/retro/academic/cyber) attributes on `<html>`. Each style override block sets the relevant CSS variables. When adding a new theme, add a `[data-style="name"]` CSS block and a button in the settings grid.

### Data Model

Phrases are stored as an array of objects: `{ id, type, en, cn, level }`. `type` is one of the category strings (餐厅, 购物, 交通, etc.). `level` is mastery (0=未, 1=疑, 2=熟). The array is persisted to `localStorage` key `oral_ai_v6_data` via `saveAndSync()`.

### Key Conventions

- All state mutations to `phrases` must end with `saveAndSync()` to persist and re-render
- After injecting HTML that uses Lucide icons, call `lucide.createIcons()` to initialize them
- UI language is Chinese; phrase content is English with Chinese translations
