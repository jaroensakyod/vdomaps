# Tile still frames (<dir>/<prefix><frame>.jpg) into contact sheets of 7 x 2, frame numbers burned in (review only).
# Usage: py scripts/still-sheet.py <dir> <prefix>
import glob, os, re, sys
from PIL import Image, ImageDraw

d, pre = sys.argv[1], sys.argv[2]
fs = sorted(glob.glob(os.path.join(d, pre + "*.jpg")), key=lambda f: int(re.findall(r"(\d+)\.jpg$", f)[0]))
W, H = 270, 480
for part in range((len(fs) + 13) // 14):
    sub = fs[part * 14:(part + 1) * 14]
    S = Image.new("RGB", (W * 7, H * 2), "black")
    for i, f in enumerate(sub):
        im = Image.open(f).resize((W, H))
        ImageDraw.Draw(im).text((6, 6), re.findall(r"(\d+)\.jpg$", f)[0], fill="yellow")
        S.paste(im, ((i % 7) * W, (i // 7) * H))
    S.save(os.path.join(d, f"sheet_{pre}{part}.jpg"), quality=88)
print(len(fs), "frames")
