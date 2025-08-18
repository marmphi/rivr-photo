import os
from typing import List, Dict, Tuple
from PIL import Image, ImageDraw
import torch
from diffusers import StableDiffusionXLInpaintPipeline
_PIPE = None
def _device() -> str: return 'cuda' if torch.cuda.is_available() else 'cpu'
def load_pipeline(model_id: str = 'diffusers/stable-diffusion-xl-1.0-inpainting-0.1'):
    global _PIPE
    if _PIPE is None:
        dtype = torch.float16 if torch.cuda.is_available() else torch.float32
        _PIPE = StableDiffusionXLInpaintPipeline.from_pretrained(model_id, torch_dtype=dtype)
        _PIPE = _PIPE.to(_device())
    return _PIPE
def polygon_to_mask(size: Tuple[int, int], polygon: List[Dict]) -> Image.Image:
    mask = Image.new('L', size, 0); draw = ImageDraw.Draw(mask)
    pts = [(int(p.get('x',0)), int(p.get('y',0))) for p in polygon]
    if len(pts) >= 3: draw.polygon(pts, fill=255)
    return mask
def inpaint(image_path: str, polygon: List[Dict], prompt: str, negative: str | None = None,
            strength: float = 0.7, model_id: str | None = None, seed: int | None = 12345,
            guidance_scale: float = 7.0, steps: int = 30):
    pipe = load_pipeline(model_id or 'diffusers/stable-diffusion-xl-1.0-inpainting-0.1')
    init = Image.open(image_path).convert('RGB')
    mask = polygon_to_mask(init.size, polygon)
    generator = torch.Generator(device=_device())
    if seed is not None: generator = generator.manual_seed(seed)
    result = pipe(prompt=prompt, negative_prompt=negative or '', image=init, mask_image=mask,
                  strength=float(max(0.0, min(1.0, strength))), guidance_scale=guidance_scale,
                  num_inference_steps=steps, generator=generator).images[0]
    base, _ = os.path.splitext(image_path)
    out_path = base + '_inpaint.png'; result.save(out_path)
    mask_path = base + '_editmask.png'; mask.save(mask_path)
    return out_path, mask_path
