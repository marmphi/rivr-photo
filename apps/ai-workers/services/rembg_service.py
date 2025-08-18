import os
from PIL import Image
from rembg import remove
def compute_alpha_mask(rgba: Image.Image) -> Image.Image:
    if rgba.mode != 'RGBA': rgba = rgba.convert('RGBA')
    return rgba.split()[-1]
def remove_background(image_path: str, mask_out: str | None = None, cutout_out: str | None = None):
    with Image.open(image_path) as im:
        im = im.convert('RGBA')
        cutout = remove(im)
    base, _ = os.path.splitext(image_path)
    cutout_path = cutout_out or (base + '_cutout.png')
    mask_path = mask_out or (base + '_mask.png')
    cutout.save(cutout_path)
    compute_alpha_mask(cutout).save(mask_path)
    return mask_path, cutout_path
