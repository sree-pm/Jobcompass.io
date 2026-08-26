# JobCompass Design System

> **Single source of truth:** `apps/web/src/components/common/Theme.js`
> **Enforcement:** `apps/api/test/designSystemGuard.test.js` runs in CI — any hardcoded color/font outside `Theme.js` fails the build.

## Philosophy

**Stripe (trust, light luxury) × Linear (density, precision)** — a job-search product must feel both *safe enough to pay* (Stripe) and *fast enough to manage 50 jobs* (Linear).

| Layer | Source | What it gives us |
|---|---|---|
| Canvas & elevation | Stripe | `#fff` canvas, deep-navy text, blue-tinted multi-layer shadows, 6px radii |
| Density & controls | Linear | Inter `cv01/ss03`, 56px nav, 280px kanban lanes, 8px grid, pill tabs |
| Brand | Stripe violet | `#533afd` primary, `#4434d4` hover |

## Token groups (`T.*`)

| Group | Tokens |
|---|---|
| Surfaces | `bg`, `surface`, `surfaceAlt`, `surfaceCool`, `card`, `disabledBg` |
| Borders | `border`, `borderCool`, `borderStrong` |
| Text | `text`/`heading` (#061b31), `label`, `muted`, `hint`, `onColor` |
| Brand | `blue`, `blueHover`, `blueLight`, `blueMid`, `indigo`, `indigoDeep`, `purple`, `purpleVivid` + lights/mids |
| Interactive overlays | `focusRing`, `focusRingStrong`, `selectRing`, `hoverTint` (brand alpha) |
| Success | `green`, `greenDark`, `greenLight`, `greenMid`, `greenPale` |
| Warning | `amber`, `amberText`, `amberAccent`, `amberLight`, `amberMid`, `amberPale` |
| Danger | `red`, `redDark`, `redLight`, `redMid`, `redPale`, `redBorder` |
| Overlay | `overlay`, `overlaySoft`, `overlayLight`, `scrim` |
| Shadows | `shadowSm`, `shadow`, `shadowLg`, `shadowStripe`, `shadowFloat` (all blue-tinted `rgba(50,50,93,…)`) |
| Radii | `6 / 8 / 12 / 16 / pill` |
| Layout | `navHeight: 56`, `grid: 8` |
| Type | `sans` (Inter), `sansDisplay` (Source Sans 3), `mono` (JetBrains Mono), `fontFeatureSettings: 'cv01','ss03'` |

Plus exported constants: `STAGES`, `STAGE_COLOR`, `PACK_BADGE`, `LIMITS`, `NAV_HEIGHT`.

## Shared components (`UiPrimitives.jsx`)

`Btn` (variants: `primary`/`stripe`, `ghost`, `outline`, `subtle`, `indigo`, `danger`), `Card`, `Tag`, `ScoreBar`, `Row` — all consume `T.*` only.

## Rules

1. **No literal colors** in any component — only `T.*`, `STAGE_COLOR`, or `PACK_BADGE`.
2. **No literal font stacks** — only `T.sans`, `T.sansDisplay`, `T.mono`.
3. **No inline shadow strings** — only `T.shadow*`.
4. New shade needed? **Add a named token to `Theme.js` first**, then reference it. Names describe *role* (`redBorder`, `surfaceCool`), not hue.
5. Theme.js itself may contain literals (it's the definition layer) — the guard exempts it.

## How to change the brand

Edit `Theme.js` — every page updates. That's the whole point.

## Verification

```bash
node apps/api/test/designSystemGuard.test.js   # fails on any hardcoded style
pnpm --filter @agentic-cv/web build            # bundle must compile
```
