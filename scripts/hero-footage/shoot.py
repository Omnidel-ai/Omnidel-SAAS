"""Record the raw takes for the hero and the product tour.

Drives the OmniDEL demo apps from the Omnidel_Frontend repo in headless Chrome:
  workspace     npm run dev           -> http://localhost:5300  (desk takes)
  Acharya app   npm run dev:acharya   -> http://localhost:5301  (phone takes)
Both run on demo data in the browser: no login, nothing is written anywhere.

    python shoot.py                    # every take
    python shoot.py desk_review phone  # only these
    python shoot.py --out D:/tmp/takes # somewhere else (default: ./takes)

Each take is saved as <name>.mp4, a high-quality master that build_hero.py and
build_tour.py cut from. The steps below click on demo-data text (task names,
tabs), so if the demo data changes, update the matching strings here.
"""
import argparse
import asyncio
import os
from pathlib import Path

from playwright.async_api import async_playwright

from recorder import CURSOR_JS, Recorder, click_el, glide, smooth_scroll

HERE = Path(__file__).resolve().parent
WS = os.environ.get("OMNIDEL_WORKSPACE_URL", "http://localhost:5300/")
ACH = os.environ.get("OMNIDEL_ACHARYA_URL", "http://localhost:5301/")
# Installed Google Chrome by default; set HERO_BROWSER_CHANNEL= (empty) to use Playwright's bundled Chromium.
CHANNEL = os.environ.get("HERO_BROWSER_CHANNEL", "chrome") or None
OUT = str(HERE / "takes")

DESK = {"viewport": {"width": 1440, "height": 900}, "device_scale_factor": 1.5}   # frames: 2160 x 1350
PHONE = {"viewport": {"width": 390, "height": 844}, "device_scale_factor": 2, "is_mobile": True, "has_touch": True}  # 780 x 1688


async def vis(loc):
    """First visible element of a locator (the apps keep hidden copies of some views)."""
    for i in range(await loc.count()):
        if await loc.nth(i).is_visible():
            return loc.nth(i)
    raise RuntimeError(f"no visible match for {loc}")


async def nav(pg, text):
    """Click a sidebar item by its exact label (no cursor; used to set up a take)."""
    ok = await pg.evaluate("""(t) => {
      const els = [...document.querySelectorAll('aside *, nav *')].filter(e => e.matches('a,button,[role=button],[role=treeitem]')
        && e.offsetParent && e.innerText.trim().split(String.fromCharCode(10))[0].trim() === t);
      if (!els.length) return false; els[0].click(); return true; }""", text)
    if not ok:
        raise RuntimeError(f"nav miss: {text}")
    await asyncio.sleep(0.9)


async def nav_glide(pg, text, post=0.9):
    """Like nav(), but on camera: glide the cursor to the sidebar item and click it."""
    loc = pg.locator("aside a, aside button, nav a, nav button").filter(has_text=text)
    for i in range(await loc.count()):
        el = loc.nth(i)
        if (await el.inner_text()).strip().split("\n")[0].strip() == text and await el.is_visible():
            await click_el(pg, el, post=post)
            return
    raise RuntimeError(f"nav_glide miss: {text}")


async def scroll_any(pg, dy, duration=1.3):
    """Scroll the page, or the app's own scroll container when the window itself does not scroll."""
    sel = await pg.evaluate("""() => {
      if (document.scrollingElement.scrollHeight > innerHeight + 40) return null;
      const c = [...document.querySelectorAll('*')].filter(e => { const s = getComputedStyle(e);
        return /(auto|scroll)/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 40; })
        .sort((a, b) => b.clientHeight - a.clientHeight)[0];
      if (!c) return null; c.setAttribute('data-od-scroll', ''); return '[data-od-scroll]'; }""")
    await smooth_scroll(pg, dy, duration=duration, selector=sel)


