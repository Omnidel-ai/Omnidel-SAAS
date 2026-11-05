"""Contact sheet of a take, with timestamps, for choosing cut points.

    python peek.py desk_review          # takes/desk_review.mp4 -> takes/peek_desk_review.jpg
    python peek.py phone --n 16         # more frames
    python peek.py D:/somewhere/x.mp4   # any video file
"""
import argparse
import io
import os
import subprocess
from pathlib import Path

import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
FF = imageio_ffmpeg.get_ffmpeg_exe()


def frame_at(path, t, width):
    png = subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-ss", f"{t:.3f}", "-i", path, "-frames:v", "1",
                          "-vf", f"scale={width}:-2", "-f", "image2pipe", "-vcodec", "png", "-"], check=True, capture_output=True).stdout
    return Image.open(io.BytesIO(png)).convert("RGB")


def main(src, n):
    path = src if os.path.isfile(src) else str(HERE / "takes" / f"{src}.mp4")
    _, secs = imageio_ffmpeg.count_frames_and_secs(path)
    first = frame_at(path, 0, 64)
    portrait = first.height > first.width
    width, cols = (240, 8) if portrait else (480, 4)
    try:
        font = ImageFont.load_default(size=20)
    except TypeError:  # Pillow < 10.1
        font = ImageFont.load_default()
    tiles = []
    for i in range(n):
        t = i * max(0.0, secs - 0.05) / max(1, n - 1)
        im = frame_at(path, t, width)
        d = ImageDraw.Draw(im)
        d.rectangle([0, 0, 74, 28], fill=(0, 0, 0))
        d.text((6, 3), f"{t:.1f}s", fill=(255, 80, 80), font=font)
        tiles.append(im)
    w, h = tiles[0].size
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGB", (w * cols, h * rows), "black")
    for k, im in enumerate(tiles):
        sheet.paste(im, ((k % cols) * w, (k // cols) * h))
    out = str(Path(path).with_name(f"peek_{Path(path).stem}.jpg"))
    sheet.save(out, quality=85)
    print(f"{secs:.2f}s, {n} frames -> {out}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("take", help="take name in ./takes, or a path to a video")
    ap.add_argument("--n", type=int, default=12, help="frames on the sheet (default 12)")
    a = ap.parse_args()
    main(a.take, a.n)
