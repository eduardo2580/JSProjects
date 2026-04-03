# Eduardo's Node.js Project Launcher

A sleek Next.js launcher for managing and running multiple Node.js projects from a single dashboard.

## Setup

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

## Adding Projects

Edit `public/launcher_projects.json`:

```json
[
  {
    "name": "My Project",
    "path": "MyProject/index.js",
    "description": "What this project does.",
    "category": "game"
  }
]
```

The `path` is relative to the root of this launcher directory.

Categories: `game`, `puzzle`, `card` — or add your own.

## How It Works

- The UI reads `launcher_projects.json` at startup
- Clicking **Launch** sends a `POST /api/launch` with the project path
- The API spawns `node <path>` as a detached child process
- The PID is returned so you can track it
- Use `kill <PID>` in your terminal to stop a running project

## Production

```bash
npm run build
npm start
```

## Protected under Brazilian Law nº 9,610/98
