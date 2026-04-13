# Aesthetic CLI

Modular terminal animation playground built with [Ink](https://github.com/vadimdemedes/ink) and TypeScript. Browse and launch animations from an interactive menu.

## Getting Started

### Prerequisites

- Node.js 18+

### Install

```bash
npm install
```

### Run

```bash
npm start
```

This opens an interactive menu where you can browse and launch animations.

### Development

```bash
npm run dev
```

Watches for file changes and restarts automatically.

## Controls

| Context    | Key          | Action                    |
| ---------- | ------------ | ------------------------- |
| Menu       | `↑` / `↓`   | Navigate animation list   |
| Menu       | `Enter`      | Launch selected animation |
| Menu       | `q`          | Quit                      |
| Animation  | `q` / `Esc`  | Return to menu            |

## Available Animations

| Animation | Description                                                                 |
| --------- | --------------------------------------------------------------------------- |
| Watch     | Live clock displaying the current time as large ASCII art digits (HH:MM:SS) with the full date below. Updates every second. |
| DNA Helix | Rotating double helix with colored base pairs (A-T, G-C). Cyan and magenta strands with red, yellow, green, and magenta rungs. |

## Project Structure

```
src/
├── main.tsx              # Entry point
├── app.tsx               # Menu <-> Animation state machine
├── core/
│   ├── types.ts          # AnimationModule interface
│   ├── registry.ts       # Collects modules from barrel export
│   └── hooks.ts          # Shared hooks (useInterval)
├── components/
│   ├── header.tsx        # ASCII art banner
│   ├── menu.tsx          # Interactive selection list
│   └── status-bar.tsx    # Bottom hint text
└── animations/
    ├── index.ts          # Barrel — register modules here
    └── watch/
        ├── index.ts      # Module definition
        ├── watch.tsx      # Clock component
        ├── digit.ts       # ASCII digit renderer
        └── constants.ts   # Digit maps (0-9, colon)
```