async def desk_page(b):
    ctx = await b.new_context(**DESK)
    await ctx.add_init_script(CURSOR_JS)
    pg = await ctx.new_page()
    pg.set_default_timeout(6000)
    await pg.goto(WS, wait_until="networkidle")
    await asyncio.sleep(1.2)
    return ctx, pg


async def phone_page(b):
    ctx = await b.new_context(**PHONE)
    await ctx.add_init_script("window.__odTouch = true;")
    await ctx.add_init_script(CURSOR_JS)
    pg = await ctx.new_page()
    pg.set_default_timeout(6000)
    await pg.goto(ACH, wait_until="networkidle")
    await asyncio.sleep(1)
    await pg.get_by_text("Raju", exact=True).click()  # "Quick demo login" persona; the session lives in the browser
    await asyncio.sleep(3)
    return ctx, pg


# ── Desk takes (OmniDEL workspace) ────────────────────────────────────────────

async def desk_board(b):
    """The Development board; open a task card, look over it, close it."""
    ctx, pg = await desk_page(b)
    await nav(pg, "OmniPulse"); await nav(pg, "Projects")
    await pg.get_by_text("Development", exact=True).first.click(); await asyncio.sleep(1.6)
    await pg.mouse.move(1180, 700)
    R = Recorder(pg, OUT, 2160, 1350); await R.start(); await asyncio.sleep(0.7)
    await glide(pg, 520, 330, steps=34, pause=0.25)
    await glide(pg, 760, 360, steps=26, pause=0.2)
    await click_el(pg, pg.get_by_text("Repair cracks in a wall with cement", exact=True).first, steps=30, post=1.7)
    await glide(pg, 980, 420, steps=26, pause=0.6)
    await pg.keyboard.press("Escape"); await asyncio.sleep(0.6)
    if await pg.locator("[role=dialog]").count():
        close = pg.get_by_role("button", name="Close").first
        if await close.count():
            await click_el(pg, close, post=0.5)
    await pg.evaluate("document.activeElement && document.activeElement.blur()")  # no focus ring left on the card
    await glide(pg, 1180, 600, steps=26, pause=0.6)
    await R.stop(); R.encode("desk_board"); await ctx.close()


async def desk_review(b):
    """Open a submission the Acharya scored 9.2/10, use that score, approve, show the Approved tab."""
    ctx, pg = await desk_page(b)
    await nav(pg, "OmniPulse"); await nav(pg, "Review")
    await pg.mouse.move(1100, 640)
    R = Recorder(pg, OUT, 2160, 1350); await R.start(); await asyncio.sleep(0.7)
    await click_el(pg, pg.get_by_text("Site photo — Newtown block C", exact=True).first, steps=34, post=1.3)
    await click_el(pg, pg.get_by_role("button", name="Use Acharya").first, steps=30, post=0.9)
    await click_el(pg, pg.get_by_role("button", name="Approve").first, steps=30, post=1.4)
    await glide(pg, 980, 300, steps=26, pause=0.4)
    await click_el(pg, await vis(pg.locator("button, [role=tab]").filter(has_text="Approved")), steps=28, post=1.4)
    await R.stop(); R.encode("desk_review"); await ctx.close()


async def desk_home(b):
    """From Teams to Home; flip the Open/Done toggle; scroll down to the charts."""
    ctx, pg = await desk_page(b)
    await nav(pg, "OmniPulse"); await nav(pg, "Teams")
    await pg.mouse.move(700, 520)
    R = Recorder(pg, OUT, 2160, 1350); await R.start(); await asyncio.sleep(0.6)
    await nav_glide(pg, "Home", post=1.2)
    await click_el(pg, await vis(pg.get_by_text("Done", exact=True)), steps=30, post=1.0)
    await click_el(pg, await vis(pg.get_by_text("Open", exact=True)), steps=18, post=0.6)
    await glide(pg, 900, 560, steps=24)
    await scroll_any(pg, 430, duration=1.8)
    await glide(pg, 760, 600, steps=30, pause=1.0)
    await R.stop(); R.encode("desk_home"); await ctx.close()


