"""Build the hero globe's images from a world map photo.

    python build_hero.py path/to/earth.jpg                  # writes public/hero/
    python build_hero.py path/to/earth.jpg --dest D:/tmp    # somewhere else

The hero (components/HeroWorld.tsx) draws a 3D globe with WebGL, turned to
India, beside a phone whose screens keep changing. From an equirectangular
world map (NASA's Blue Marble works well, and is public domain) this writes:

  earth-day.webp     2048 x 1024  the colour map, oceans lifted to a brighter blue
  earth-clouds.webp  1024 x 512   the clouds (grey), which drift over the map
  globe.webp       800 x 800    the globe as a still, shaded like the WebGL one.
  globe-400.webp   400 x 400    The page shows it until WebGL starts, and
                                instead of WebGL with reduced motion
  av-<name>.webp   96 x 96      the Acharyas' faces for the phone's list

The clouds are generated (fractal noise on the sphere), so only the map is
needed. They thin out over India, so the country stays in view. Which way the globe faces and where the light comes from are in
content/globe.json, shared with the component. `render` below mirrors the
fragment shader in components/HeroWorld.tsx: change both together.
"""
import argparse
import json
import os
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
VIEW = json.loads((REPO / "content" / "globe.json").read_text(encoding="utf-8"))

# The Acharyas' portraits, and where the face is: centre x, centre y and crop size, as fractions of the width.
AVATARS = {
    "mahacharya": ("acharyas/mahacharya-avatar.webp", (0.5, 0.5, 1.0)),
    "neeranjan": ("acharyas/acharya-neeranjan.webp", (0.5, 0.3, 0.52)),
    "swapan": ("acharyas/acharya-swapan.webp", (0.5, 0.3, 0.52)),
    "subhas": ("acharyas/acharya-subhas.webp", (0.5, 0.3, 0.52)),
    "vivek": ("acharyas/acharya-vivek.webp", (0.5, 0.3, 0.52)),
    "lakshman": ("acharyas/acharya-lakshman.webp", (0.5, 0.3, 0.52)),
    "soumyajit": ("acharyas/acharya-soumyajit.webp", (0.5, 0.3, 0.52)),
}
CLEAR = (22.0, 80.0, 16.0)  # lat, lon, radius (degrees): keep India mostly free of cloud


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def lat_lon_grid(w, h):
    lat = (0.5 - (np.arange(h) + 0.5) / h) * np.pi
    lon = ((np.arange(w) + 0.5) / w - 0.5) * 2 * np.pi
    lon, lat = np.meshgrid(lon, lat)
    return lat.astype(np.float32), lon.astype(np.float32)


def sphere(lat, lon):
    return np.stack([np.cos(lat) * np.sin(lon), np.sin(lat), np.cos(lat) * np.cos(lon)], -1)


# ── Maps ─────────────────────────────────────────────────────────────────────

def water_mask(c):
    """1 where a pixel of the map is sea: blue over red and green, and not bright (ice)."""
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    return smoothstep(0.02, 0.09, b - np.maximum(r, g) * 0.9) * (1 - smoothstep(0.5, 0.7, lum))


def day_map(src):
    """The colour map at 2048 x 1024, with the oceans lifted toward a clear blue and the land a touch richer."""
    c = np.asarray(Image.open(src).convert("RGB").resize((2048, 1024), Image.LANCZOS), np.float32) / 255
    water = water_mask(c)[..., None]
    ocean = c + (1 - c) * np.array([0.05, 0.15, 0.30], np.float32)
    lum = (c @ np.array([0.299, 0.587, 0.114], np.float32))[..., None]
    land = lum + (c - lum) * 1.12
    out = np.clip(land * (1 - water) + ocean * water, 0, 1)
    return out, water[..., 0]


def hash3(ix, iy, iz, seed):
    n = (ix * np.uint64(0x8DA6B343)) ^ (iy * np.uint64(0xD8163841)) ^ (iz * np.uint64(0xCB1AB31F)) ^ np.uint64(seed)
    n = (n ^ (n >> np.uint64(15))) * np.uint64(0x2C1B3C6D)
    n = (n ^ (n >> np.uint64(12))) * np.uint64(0x297A2D39)
    n = n ^ (n >> np.uint64(15))
    return (n & np.uint64(0xFFFFFF)).astype(np.float32) / np.float32(0xFFFFFF)


