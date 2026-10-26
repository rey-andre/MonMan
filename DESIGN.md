# Design Direction: MonMan Liquid Glass (referensi-ui.html)

## 1. Direction & Identity (User Specified via referensi-ui.html)
- **Visual Style:** Liquid Glassmorphism (Mobile-First) as faithfully defined in `referensi-ui.html`.
- **Atmosphere:** Ethereal, clean, optimistic light palette with smooth frosted glass layers (`backdrop-filter: blur(22px) saturate(160%)`) and inset light borders (`inset 0 1px 0 rgba(255, 255, 255, 0.9)`).
- **Ambient Lighting:** 3 soft blurred orbs in the background:
  - Orb 1: `#4f8cff` (Blue, top-left)
  - Orb 2: `#ff9a4d` (Orange, center-right)
  - Orb 3: `#a9cdff` (Sky, bottom-left)
- **Container Shell:**
  - Native Mobile Viewport: `100dvh` (fluid, fixed-height shell with scrollable inner pane).
  - Desktop View: Centered phone mockup frame with rounded 44px corners and subtle shadow `0 24px 60px rgba(79, 140, 255, 0.22)`.

## 2. Color Palette & Semantics
- `--ink`: `#0f2547` (Deep Navy, primary high-contrast text)
- `--ink2`: `#41587f` (Slate Blue, secondary text & labels)
- `--blue`: `#4f8cff` (Primary Brand Blue, active state gradients)
- `--sky`: `#a9cdff` (Sky Blue accent)
- `--mist`: `#eaf3ff` (Soft cool background surface)
- `--orange`: `#ff9a4d` (Vibrant Warm Orange, crypto & warning highlights)
- `--peach`: `#ffd2ad` (Warm peach accent)
- `--glass`: `rgba(255, 255, 255, 0.52)`
- `--glass-strong`: `rgba(255, 255, 255, 0.72)`
- `--edge`: `rgba(255, 255, 255, 0.88)`

## 3. Anti-Slop Discipline on top of Liquid Glass (R-02, R-03, R-17, R-25, R-26, R-38)
1. **Real Data Integrity:** All figures (Total Net Worth, monthly cashflow, wallet balances, and crypto values) are calculated from actual store state and live FreeCryptoAPI rates. No fake fabricated marketing claims.
2. **Fixed Floating Navigation on Mobile:** The floating liquid glass navigation bar is pinned at `bottom: calc(14px + env(safe-area-inset-bottom, 0px))` inside the `100dvh` shell, never scrolling off the viewport.
3. **Multi-Page Separation:** Each nav item represents an independent page (`/`, `/insights`, `/wallets`, `/transactions`).
4. **WCAG Contrast & Readability:** Text on glass panels uses high-contrast `--ink` (`#0f2547`) and `--ink2` (`#41587f`) with bold tabular figures for financial accuracy.
5. **Precise Crypto Precision:** Full support for up to 10 decimal digits (`Intl.NumberFormat('id-ID', { maximumFractionDigits: 10 })`).