# ── Phone takes (Acharya app, as the demo karigar Raju) ───────────────────────

async def phone(b):
    """Home → Neeranjan Acharya → the brass-lamp task → ask in Chat → Start work session (timer)."""
    ctx, pg = await phone_page(b)
    R = Recorder(pg, OUT, 780, 1688); await R.start(); await asyncio.sleep(1.0)
    await scroll_any(pg, 380, duration=1.4); await asyncio.sleep(0.5)
    await (await vis(pg.get_by_text("Neeranjan Acharya", exact=True))).tap(); await asyncio.sleep(1.7)
    await (await vis(pg.get_by_text("Photograph the finished brass lamp batch", exact=True))).tap(); await asyncio.sleep(1.5)
    await (await vis(pg.get_by_role("button", name="Chat", exact=True))).tap(); await asyncio.sleep(0.9)
    box = pg.locator("textarea[placeholder^=Type], input[placeholder^=Type]").first
    await box.tap(); await asyncio.sleep(0.3)
    # The demo answers questions about starting work or photo proof; others get a "this is a demo" reply.
    await pg.keyboard.type("What should I start with today?", delay=48); await asyncio.sleep(0.35)
    await pg.keyboard.press("Enter"); await asyncio.sleep(4.8)
    await (await vis(pg.get_by_role("button", name="Task", exact=True))).tap(); await asyncio.sleep(1.0)
    await (await vis(pg.get_by_text("Start work session", exact=True))).tap(); await asyncio.sleep(3.6)
    await R.stop(); R.encode("phone"); await ctx.close()


async def phone_quiz(b):
    """The brass-lamp task → Quiz → Start quiz → answer correctly → the next question."""
    ctx, pg = await phone_page(b)
    await pg.goto(ACH + "acharyas/neeranjan/tasks/demo-task-2", wait_until="networkidle"); await asyncio.sleep(2.5)
    R = Recorder(pg, OUT, 780, 1688); await R.start(); await asyncio.sleep(0.9)
    await (await vis(pg.get_by_role("button", name="Quiz", exact=True))).tap(); await asyncio.sleep(1.8)
    await (await vis(pg.get_by_role("button", name="Start quiz"))).tap(); await asyncio.sleep(2.2)
    await (await vis(pg.get_by_role("button").filter(has_text="Read the task twice"))).tap(); await asyncio.sleep(2.6)
    nxt = pg.get_by_role("button").filter(has_text="Next")
    if await nxt.count():
        await (await vis(nxt)).tap(); await asyncio.sleep(2.0)
    await R.stop(); R.encode("phone_quiz"); await ctx.close()


TAKES = {  # name: (function, device scale factor forced at launch)
    "desk_board": (desk_board, 1.5),
    "desk_review": (desk_review, 1.5),
    "desk_home": (desk_home, 1.5),
    "phone": (phone, 2),
    "phone_quiz": (phone_quiz, 2),
}


async def main(names):
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        for name in names:
            fn, dsf = TAKES[name]
            # Chrome's screencast only delivers frames at device resolution when the scale is forced at launch.
            b = await p.chromium.launch(channel=CHANNEL, args=["--force-color-profile=srgb", "--hide-scrollbars", f"--force-device-scale-factor={dsf}"])
            try:
                await fn(b)
            except Exception as e:  # keep going with the other takes
                print(f"[shoot] {name} FAILED: {type(e).__name__}: {str(e)[:300]}", flush=True)
            finally:
                await b.close()


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("takes", nargs="*", help=f"takes to record, default all: {', '.join(TAKES)}")
    ap.add_argument("--out", default=OUT, help="folder for the master MP4s (default: ./takes)")
    a = ap.parse_args()
    unknown = sorted(set(a.takes) - set(TAKES))
    if unknown:
        ap.error(f"unknown take(s): {', '.join(unknown)}; choose from {', '.join(TAKES)}")
    OUT = a.out
    asyncio.run(main(a.takes or list(TAKES)))
