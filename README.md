

## Upgrades
- Renderer buttons wired to AI (`Remove BG`, `Inpaint`, `Upscale 2x`).
- WebGL compositor in renderer for faster draws.
- History panel with undo/redo (path-based snapshots).
- Real-ESRGAN upscale endpoint with CPU bicubic fallback.

### Run AI worker (requires models)
- Install PyTorch matching your CUDA (see PyTorch install guide).
- `pip install -r apps/ai-workers/requirements.txt`
- `uvicorn main:app --reload --port 8001`

> Real-ESRGAN weights download on first use. If unavailable, CPU bicubic fallback is used.
