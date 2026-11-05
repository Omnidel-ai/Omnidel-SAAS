"""Cut the hero's two loops from the takes: MP4 + WebM + poster for each.

    python build_hero.py                      # reads ./takes, writes public/hero/
    python build_hero.py --dest D:/tmp/hero   # write somewhere else

Desktop loop (public/hero/pulse.*): desk_board -> desk_review -> desk_home,
crossfaded and sped up. Phone loop (public/hero/acharya.*): the phone take.
Both fade in and out of the page colour so the loop seam is soft.

After a re-shoot, look at each take with peek.py, adjust DESK_CUTS / PHONE_CUT,
and copy the segment times this prints into heroStage.desk.segments (`at`) in
content/site.ts: they label the browser bar and pick the toast.
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

DESK_CUTS = [("desk_board", 0.2, 7.0), ("desk_review", 0.3, 9.8), ("desk_home", 0.9, 9.6)]  # (take, in s, out s)
DESK_SPEED, XFADE, FADE = 1.2, 0.5, 0.35
PHONE_CUT, PHONE_SPEED = ("phone", 2.2, 19.9), 1.1
POSTER_AT = 0.6


def run(args):
    subprocess.run([FF, "-y", "-hide_banner", "-loglevel", "error", *args], check=True)


def encode(master, dest, name):
    """Web versions of a master: H.264 MP4 (faststart), VP9 WebM and a JPEG poster."""
    out = os.path.join(dest, name)
    run(["-i", master, "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-profile:v", "high", "-pix_fmt", "yuv420p",
         "-g", "60", "-movflags", "+faststart", "-an", out + ".mp4"])
    run(["-i", master, "-c:v", "libvpx-vp9", "-crf", "38", "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
         "-g", "60", "-an", out + ".webm"])
    run(["-ss", str(POSTER_AT), "-i", master, "-frames:v", "1", "-q:v", "3", out + ".jpg"])
    for ext in ("mp4", "webm", "jpg"):
        print(f"  {name}.{ext}: {os.path.getsize(out + '.' + ext) / 1e6:.2f} MB")


def main(takes, dest):
    os.makedirs(dest, exist_ok=True)

    inputs, chains = [], []
    for i, (take, a, b) in enumerate(DESK_CUTS):
        inputs += ["-i", os.path.join(takes, take + ".mp4")]
        chains.append(f"[{i}:v]trim=start={a}:end={b},setpts=PTS-STARTPTS,fps=30,scale=1920:1200:flags=lanczos,format=yuv420p[s{i}]")
    lens = [b - a for _, a, b in DESK_CUTS]
    off1 = lens[0] - XFADE
    off2 = lens[0] + lens[1] - 2 * XFADE
    total = (sum(lens) - 2 * XFADE) / DESK_SPEED
    graph = ";".join(chains) + (
        f";[s0][s1]xfade=transition=fade:duration={XFADE}:offset={off1}[x1]"
        f";[x1][s2]xfade=transition=fade:duration={XFADE}:offset={off2}[x2]"
        f";[x2]setpts=PTS/{DESK_SPEED},fps=30,fade=t=in:st=0:d={FADE}:color={CANVAS},"
        f"fade=t=out:st={total - FADE:.3f}:d={FADE}:color={CANVAS}[v]")
    master = os.path.join(takes, "reel_desk_master.mp4")
    run([*inputs, "-filter_complex", graph, "-map", "[v]", "-c:v", "libx264", "-crf", "14", "-preset", "medium", "-pix_fmt", "yuv420p", master])
    print(f"desktop loop {total:.2f}s")
    print(f"  -> heroStage.desk.segments `at`: 0, {off1 / DESK_SPEED:.2f}, {off2 / DESK_SPEED:.2f}")
    encode(master, dest, "pulse")

    take, a, b = PHONE_CUT
    ptotal = (b - a) / PHONE_SPEED
    graph = (f"[0:v]trim=start={a}:end={b},setpts=(PTS-STARTPTS)/{PHONE_SPEED},fps=30,scale=600:-2:flags=lanczos,"
             f"fade=t=in:st=0:d={FADE}:color={CANVAS},fade=t=out:st={ptotal - FADE:.3f}:d={FADE}:color={CANVAS},format=yuv420p[v]")
    master = os.path.join(takes, "reel_phone_master.mp4")
    run(["-i", os.path.join(takes, take + ".mp4"), "-filter_complex", graph, "-map", "[v]", "-c:v", "libx264", "-crf", "14", "-preset", "medium", master])
    print(f"phone loop {ptotal:.2f}s")
    encode(master, dest, "acharya")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--takes", default=str(HERE / "takes"), help="folder with the takes (default: ./takes)")
    ap.add_argument("--dest", default=str(REPO / "public" / "hero"), help="output folder (default: public/hero)")
    a = ap.parse_args()
    main(a.takes, a.dest)
