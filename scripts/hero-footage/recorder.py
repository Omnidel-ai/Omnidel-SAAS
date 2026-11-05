"""High-quality screen recorder for product footage.

Captures Chrome's screencast frames (JPEG, at the device scale factor forced at
launch) through the DevTools protocol, then rebuilds a constant-frame-rate H.264
master with ffmpeg from the frames' real timestamps. Injects a visible cursor and
a click/tap ripple so each operation reads on video.
"""
import asyncio
import base64
import os
import shutil
import subprocess
import time

import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

# A drawn cursor that follows the pointer, plus a ripple on every press. With
# `window.__odTouch = true` (phone takes) only the ripple shows, like a finger tap.
CURSOR_JS = r"""
(() => {
  if (window.__odCursorInstalled) return;
  window.__odCursorInstalled = true;
  const c = document.createElement('div');
  c.setAttribute('data-od-cursor', '');
  c.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M5 3l14 8.2-6.1 1.5-3.2 6.1z" fill="#231d14" stroke="#fffdf8" stroke-width="1.7" stroke-linejoin="round"/></svg>';
  Object.assign(c.style, { position: 'fixed', left: '0', top: '0', zIndex: '2147483647', pointerEvents: 'none',
    transform: 'translate(-200px,-200px)', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,.28))', willChange: 'transform' });
  const touch = window.__odTouch === true || matchMedia('(pointer: coarse)').matches;
  if (touch) c.style.display = 'none';
  const ensure = () => { if (document.body && !c.isConnected) document.body.appendChild(c); };
  setInterval(ensure, 250); document.addEventListener('DOMContentLoaded', ensure);
  addEventListener('pointermove', e => { c.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 3}px)`; }, true);
  addEventListener('pointerdown', e => {
    const r = document.createElement('div');
    const s = touch ? 46 : 40;
    Object.assign(r.style, { position: 'fixed', left: (e.clientX - s / 2) + 'px', top: (e.clientY - s / 2) + 'px', width: s + 'px', height: s + 'px',
      borderRadius: '50%', background: touch ? 'rgba(35,29,20,.18)' : 'rgba(55,106,70,.22)', border: touch ? '2px solid rgba(255,253,248,.85)' : '2px solid rgba(37,74,51,.55)',
      boxShadow: touch ? '0 2px 10px rgba(35,29,20,.25)' : 'none', zIndex: '2147483646',
      pointerEvents: 'none', transform: touch ? 'scale(.8)' : 'scale(.35)', opacity: '1', transition: 'transform 520ms cubic-bezier(.23,1,.32,1), opacity 520ms ease' });
    document.body.appendChild(r);
    requestAnimationFrame(() => requestAnimationFrame(() => { r.style.transform = 'scale(1.3)'; r.style.opacity = '0'; }));
    setTimeout(() => r.remove(), 650);
  }, true);
})();
"""


class Recorder:
    """Record one page. Call start(), drive the page, stop(), then encode(name)."""

    def __init__(self, page, out_dir, max_w=1920, max_h=1200, quality=90):
        self.page, self.out_dir = page, out_dir
        self.max_w, self.max_h, self.quality = max_w, max_h, quality
        self.frames, self.cdp, self.t_end = [], None, None

    async def start(self):
        self.cdp = await self.page.context.new_cdp_session(self.page)
        self.cdp.on("Page.screencastFrame", self._on_frame)
        await self.cdp.send("Page.startScreencast", {"format": "jpeg", "quality": self.quality,
                                                      "maxWidth": self.max_w, "maxHeight": self.max_h, "everyNthFrame": 1})

    def _on_frame(self, p):
        self.frames.append((p["metadata"]["timestamp"], p["data"]))
        asyncio.ensure_future(self.cdp.send("Page.screencastFrameAck", {"sessionId": p["sessionId"]}))

    async def stop(self):
        await asyncio.sleep(0.3)  # let the last repaint land
        self.t_end = time.time()
        await self.cdp.send("Page.stopScreencast")
        await asyncio.sleep(0.2)

    def encode(self, name, fps=30, crf=16):
        """Write the frames with their true durations (ffconcat) and encode a CFR master MP4."""
        fdir = os.path.join(self.out_dir, name + "_frames")
        shutil.rmtree(fdir, ignore_errors=True)
        os.makedirs(fdir)
        frames = sorted(self.frames, key=lambda f: f[0])
        if not frames:
            raise RuntimeError("no frames captured")
        lines = ["ffconcat version 1.0"]
        for i, (ts, data) in enumerate(frames):
            fn = f"f{i:05d}.jpg"
            with open(os.path.join(fdir, fn), "wb") as fh:
                fh.write(base64.b64decode(data))
            nxt = frames[i + 1][0] if i + 1 < len(frames) else max(self.t_end, ts + 0.05)
            lines += [f"file '{fn}'", f"duration {max(0.001, nxt - ts):.4f}"]
        lines.append(f"file 'f{len(frames) - 1:05d}.jpg'")
        lst = os.path.join(fdir, "list.ffconcat")
        with open(lst, "w") as fh:
            fh.write("\n".join(lines) + "\n")
        out = os.path.join(self.out_dir, name + ".mp4")
        subprocess.run([FFMPEG, "-y", "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst,
                        "-vf", f"fps={fps},scale=trunc(iw/2)*2:trunc(ih/2)*2", "-c:v", "libx264", "-crf", str(crf),
                        "-preset", "medium", "-pix_fmt", "yuv420p", out], check=True)
        shutil.rmtree(fdir, ignore_errors=True)
        print(f"[rec] {name}: {len(frames)} frames over {frames[-1][0] - frames[0][0]:.1f}s -> {out}", flush=True)
        return out


async def glide(page, x, y, steps=28, pause=0.0):
    """Move the (visible) mouse smoothly to x, y."""
    await page.mouse.move(x, y, steps=steps)
    if pause:
        await asyncio.sleep(pause)


async def click_el(page, locator, steps=30, pre=0.25, post=0.6, offset=(0.5, 0.5)):
    """Glide to an element, pause, click, wait."""
    await locator.scroll_into_view_if_needed()
    box = await locator.bounding_box()
    if not box:
        raise RuntimeError(f"no box for {locator}")
    await page.mouse.move(box["x"] + box["width"] * offset[0], box["y"] + box["height"] * offset[1], steps=steps)
    await asyncio.sleep(pre)
    await page.mouse.down()
    await asyncio.sleep(0.08)
    await page.mouse.up()
    await asyncio.sleep(post)


async def smooth_scroll(page, dy, duration=1.2, selector=None):
    """Eased scroll of the window (or of a scroll container) by dy pixels."""
    js = """([dy, dur, sel]) => new Promise(res => {
      const el = sel ? document.querySelector(sel) : null;
      const get = () => el ? el.scrollTop : scrollY;
      const set = v => el ? (el.scrollTop = v) : scrollTo(0, v);
      const y0 = get(), t0 = performance.now();
      const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
      const tick = now => { const k = Math.min(1, (now - t0) / (dur * 1000)); set(y0 + dy * ease(k)); k < 1 ? requestAnimationFrame(tick) : res(); };
      requestAnimationFrame(tick);
    })"""
    await page.evaluate(js, [dy, duration, selector])
