# OmniDEL.ai — customer website

The website customers use to see what OmniDEL offers, compare plans and buy.
It is for customers. The investor story stays on omnidel.ai.

**Pages**

| Route | What it is |
|---|---|
| `/` | Home: calm hero over a painted scene, the OmniPulse agent at work, real app screens, the Acharyas with a MahAcharya Ji guide chat, before and after, pricing and add-ons, closing scene |
| `/pricing` | Monthly / yearly switch, two plan cards, enterprise strip, add-ons with a live total, checkout steps, before and after, FAQ |
| `/register` | Contractor sign-up wizard: mobile + OTP, business details, instance address, plan, demo payment, success with the instance URL. |
| `/login`, `/checkout` | Redirect to `/register`. |

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Node 20 or newer. The site is fully static (every route prerenders), so it deploys to Vercel as is.

## Where things live

- `content/site.ts`: **all copy, prices, plans, add-ons, Acharyas, chat answers and screen captions**, as data tables. Change content here, not in components.
- `components/`: the sections. `AgentStrip`, `AppShowcase`, `Acharyas` (MahAcharya Ji chat), `Pricing`, `LoginForm` and `CheckoutView` are client components. The rest render on the server.
- `app/globals.css`: design tokens (colours, type, spacing, radii, shadows) and every `od-` class. It comes from the OmniDEL design system, which uses the Omnidel_Frontend palette with Fraunces, Inter Tight and JetBrains Mono.
- `public/scenes/`: the two painted backgrounds (SVG, with slow mist, branch and bird motion that stops under reduced motion).
- `public/screens/`: real OmniDEL app screens captured from `Omnidel-ai/Omnidel_Frontend` with its demo data.
- `public/hero/`: the images behind the hero's 3D globe (a world map from NASA's Blue Marble, generated clouds, and a still of the globe for the first paint and for reduced motion) and small Acharya portraits for the phone. The globe's view is `content/globe.json`; the phone's screens and the notifications are `heroWorld` in `content/site.ts`.
- `public/tour/`: the four clips of the "See it in the app" product tour. They are screen recordings of the `Omnidel_Frontend` demo apps (`npm run dev` on :5300, `npm run dev:acharya` on :5301), so no real data is shown.
- `scripts/hero-footage/`: the scripts that make the globe's images and record and cut the tour clips; see its README.
- `lib/order.ts`: the basket (plan, billing, add-ons) carried in the URL. `lib/api.ts`: the server-only door to the OmniDEL API, used by the route handlers in `app/api/register/*` (set `OMNIDEL_API_URL` and `OMNIDEL_WEBSITE_APP_SECRET`, see `.env.example`).

## Before launch (TODO)

1. **Prices** in `content/site.ts` are placeholders (₹499 / ₹899, add-ons ₹199–299, 20% off yearly).
2. **Payment**: `/register` uses the API's demo payment (no money moves). Replace it with the real gateway before launch.
4. **MahAcharya Ji**: answers are scripted in `content/site.ts`. Replace `reply()` in `components/Acharyas.tsx` with a call to the app's MahAcharya assistant. Use the initial "M" avatar until an approved portrait exists.
5. **Acharya photos**: the roster uses initials. Swap in approved portraits when available.
6. **"See a day on site" video** and the **Book a demo** address (currently a mailto) need real targets.
