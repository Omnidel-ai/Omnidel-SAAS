# OmniDEL.ai — customer website

The website customers use to see what OmniDEL offers, compare plans and buy.
It is for customers. The investor story stays on omnidel.ai.

**Pages**

| Route | What it is |
|---|---|
| `/` | Home: calm hero over a painted scene, the OmniPulse agent at work, real app screens, the Acharyas with a MahAcharya Ji guide chat, before and after, pricing and add-ons, closing scene |
| `/pricing` | Monthly / yearly switch, two plan cards, enterprise strip, add-ons with a live total, checkout steps, before and after, FAQ |
| `/login` | Mobile + OTP login. Buying needs a verified OmniDEL ID. |
| `/checkout` | Order summary. Redirects to `/login` when there is no session. |

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
- `lib/order.ts`: the basket (plan, billing, add-ons) carried in the URL. `lib/auth.ts`: the login session.

## Before launch (TODO)

1. **Prices** in `content/site.ts` are placeholders (₹499 / ₹899, add-ons ₹199–299, 20% off yearly).
2. **Auth**: `lib/auth.ts` is a demo that accepts any 6-digit code and keeps the session in the browser. Wire `requestOtp`, `verifyOtp` and `getSession` to the OmniDEL auth API.
3. **Payments**: the "Pay & invite your crew" button in `components/CheckoutView.tsx` needs the payment gateway.
4. **MahAcharya Ji**: answers are scripted in `content/site.ts`. Replace `reply()` in `components/Acharyas.tsx` with a call to the app's MahAcharya assistant. Use the initial "M" avatar until an approved portrait exists.
5. **Acharya photos**: the roster uses initials. Swap in approved portraits when available.
6. **"See a day on site" video** and the **Book a demo** address (currently a mailto) need real targets.
