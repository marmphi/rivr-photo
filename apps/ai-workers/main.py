from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from services.rembg_service import remove_background as _remove_bg
from services.inpaint_service import inpaint as _inpaint
from services.upscale_service import upscale as _upscale

app = FastAPI(title='Rivr Photo AI Workers')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])

class RemoveBgReq(BaseModel):
    image_path: str
    preview: bool = False

@app.post('/remove-background')
def remove_background(req: RemoveBgReq):
    mask_path, cutout_path = _remove_bg(req.image_path)
    return {'mask_path': mask_path, 'cutout_path': cutout_path}

class InpaintReq(BaseModel):
    image_path: str
    polygon: list[dict]
    prompt: str
    negative: str | None = None
    strength: float = 0.7
    guidance_scale: float = 7.0
    steps: int = 30
    model_id: str | None = None
    seed: int | None = 12345

@app.post('/inpaint')
def inpaint(req: InpaintReq):
    out_path, mask_path = _inpaint(
        image_path=req.image_path, polygon=req.polygon, prompt=req.prompt,
        negative=req.negative, strength=req.strength, model_id=req.model_id,
        seed=req.seed, guidance_scale=req.guidance_scale, steps=req.steps
    )
    return {'output_path': out_path, 'mask_path': mask_path}

class UpscaleReq(BaseModel):
    image_path: str
    scale: int = 2

@app.post('/upscale')
def upscale(req: UpscaleReq):
    out = _upscale(req.image_path, req.scale)
    return {'output_path': out}
