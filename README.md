# Kiri Tracker

A Windows desktop application for tracking goals using the **Harada Method** — a 9×9 grid with a central goal, eight foundational objectives, and daily action squares.

## Requirements

- TO BE DONE

## Usage

| Action | Result |
|--------|--------|
| Click daily square | Log a daily action (green flash feedback) |
| Click foundation | Open expanded 3×3 foundational view |
| Esc / click outside / click foundation again | Close foundational view |
| Double-click any cell | Edit cell label |
| Scroll down | View activity heatmap |

## Tech stack

- Electron — native Windows desktop shell
- React + TypeScript — UI
- Vite — build tooling
- JSON file persistence via Electron `userData` path
