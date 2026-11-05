"""Cut the product tour's four clips from the takes: MP4 + WebM + poster for each.

    python build_tour.py                      # reads ./takes, writes public/tour/
    python build_tour.py --dest D:/tmp/tour   # write somewhere else

One clip per feature tab in "See it in the app" (components/AppShowcase.tsx,
`showcase` in content/site.ts). Each plays once, so no end fade: the tour moves
to the next tab when a clip ends. After a re-shoot, check the takes with
peek.py and adjust CLIPS.
"""
import argparse
import os
import subprocess
from pathlib import Path

import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
FF = imageio_ffmpeg.get_ffmpeg_exe()
CANVAS = "0xfaf7f0"  # the site's --canvas

CLIPS = [  # (output name, take, in s, out s, scale)
    ("day", "desk_home", 1.5, 9.6, "1600:1000"),
    ("board", "desk_board", 0.2, 7.0, "1600:1000"),
    ("scores", "desk_review", 0.3, 9.8, "1600:1000"),
    ("acharya", "phone_quiz", 0.6, 10.2, "600:-2"),
]
POSTER_AT = 0.5


def run(args):
    subprocess.run([FF, "-y", "-hide_banner", "-loglevel", "error", *args], check=True)


def main(takes, dest):
    os.makedirs(dest, exist_ok=True)
    for name, take, a, b, scale in CLIPS:
        vf = (f"trim=start={a}:end={b},setpts=PTS-STARTPTS,fps=30,scale={scale}:flags=lanczos,"
              f"fade=t=in:st=0:d=0.25:color={CANVAS},format=yuv420p")
        out = os.path.join(dest, name)
        run(["-i", os.path.join(takes, take + ".mp4"), "-vf", vf, "-c:v", "libx264", "-preset", "slow", "-crf", "27",
             "-profile:v", "high", "-g", "60", "-movflags", "+faststart", "-an", out + ".mp4"])
        run(["-i", out + ".mp4", "-c:v", "libvpx-vp9", "-crf", "38", "-b:v", "0", "-row-mt", "1", "-deadline", "good",
             "-cpu-used", "2", "-an", out + ".webm"])
        run(["-ss", str(POSTER_AT), "-i", out + ".mp4", "-frames:v", "1", "-q:v", "3", out + ".jpg"])
        sizes = "  ".join(f"{ext} {os.path.getsize(out + '.' + ext) / 1e6:.2f} MB" for ext in ("mp4", "webm", "jpg"))
        print(f"{name}: {b - a:.1f}s  {sizes}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--takes", default=str(HERE / "takes"), help="folder with the takes (default: ./takes)")
    ap.add_argument("--dest", default=str(REPO / "public" / "tour"), help="output folder (default: public/tour)")
    a = ap.parse_args()
    main(a.takes, a.dest)