def value_noise(p, seed):
    """Smooth 3D value noise in 0..1."""
    fl = np.floor(p)
    f = (p - fl).astype(np.float32)
    i = fl.astype(np.int64).astype(np.uint64)
    u = f * f * (3 - 2 * f)
    x, y, z = i[..., 0], i[..., 1], i[..., 2]
    one = np.uint64(1)
    c = {(a, b, d): hash3(x + (one if a else 0), y + (one if b else 0), z + (one if d else 0), seed) for a in (0, 1) for b in (0, 1) for d in (0, 1)}
    ux, uy, uz = u[..., 0], u[..., 1], u[..., 2]
    x00 = c[0, 0, 0] + (c[1, 0, 0] - c[0, 0, 0]) * ux
    x10 = c[0, 1, 0] + (c[1, 1, 0] - c[0, 1, 0]) * ux
    x01 = c[0, 0, 1] + (c[1, 0, 1] - c[0, 0, 1]) * ux
    x11 = c[0, 1, 1] + (c[1, 1, 1] - c[0, 1, 1]) * ux
    return (x00 + (x10 - x00) * uy) * (1 - uz) + (x01 + (x11 - x01) * uy) * uz


def fbm(p, octaves, seed):
    total, amp, norm = 0.0, 0.5, 0.0
    for k in range(octaves):
        total = total + amp * value_noise(p * (2.0 ** k), seed + 7 * k)
        norm += amp
        amp *= 0.5
    return total / norm


def cloud_map(w=1024, h=512):
    """Clouds from warped fractal noise on the sphere (so they wrap with no seam). Stretched east-west like
    real cloud bands, thickest along the storm tracks and the equator, thin over the subtropics."""
    lat, lon = lat_lon_grid(w, h)
    p = sphere(lat, lon) * np.array([1.0, 2.2, 1.0], np.float32)
    warp = np.stack([fbm(p * 1.4 + o, 4, s) for o, s in ((0.0, 11), (5.2, 23), (9.7, 37))], -1) - 0.5
    systems = fbm((p + warp * 1.3) * 2.0, 5, 101)
    wisps = fbm((p + warp * 0.7) * 8.0, 4, 202)
    a = np.abs(lat)
    band = 0.10 * np.exp(-((a - 0.95) / 0.22) ** 2) + 0.06 * np.exp(-(lat / 0.12) ** 2) - 0.10 * np.exp(-((a - 0.42) / 0.14) ** 2)
    n = systems * 0.72 + wisps * 0.28 + band
    return smoothstep(0.55, 0.80, n) * (0.55 + 0.45 * smoothstep(0.35, 0.7, wisps))


def clear(q):
    """1 over India, fading out (q: unit vectors on the sphere). The shader computes the same."""
    c_lat, c_lon, radius = (np.radians(v) for v in CLEAR)
    d = np.arccos(np.clip(q @ sphere(np.float32(c_lat), np.float32(c_lon)), -1, 1))
    return 1 - smoothstep(radius * 0.6, radius * 1.4, d)


# ── The still (mirrors the WebGL fragment shader) ────────────────────────────

def sample(tex, u, v):
    """Bilinear lookup in an H x W x C texture: u wraps around, v clamps."""
    h, w = tex.shape[:2]
    x = (u % 1.0) * w - 0.5
    y = np.clip(v * h - 0.5, 0, h - 1)
    x0, y0 = np.floor(x).astype(np.int64), np.floor(y).astype(np.int64)
    fx, fy = (x - x0)[..., None], (y - y0)[..., None]
    xa, xb = x0 % w, (x0 + 1) % w
    yb = np.minimum(y0 + 1, h - 1)
    top = tex[y0, xa] * (1 - fx) + tex[y0, xb] * fx
    bottom = tex[yb, xa] * (1 - fx) + tex[yb, xb] * fx
    return top * (1 - fy) + bottom * fy


