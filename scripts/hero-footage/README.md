# Hero and tour footage

The clips in `public/hero/` (the hero's 3D stage) and `public/tour/` (the "See it in the app" product tour) are screen recordings of the OmniDEL demo apps. These scripts record and cut them, so they can be re-shot whenever the apps change.

## What you need

- Python 3.10 or newer, then `pip install -r requirements.txt`
- Google Chrome. Playwright drives the installed Chrome. To use Playwright's own Chromium instead, run `python -m playwright install chromium` and set `HERO_BROWSER_CHANNEL=` (empty).
- The `Omnidel-ai/Omnidel_Frontend` repo with its two demo apps running:

  ```bash
  npm run dev            # OmniDEL workspace -> http://localhost:5300
  npm run dev:acharya    # Acharya app        -> http://localhost:5301
  ```

  Both run on demo data inside the browser: no login, nothing written to any database, no AI calls. To point at other addresses, set `OMNIDEL_WORKSPACE_URL` and `OMNIDEL_ACHARYA_URL`.

## Re-shooting (run from this folder)

1. **Record.** `python shoot.py` records five takes into `takes/` (git-ignored). Add take names to re-record only some:

   | Take | What happens |
   |---|---|
   | `desk_board` | The Development board; a task card opens and closes |
   | `desk_review` | A submission the Acharya scored 9.2/10: Use Acharya, Approve, then the Approved tab |
   | `desk_home` | Teams to Home, the Open/Done toggle, a scroll down to the charts |
   | `phone` | Raju's home, Neeranjan Acharya, the brass-lamp task, a question in Chat, Start work session |
   | `phone_quiz` | The same task's Quiz: Start quiz, the right answer, the next question |

2. **Check.** `python peek.py desk_review` writes `takes/peek_desk_review.jpg`, a contact sheet with timestamps, to check a take and choose cut points.
3. **Adjust cut points** if a take's timing changed: `DESK_CUTS` and `PHONE_CUT` in `build_hero.py`, `CLIPS` in `build_tour.py`.
4. **Cut the hero loops.** `python build_hero.py` writes `public/hero/{pulse,acharya}.{mp4,webm,jpg}`. It prints the desktop loop's segment start times: copy them into `heroStage.desk.segments` (`at`) in `content/site.ts`, where they label the browser bar and choose the toast.
5. **Cut the tour clips.** `python build_tour.py` writes `public/tour/{day,board,scores,acharya}.{mp4,webm,jpg}`.
6. **Look at the site** (`npm run dev` in the repo root), then commit the new clips.

## Notes

- **Why not Playwright's video recording:** it encodes at about 1 Mbps and text comes out soft. `recorder.py` takes Chrome's own screencast frames as JPEGs and rebuilds a constant-frame-rate master from their real timestamps. The device scale factor is forced when the browser launches (1.5x desk, 2x phone) because only then does the screencast deliver frames at device resolution.
- **The cursor and tap ripples** are drawn by `recorder.py`, not by the apps.
- **The takes click on demo-data text** (task names, tab labels, the "Raju" demo login). If the demo data changes, update those strings in `shoot.py`.
- **Keep the weight down:** the two hero loops are about 2 MB together and each tour clip 0.3 to 0.5 MB. The CRF values in the build scripts set that.
