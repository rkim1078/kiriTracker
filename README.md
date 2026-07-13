# Kiri Tracker

A Windows desktop application for tracking goals using the [Harada Method](https://news.harvard.edu/gazette/story/2026/02/crush-your-goals-the-ohtani-way/) — a 9×9 grid with a central goal, eight foundational objectives towards achieving that goal, and daily action squares that contribute to each foundational objective.

## Requirements

- [Node.js 20+](https://nodejs.org/en/download)
- Windows 10/11

## Quick Start

```powershell
# Clone
git clone https://github.com/rkim1078/kiriTracker.git
cd kiriTracker

# Preview in development mode
npm run electron:dev

# Build desktop application
npm run electron:build
```

Installers are written to `%TEMP%\kiri-tracker-release\`:

| Output | Purpose |
|--------|---------|
| `Kiri Tracker Setup 1.0.0.exe` | Standard installer |
| `KiriTracker-Portable-1.0.0.exe` | Single-file portable app (no install) |

<details>
<summary>Note on installer failures</summary>

If the installer completes but shortcuts fail to launch, Windows Defender may have quarantined `KiriTracker.exe` during install. Add an exclusion for the install folder (`%LOCALAPPDATA%\Programs\KiriTracker`), uninstall and reinstall, or use the portable build.
</details>

## Features List

### Usage

| Action | Result |
|--------|--------|
| Click daily square | Log a daily action |
| Click foundation | Open that foundation’s 3×3 region in focus view |
| Toggle **Track** / **Edit** | Switch between logging actions and editing labels |
| **Undo log** | Remove the most recently logged action |
| Gear icon (title bar) | Open **Settings** |
| Moon / sun (title bar) | Toggle light / dark theme |
| Scroll down | View activity heatmap (if enabled) |

### Settings & Customization

Open **Settings** from the gear icon in the title bar:

| Setting | What it does |
|---------|----------------|
| **Accent** | Warm parchment, Forest, Slate, or Rose clay palette |
| **Density** | Compact, Comfortable, or Large grid spacing |
| **Text size** | Small, Medium, or Large UI text |
| **Grid layout** | **Full 9×9** (all dailies visible) or **Simplified** (goal + 8 foundations; click a foundation for its daily actions) |
| **Highlight logged today** | Mark daily squares already logged today |
| **Completion rings** | Progress ring on foundations based on today’s logged dailies |
| **Show activity heatmap** | Show or hide the contribution chart |
| **Heatmap range** | 3, 6, or 12 months |
| **Show inspirational quote** | Show or hide the quote above the board |
| **Replay guide** | Run first-run onboarding again |

## Tech stack

- Electron
- React + TypeScript
- Vite
- JSON file persistence via Electron `userData` path
- Preferences (theme accents, layout, density, etc.) stored in `localStorage`
