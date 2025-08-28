

## Upgrades
- Renderer buttons wired to AI (`Remove BG`, `Inpaint`, `Upscale 2x`).
- WebGL compositor in renderer for faster draws.
- History panel with undo/redo (path-based snapshots).
- Real-ESRGAN upscale endpoint with CPU bicubic fallback.

## Desktop

### Install dependencies

```
cd apps/desktop
npm install
```

### Development

```
npm run dev
```

### Production build

```
npm run build
```

### AI worker URL

The desktop app expects an AI worker running at `http://127.0.0.1:8001`. Set the
`VITE_AI_WORKER_URL` environment variable to point to a different host or port
when running or building the app.

### Troubleshooting

- If models are missing, the AI worker will download Real-ESRGAN weights on
  first use. Without them, a slower CPU bicubic fallback is used.
- Ensure the AI worker is reachable at the URL above; adjust
  `VITE_AI_WORKER_URL` if it runs elsewhere.
- Platform notes: packaging for macOS, Windows or Linux uses
  `electron-builder` and may require additional system dependencies.

### Run AI worker (requires models)
- Install PyTorch matching your CUDA (see PyTorch install guide).
- `pip install -r apps/ai-workers/requirements.txt`
- `uvicorn main:app --reload --port 8001`

> Real-ESRGAN weights download on first use. If unavailable, CPU bicubic fallback is used.
