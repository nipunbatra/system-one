"""Contact sheets from scripts/shots.mjs output. Usage: python scripts/sheets.py <shotsDir>"""
import sys, glob, os
from PIL import Image, ImageDraw
d = sys.argv[1]; files = sorted(glob.glob(os.path.join(d, "p*.png")))
W, H, cols, rows = 800, 450, 3, 3
for s in range(0, len(files), cols * rows):
    sheet = Image.new("RGB", (cols * W, rows * H), "white")
    for k, f in enumerate(files[s:s + cols * rows]):
        im = Image.open(f).convert("RGB").resize((W - 8, H - 8))
        x, y = (k % cols) * W + 4, (k // cols) * H + 4
        sheet.paste(im, (x, y)); ImageDraw.Draw(sheet).text((x + 6, y + 4), os.path.basename(f)[1:3], fill="red")
    sheet.save(os.path.join(d, f"sheet{s // (cols * rows) + 1}.jpg"), quality=80)
print(len(files), "pages")