def render(day, clouds, size, cloud_shift=0.0):
    lon0, lat0, roll = (np.radians(VIEW[k]) for k in ("lon", "lat", "roll"))
    light = np.array(VIEW["light"], np.float32)
    light /= np.linalg.norm(light)
    ys, xs = np.mgrid[0:size, 0:size].astype(np.float32)
    px = (xs + 0.5) / size * 2 - 1
    py = 1 - (ys + 0.5) / size * 2
    r2 = px * px + py * py
    alpha = 1 - smoothstep(1 - 3.0 / size, 1.0, np.sqrt(r2))
    z = np.sqrt(np.clip(1 - r2, 0, 1))
    rx = px * np.cos(roll) - py * np.sin(roll)
    ry = px * np.sin(roll) + py * np.cos(roll)
    qx, qy, qz = rx, ry * np.cos(lat0) + z * np.sin(lat0), -ry * np.sin(lat0) + z * np.cos(lat0)
    lat = np.arcsin(np.clip(qy, -1, 1))
    lon = np.arctan2(qx, qz) + lon0
    u, v = lon / (2 * np.pi) + 0.5, 0.5 - lat / np.pi

    col = sample(day, u, v)
    water = water_mask(col)
    surface = np.stack([np.cos(lat) * np.sin(lon), np.sin(lat), np.cos(lat) * np.cos(lon)], -1)
    cloud = sample(clouds, u + cloud_shift, v)[..., 0] * (1 - 0.85 * clear(surface))

    n = np.stack([px, py, z], -1)
    diff = smoothstep(-0.3, 1.0, n @ light)
    col = col * (0.40 + 0.78 * diff)[..., None]
    half = light + np.array([0, 0, 1], np.float32)
    half /= np.linalg.norm(half)
    nh = np.clip(n @ half, 0, None)
    col = col + np.array([1.0, 0.96, 0.88], np.float32) * (nh ** 60 * (0.12 + 0.6 * water) + nh ** 6 * 0.06)[..., None]
    k = (cloud * 0.88)[..., None]
    col = col * (1 - k) + (0.55 + 0.55 * diff)[..., None] * k
    k = ((1 - z) ** 2.6 * 0.62)[..., None]
    col = col * (1 - k) + np.array([0.62, 0.80, 1.0], np.float32) * (0.75 + 0.45 * diff)[..., None] * k
    rgba = np.concatenate([np.clip(col, 0, 1), alpha[..., None]], -1)
    return Image.fromarray((rgba * 255 + 0.5).astype(np.uint8), "RGBA")


def avatar(path, crop, out):
    im = Image.open(path).convert("RGB")
    w, h = im.size
    cx, cy, s = crop
    half = s * w / 2
    box = (cx * w - half, cy * h - half, cx * w + half, cy * h + half)
    im.crop(tuple(round(v) for v in box)).resize((96, 96), Image.LANCZOS).save(out, quality=84, method=6)


def main(src, dest):
    os.makedirs(dest, exist_ok=True)
    day, _ = day_map(src)
    Image.fromarray((day * 255 + 0.5).astype(np.uint8)).save(os.path.join(dest, "earth-day.webp"), quality=84, method=6)

    Image.fromarray((cloud_map() * 255 + 0.5).astype(np.uint8)).convert("RGB").save(os.path.join(dest, "earth-clouds.webp"), quality=88, method=6)

    # The still uses the maps as the browser will get them (after WebP compression).
    day = np.asarray(Image.open(os.path.join(dest, "earth-day.webp")).convert("RGB"), np.float32) / 255
    clouds = np.asarray(Image.open(os.path.join(dest, "earth-clouds.webp")).convert("L"), np.float32)[..., None] / 255
    for size, name in ((800, "globe.webp"), (400, "globe-400.webp")):
        render(day, clouds, size).save(os.path.join(dest, name), quality=86, method=6)

    for name, (rel, crop) in AVATARS.items():
        avatar(REPO / "public" / rel, crop, os.path.join(dest, f"av-{name}.webp"))

    for name in sorted(os.listdir(dest)):
        print(f"  {name}: {os.path.getsize(os.path.join(dest, name)) / 1e3:.0f} KB")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("src", help="an equirectangular world map (2:1), e.g. NASA's Blue Marble")
    ap.add_argument("--dest", default=str(REPO / "public" / "hero"), help="output folder (default: public/hero)")
    a = ap.parse_args()
    main(a.src, a.dest)
