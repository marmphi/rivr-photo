const AI_WORKER_URL = import.meta.env.VITE_AI_WORKER_URL ?? 'http://127.0.0.1:8001';

export async function apiRemoveBackground(imagePath: string) {
  const res = await fetch(`${AI_WORKER_URL}/remove-background`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ image_path: imagePath, preview: false })
  });
  if (!res.ok) throw new Error('remove-background failed');
  return await res.json() as { mask_path: string; cutout_path: string };
}
export async function apiInpaint(imagePath: string, polygon: {x:number;y:number}[], prompt: string, strength=0.7) {
  const res = await fetch(`${AI_WORKER_URL}/inpaint`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ image_path: imagePath, polygon, prompt, strength })
  });
  if (!res.ok) throw new Error('inpaint failed');
  return await res.json() as { output_path: string; mask_path: string };
}
export async function apiUpscale(imagePath: string, scale=2) {
  const res = await fetch(`${AI_WORKER_URL}/upscale`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ image_path: imagePath, scale })
  });
  if (!res.ok) throw new Error('upscale failed');
  return await res.json() as { output_path: string };
}