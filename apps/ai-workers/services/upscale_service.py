import os
from PIL import Image
try:
    from realesrgan import RealESRGAN
    import torch
    _HAVE = True
except Exception:
    _HAVE = False
def upscale(image_path: str, scale: int = 2) -> str:
    base, ext = os.path.splitext(image_path)
    out = f"{base}_upx{scale}{ext if ext else '.png'}"
    if _HAVE:
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        model = RealESRGAN(device, scale)
        model.load_weights(f'realesrgan-x{scale}plus')
        with Image.open(image_path).convert('RGB') as img:
            sr = model.predict(img)
            sr.save(out)
    else:
        with Image.open(image_path) as img:
            w,h = img.size
            img.resize((w*scale, h*scale), Image.BICUBIC).save(out)
    return out
