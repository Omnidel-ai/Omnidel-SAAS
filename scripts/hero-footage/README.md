# Hero globe and tour footage

- `public/hero/`: the images behind the hero's 3D globe, which `build_hero.py` makes from a world map photo.
- `public/tour/`: the "See it in the app" product tour, screen recordings of the OmniDEL demo apps. `shoot.py` records them and `build_tour.py` cuts them, so they can be re-shot whenever the apps change.

## What you need

- Python 3.10 or newer, then `pip install -r requirements.txt`
- For the tour only:
  - Google Chrome. Playwright drives the installed Chrome. To use Playwright's own Chromium instead, run `python -m playwright install chromium` and set `HERO_BROWSER_CHANNEL=` (empty).
  - The `Omnidel-ai/Omnidel_Frontend` repo with its two demo apps running:

    ```bash
    npm run dev            # OmniDEL workspace -> http://localhost:5300
    npm run dev:acharya    # Acharya app        -> http://localhost:5301
    ```

    Both run on demo data inside the browser: no login, nothing written to any database, no AI calls. To point at other addresses, set `OMNIDEL_WORKSPACE_URL` and `OMNIDEL_ACHARYA_URL`.

## The hero globe (run from this folder)

The hero (`components/HeroWorld.tsx`) draws the globe live with WebGL: one fragment shader wraps a world map around a sphere, turned to India, with drifting clouds, a glint of light on the sea and a blue rim of atmosphere.

`python build_hero.py path/to/earth.jpg` writes into `public/hero/`:

| File | What it is |
|---|---|
| `earth-day.webp` | The map the globe is wrapped in (2048 x 1024), oceans lifted to a brighter blue |
| `earth-clouds.webp` | The clouds (1024 x 512), generated from noise, so they drift over the map |
| `globe.webp`, `globe-400.webp` | The globe as a still, drawn with the same shading. The page shows it until WebGL starts, and in its place with reduced motion |
| `av-*.webp` | The Acharyas' faces (96 x 96) for the list on the phone, cut from `public/acharyas/` |

The map is NASA's Blue Marble (public domain; credit: NASA Visible Earth). Any equirectangular world map, twice as wide as it is tall, works. The one used here is `earth-blue-marble.jpg` (4096 x 2048) from the `three-globe` npm package (`example/img/`), a copy of NASA's image. It isn't kept in the repo, only what the script makes from it.

Which way the globe faces, the light, the sway and the cities the threads start from are in `content/globe.json`, shared by the script and the component. The shading lives in two places: the shader in `HeroWorld.tsx` and `render` in `build_hero.py`. Change both, then rebuild, so the still matches the live globe.

## Re-shooting the tour (run from this folder)

1. **Record.** `python shoot.py` records five takes into `takes/` (git-ignored). Add take names to re-record only some:

   | Take | What happens |
   |---|---|
   | `desk_board` | The Development board; a task card opens and closes |
   | `desk_review` | A submission the Acharya scored 9.2/10: Use Acharya, Approve, then the Approved tab |
   | `desk_home` | Teams to Home, the Open/Done toggle, a scroll down to the charts |
   | `phone` | Raju's home, Neeranjan Acharya, the brass-lamp task, a question in Chat, Start work session |
   | `phone_quiz` | The same task's Quiz: Start quiz, the right answer, the next question |

2. **Check.** `python peek.py desk_review` writes `takes/peek_desk_review.jpg`, a contact sheet with timestamps, to check a take and choose cut points.
3. **Adjust cut points** if a take's timing changed: `CLIPS` in `build_tour.py`.
4. **Cut the tour clips.** `python build_tour.py` writes `public/tour/{day,board,scores,acharya}.{mp4,webm,jpg}`.
5. **Look at the site** (`npm run dev` in the repo root), then commit the new clips.

## Notes

- **Why not Playwright's video recording:** it encodes at about 1 Mbps and text comes out soft. `recorder.py` takes Chrome's own screencast frames as JPEGs and rebuilds a constant-frame-rate master from their real timestamps. The device scale factor is forced when the browser launches (1.5x desk, 2x phone) because only then does the screencast deliver frames at device resolution.
- **The cursor and tap ripples** are drawn by `recorder.py`, not by the apps.
- **The takes click on demo-data text** (task names, tab labels, the "Raju" demo login). If the demo data changes, update those strings in `shoot.py`.
- **Keep the weight down:** the globe's images are about 0.4 MB together, each tour clip 0.3 to 0.5 MB (the CRF values in `build_tour.py` set that).
- **The `phone` take** isn't used by the tour; it is spare footage from the earlier hero. Leave it out with `python shoot.py desk_board desk_review desk_home phone_quiz`.
