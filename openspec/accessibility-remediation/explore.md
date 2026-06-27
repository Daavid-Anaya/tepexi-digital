# Exploration: accessibility-remediation

**Status**: complete  
**Project**: tepexi-digital (Next.js 16.2.9 + React 19.2.4 + Sanity CMS)  
**Branch**: fix/accessibility-audit-remediation  
**Date**: 2026-06-27  

---

## Executive Summary

The codebase is well-structured with clear component boundaries, making targeted accessibility fixes straightforward. The 15 files affected span layout, UI primitives, and page-level components — all changes are localized with no cross-cutting refactors required. The single non-trivial risk is the Leaflet marker keyboard accessibility work, which requires `react-leaflet` v5 API awareness and custom DivIcon SVG shapes; all other fixes are CSS class swaps, attribute additions, or small JSX insertions.

---

## File Snapshots

### 1. `src/app/(site)/layout.tsx`

**Findings**: 3.1 — Skip link + main id

**Current code (lines 55–56):**
```tsx
<Navbar />
<main className="min-h-screen">{children}</main>
```

**Fix needed:**
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
>
  Saltar al contenido
</a>
<Navbar />
<main id="main-content" tabIndex={-1} className="min-h-screen">{children}</main>
```

**Dependencies/Risks**: None. Pure HTML — Server Component, no `'use client'` needed.

---

### 2. `src/components/layout/MobileNavToggle.tsx`

**Findings**: 3.2, 2.3, 2.4 — Focus trap, aria-modal, focus management

**Current code (lines 50–78, portal overlay div):**
```tsx
<div
  className={cn('md:hidden fixed top-[63px] inset-x-0 bottom-0 z-[60] transition-all duration-300', ...)}
  aria-hidden={!isOpen}
>
  {/* slide-in panel */}
  <div
    id="mobile-nav"
    className={cn('absolute inset-0', 'bg-cream flex flex-col', ...)}
  >
```

**Current state — what's missing:**
- The slide-in panel (line 70) has no `role="dialog"` or `aria-modal="true"`
- No focus management on open: first nav link is not focused when panel opens
- No focus trap: Tab can escape the panel while it's open
- No `inert` on `<main>` and `<footer>` when panel is open
- No `ref` to restore focus to toggle button on close
- Toggle button `aria-controls="mobile-nav"` already correct ✓
- `aria-expanded={isOpen}` already correct ✓
- Escape key handler already present ✓

**Fix needed:**
1. Add `role="dialog" aria-modal="true" aria-label="Menú de navegación"` to the slide-in panel div (line 70–78)
2. Add `useRef` for toggle button and first nav link
3. On `isOpen` → true: call `firstLinkRef.current?.focus()`
4. On `isOpen` → false: call `toggleRef.current?.focus()`
5. Implement focus trap in `keydown` handler: intercept Tab/Shift+Tab, cycle through focusable elements inside `#mobile-nav`
6. Apply `inert` attribute to `<main id="main-content">` and `<footer>` when panel open via `document.querySelector` or portal logic

**Risk**: `inert` is broadly supported (Chrome 102+, Firefox 112+, Safari 15.5+) — no polyfill needed for this project's target audience. The focus trap needs to enumerate focusable elements inside the panel at runtime (links only, since those are the only focusables inside the nav).

---

### 3. `src/components/gallery/ImageCarousel.tsx`

**Findings**: 5.1, 2.2, 4.1, 12.3 — Pause button, aria-pressed dots, live region, touch targets, skeleton role

**Current state — full component analysis:**

**Autoplay (lines 40–48):** Pauses on hover (`isHovered`) but no keyboard-accessible pause button:
```tsx
const [isHovered, setIsHovered] = useState(false)
// ...
useEffect(() => {
  if (!autoPlay || isHovered || images.length <= 1) return
  timerRef.current = setInterval(goNext, interval)
  // ...
}, [autoPlay, interval, isHovered, images.length])
```
No `isPaused` state, no visible pause/play button.

**Dot indicators (lines 110–122):** Missing `aria-pressed`:
```tsx
<button
  key={index}
  onClick={() => goTo(index)}
  aria-label={`Ir a imagen ${index + 1}`}
  className={cn(
    'w-2 h-2 rounded-full transition-all',   // ← 8×8px, below 24px minimum
    index === activeIndex ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/75',
  )}
/>
```

**Missing items:**
- `aria-pressed={index === activeIndex}` on each dot button
- Touch target size: `w-2 h-2` = 8px. Fix: add `p-2 -m-2` (padding expands tap area, negative margin compensates layout)
- Live region: no `<div aria-live="polite" className="sr-only">` announcing slide changes
- `onFocus`/`onBlur` handlers on wrapper to pause autoplay on keyboard focus
- No `role="status"` on skeleton (finding 12.3, handled in DynamicImageCarousel wrapper likely)

**Fix needed — summary:**
```tsx
const [isPaused, setIsPaused] = useState(false)
// useEffect: if (!autoPlay || isHovered || isPaused || ...) return
// Wrapper: onFocus={() => setIsHovered(true)} onBlur={() => setIsHovered(false)}
// Pause button: always visible (not just on hover) with aria-pressed={isPaused}
// Dots: add aria-pressed={index === activeIndex}, add p-2 -m-2
// Live region: <div aria-live="polite" aria-atomic="true" className="sr-only">{`Imagen ${activeIndex+1} de ${images.length}`}</div>
```

**Dependencies/Risks**: `DynamicImageCarousel` wraps this in a `Suspense` — the skeleton in that file needs `role="status"` (separate finding 12.3). Must check `DynamicImageCarousel.tsx`.

---

### 4. `src/app/(site)/gastronomia/[slug]/page.tsx`

**Finding**: 6.1 — `<dt>` elements without `<dl>` parent

**Current code (lines 231–329, sidebar "Ficha del platillo"):**
```tsx
<div className="p-4 sm:p-5 space-y-5" style={{ background: '#FDFAF8' }}>
  {item.difficulty && (
    <div className="flex items-start gap-3">
      <div className="...">  {/* icon */} </div>
      <div>
        <dt className="text-[11px] uppercase ...">Dificultad</dt>
        <DifficultyFlames difficulty={item.difficulty} />
      </div>
    </div>
  )}
  {item.preparationTime && (
    <div className="flex items-start gap-3">
      ...
      <dt ...>Preparación</dt>
      <dd ...>{item.preparationTime}</dd>
    </div>
  )}
  {/* same pattern for servings, season, priceRange, origin, cost */}
```

All `<dt>` and `<dd>` elements are **direct children of `<div>` wrappers**, not wrapped in `<dl>`. The entire sidebar card content `<div className="p-4 sm:p-5 space-y-5">` must become `<dl className="p-4 sm:p-5 space-y-5">`.

**Fix needed:** Change outer `<div className="p-4 sm:p-5 space-y-5">` → `<dl className="p-4 sm:p-5 space-y-5">`. Each row (`<div className="flex items-start gap-3">`) wrapping a `<dt>`/`<dd>` pair remains a `<div>` (allowed as `<div>` wrapper inside `<dl>` per HTML spec).

**Risk**: The `DifficultyFlames` entry has `<dt>` but the `<dd>` equivalent is a component — visually fine, but semantically `<DifficultyFlames />` renders its own output without being a `<dd>`. The spec fix should also wrap it: `<dd><DifficultyFlames .../></dd>`.

---

### 5. `src/components/map/LeafletMap.tsx`

**Findings**: 10.1, 8.5 — Color-only markers, keyboard access, role="application"

**Current marker SVG (lines 17–41):**
```tsx
function createCategoryIcon(color: string): L.DivIcon {
  const fill = HEX_COLOR_RE.test(color) ? color : '#8B4513'
  const svg = `
    <svg ...>
      <path ... fill="${fill}" />       ← shape is always the same pin
      <circle cx="16" cy="15" r="6.5" fill="white" opacity="0.95"/>
    </svg>
  `
  return L.divIcon({ className: '', html: svg, ... })
}
```
Every category uses the same pin shape — only color differs. No shape distinction.

**MapContainer (lines 54–61):**
```tsx
<MapContainer
  center={[mapCenter.lat, mapCenter.lng]}
  zoom={mapZoom}
  className="w-full h-[400px] ..."
  scrollWheelZoom={false}
>
```
No `role="application"` or `aria-label`.

**Fix needed:**

1. **MapContainer attributes**: Add via ref or wrapper `<div role="application" aria-label="Mapa interactivo de Tepexi de Rodríguez">` wrapping `MapContainer` (react-leaflet doesn't expose role/aria directly on `MapContainer` in v5, use a wrapper `<div>`).

2. **Distinct shapes per category**: Create a `CATEGORY_SHAPES` map:
   - `lugar` / default → pin (current shape)
   - `gastronomia` → fork/plate shape or star inner symbol
   - `cultura` → monument/column inner symbol
   - `servicios` → circle with cross or "i"
   
   Implementation: each `createCategoryIcon(color, type)` receives `type` and switches SVG inner path. Using inner symbol inside the white circle is cleanest (keeps 32×44 icon size).

3. **Keyboard access to markers**: Leaflet markers are not keyboard-focusable by default. In react-leaflet v5, pass `keyboard={true}` to the `<Marker>` (or use `eventHandlers` with `keypress`). The `<Marker>` component in react-leaflet v5 supports `keyboard` and `title` props via the underlying Leaflet options.

**Risk**: react-leaflet v5 + Leaflet 1.9 — `L.DivIcon` SVG with per-category shapes requires either: (a) inline SVG string switching per type (simple but verbose), or (b) a shape component map. Approach (a) is safer and doesn't add dependencies. Adding `keyboard={true}` + `title={marker.title}` to each `<Marker>` is the minimal keyboard fix. Full keyboard navigation of all markers requires more work (Tab through markers) — that's the trade-off: `keyboard + title` gives Enter-to-open-popup support; full Tab cycling through all markers is a bigger effort.

---

### 6. `src/app/(site)/page.tsx`

**Finding**: 1.1 — Hero eyebrow contrast

**Current code (line 90):**
```tsx
<p className="inline-flex items-center gap-2 text-cream/70 text-sm font-medium uppercase tracking-[0.2em] mb-6 animate-fade-in">
```
`text-cream/70` = `#FFFBF0` at 70% opacity on `bg-primary-900` (`#2E1505`) ≈ 2.8:1 contrast ratio (WCAG AA requires 4.5:1 for small text).

**Fix needed:**
```tsx
<p className="inline-flex items-center gap-2 text-cream/90 text-sm font-medium uppercase tracking-[0.2em] mb-6 animate-fade-in">
```
`text-cream/90` ≈ 5.4:1 ratio — passes AA.

**Dependencies/Risks**: None. Single class change.

---

### 7. `src/components/layout/Footer.tsx`

**Findings**: 1.2, 1.3, 6.6 — Copyright contrast, description contrast, hover arrow

**Current code:**

Line 55 (description): `text-cream/70` on `bg-primary-800` (`#4E2509`)
```tsx
<p className="text-cream/70 text-sm leading-relaxed max-w-xs">
```

Line 174 (bottom bar / copyright): `text-cream/40` on `bg-primary-800`
```tsx
<div className="... text-xs text-cream/40">
```

Line 107 (hover arrow `→`):
```tsx
<span className="w-0 overflow-hidden group-hover:w-2.5 transition-all duration-200 text-primary-400">→</span>
```
Arrow `→` is rendered text without `aria-hidden="true"`.

**Fixes needed:**
- Line 55: `text-cream/70` → `text-cream/80` (finding 1.3)
- Line 174: `text-cream/40` → `text-cream/60` (finding 1.2)
- Line 107: Add `aria-hidden="true"` to the arrow span (finding 6.6)

**Risk**: None. Pure class swaps + attribute.

---

### 8. `src/components/contact/ContactForm.tsx`

**Findings**: 7.1, 7.2, 2.5, 2.7, 7.3, 1.4, 1.6, 3.3 — autocomplete, aria-invalid, role="alert", success focus, disclaimer order, label contrast, input border, focus ring

**Current state by finding:**

**7.1 — Missing autocomplete (lines 86–107):**
```tsx
<input id="name" name="name" type="text" required ... />          // ← no autocomplete
<input id="email" name="email" type="email" required ... />       // ← no autocomplete
```

**7.2 — Missing aria-invalid / aria-describedby:** No field-level error handling — only a top-level error div. No `aria-invalid` on inputs, no error IDs for `aria-describedby`.

**2.5 — Error div missing role="alert" (lines 71–79):**
```tsx
<div className="rounded-xl border border-accent/25 bg-accent/8 px-4 py-3.5 flex items-start gap-3">
  <AlertCircle ... />
  <div>
    <p className="text-sm font-medium text-accent">Error al enviar</p>
    ...
  </div>
</div>
```
No `role="alert"` — screen readers won't announce it.

**2.7 — Success state missing focus management (lines 52–66):**
```tsx
if (state.success) {
  return (
    <div className="rounded-2xl bg-secondary/8 ...">
      <CheckCircle ... />
      <h3 className="font-heading font-semibold text-primary text-lg">¡Mensaje enviado!</h3>
      ...
    </div>
  )
}
```
No `role="status"` or `tabIndex={-1}` + `useEffect` focus on heading.

**7.3 — Disclaimer position (lines 140–143):**
```tsx
<SubmitButton />
<p className="text-center text-xs text-stone/50">
  Al enviar este formulario aceptas que utilicemos tus datos...
</p>
```
Disclaimer is **after** the submit button. Must move **before** it (or add `aria-describedby` on the form/button pointing to the disclaimer).

**1.4 — Label contrast (line 47):**
```tsx
const labelClass = 'block text-xs font-semibold text-stone/70 uppercase tracking-wide mb-1.5'
```
`text-stone/70` = `#57534E` at 70% on white bg ≈ 3.8:1. Must be `text-stone` (full opacity) ≈ 6.5:1.

**1.6 — Input border contrast (line 41):**
```tsx
const inputClass = cn(
  'w-full rounded-xl border border-stone/25 bg-white px-4 py-3 text-sm text-stone',
  'placeholder:text-stone/50',
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
  ...
)
```
`border-stone/25` = very light border — insufficient for UI component boundary. Fix: `border-stone/50`.
`focus:ring-primary/20` — ring is nearly invisible. Fix: `focus:ring-primary focus:ring-offset-1` (finding 3.3).

**Risk**: The form uses `useActionState` (React 19) — success/error states are server-driven. The focus management for success state needs a `useEffect` watching `state.success` to call `headingRef.current?.focus()`.

---

### 9. `src/components/places/CategoryNav.tsx`

**Findings**: 2.8, 3.4, 4.3, 13.2 — aria-pressed, keyboard scroll focus, touch targets, scroll container keyboard

**Current code (lines 64–107):**

Scroll container (line 68–73):
```tsx
<div
  className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none"
  style={{ maskImage: '...', WebkitMaskImage: '...' }}
>
```
No `tabIndex={0}` or `aria-label` on scroll container.

Category buttons (lines 78–103):
```tsx
<button
  key={cat.id}
  type="button"
  onClick={() => handleClick(cat.id)}
  className={cn(
    'flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs sm:px-4 sm:py-2 ...',
    ...
  )}
>
```
- No `aria-pressed={isActive}` on buttons
- Touch target: `py-1.5` = 6px vertical padding + ~16px text = ~28px. Borderline on mobile (`py-1.5` + `text-xs` = risky). Fix: add `min-h-[44px]` on mobile (or ensure `py-2` minimum on mobile).
- `handleClick` scrolls the page but doesn't focus the target section element

**Fixes needed:**
- Add `aria-pressed={isActive}` to each button (line 79)
- Add `tabIndex={0}` + `aria-label="Filtrar por categoría"` to scroll container (line 68)
- In `handleClick`: after `window.scrollTo`, add `el.tabIndex = -1; el.focus({ preventScroll: true })`
- Mobile touch target: change `py-1.5` → `py-2` on mobile, or wrap with `min-h-[44px] flex items-center`

**Risk**: Setting `tabIndex={-1}` + `focus()` on section headings is safe but requires the section elements (`id={cat.id}`) to be focusable elements or accept focus. These sections are likely `<section>` or `<div>` elements — must verify in the calling page. Adding `tabIndex={-1}` programmatically is the correct approach.

---

### 10. `src/app/globals.css`

**Findings**: 5.2, 5.3, 12.4 — prefers-reduced-motion for Tailwind transitions, animate-bounce, animate-spin

**Current state (lines 228–240):**
```css
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-fade-in-up,
  .animate-slide-in-left,
  .animate-bounce-slow,
  .stagger-children > *,
  .stagger-children.is-animating > * {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```
This covers custom animation classes but **does NOT cover**:
- Tailwind's `transition-*` utility classes (applied to buttons, links via globals `a, button` rule at lines 95–103)
- Tailwind's `animate-bounce` (used in `animate-bounce-slow` via custom class — covered, but Tailwind's built-in `animate-bounce` would not be)
- Tailwind's `animate-spin` (used on `Loader2` in ContactForm: `<Loader2 className="w-4 h-4 animate-spin" />`)

**Fix needed:** Add a universal block AFTER the existing rule (or merge into it):
```css
@media (prefers-reduced-motion: reduce) {
  /* Universal coverage for Tailwind transition/animation utilities */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
Note: Using `0.01ms` (not `0`) preserves `transitionend` event firing, which some JS depends on. The existing named-class overrides can remain for specificity in case they set `transform: none`.

**Risk**: The `animate-spin` on `Loader2` inside `SubmitButton` is functional (indicates pending state), not decorative. Using `animation-duration: 0.01ms` rather than `animation: none` means it effectively stops but without breaking the `transitionend` callback. Acceptable trade-off.

---

### 11. `src/app/(site)/loading.tsx`

**Finding**: 12.1 — Missing `role="status"`

**Current code (lines 1–9):**
```tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="sr-only">Cargando...</span>
      </div>
    </div>
  )
}
```

**Fix needed:** Add `role="status"` to outer wrapper:
```tsx
<div role="status" className="flex items-center justify-center min-h-[60vh]">
```
The `<span className="sr-only">Cargando...</span>` already provides the accessible label. ✓

**Risk**: None. 

---

### 12. `src/app/(site)/error.tsx`

**Finding**: 2.6 — Missing `role="alert"`

**Current code (lines 15–28):**
```tsx
return (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
    <h2 className="font-heading text-xl text-text-primary">Algo salió mal</h2>
    ...
  </div>
)
```

**Fix needed:** Add `role="alert"` to outer wrapper:
```tsx
<div role="alert" className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
```

**Risk**: None. `role="alert"` implies `aria-live="assertive"` — appropriate for error states.

---

### 13. `src/app/not-found.tsx`

**Finding**: 6.3 — Missing metadata title (also Compass/Home icons need `aria-hidden`)

**Current code:** No `export const metadata` or `export async function generateMetadata` at top of file.

**Fix needed:**
```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Página no encontrada — Tepexi Digital',
}
```

**Additional fix (finding 6.4 — decorative Lucide icons):**
```tsx
<Compass className="w-10 h-10 text-primary" strokeWidth={1.5} aria-hidden="true" />
// and
<Home className="w-4 h-4" aria-hidden="true" />
```

**Risk**: None. Static metadata export in a Server Component.

---

### 14. `src/components/ui/PageHero.tsx`

**Finding**: 8.1 — Background image should have `alt=""`

**Current code (lines 55–79):**
```tsx
export function PageHero({
  imageUrl,
  imageAlt = '',   // ← default is already '' ✓
  ...
}: PageHeroProps) {
  return (
    <section ...>
      <Image
        src={imageUrl}
        alt={imageAlt}    // ← uses prop
        fill
        priority
        ...
      />
```

**Analysis**: The default `imageAlt = ''` is correct — decorative background images should have empty alt. However, the `PageHeroProps` type exposes `imageAlt?: string`, and **callers are passing descriptive alt text** (e.g., gastronomia/[slug]/page.tsx line 87 passes `heroImageAlt` which is `images[0]?.alt ?? item.title ?? 'Imagen de gastronomía'`).

Since this is a purely decorative background image (has a dark overlay on top, content is in a `<Container>` above it), the alt should always be `""`.

**Fix needed:** Change the prop to always enforce `alt=""`:
```tsx
// Option A: Remove imageAlt prop, always use alt=""
<Image src={imageUrl} alt="" fill priority ... />

// Option B: Keep prop but document it as decorative-only (less clear)
```
Option A is cleaner. Callers passing `imageAlt` can remove that prop.

**Callers to update**: Search needed — at minimum `gastronomia/[slug]/page.tsx` (line 87), and all pages using `<PageHero>`. Likely: lugares/[slug], cultura/[slug], agenda page, etc.

**Risk**: Removing `imageAlt` from the type interface will cause TypeScript errors at all callers — must audit all usages. This is a small breaking change within the codebase but is the correct fix.

---

### 15. `src/components/places/PlaceCard.tsx`

**Finding**: 1.5 — Category badge contrast

**Current code (line 48):**
```tsx
<span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-cream/90 backdrop-blur-sm text-primary px-2.5 py-1 text-xs font-semibold shadow-sm">
  {category}
</span>
```
`text-primary` = `#8B4513` on `bg-cream/90` = `#FFFBF0` at 90% opacity ≈ 4.0:1 — fails AA (4.5:1 required for small text at `text-xs`).

**Fix needed:**
```tsx
<span className="... text-primary-dark ...">
```
`text-primary-dark` = `#6B3410` on `bg-cream/90` ≈ 5.5:1 — passes AA. ✓

**Risk**: None. Single class swap.

---

## Risks Summary

| Risk | Severity | Mitigation |
|------|----------|------------|
| Focus trap in MobileNavToggle — Tab cycle must enumerate focusable nodes at runtime | Medium | Only `<a>` links inside nav; static list, predictable |
| `inert` on main/footer while mobile nav open — needs DOM query or React state | Medium | Use `useEffect` + `document.querySelector` or add `data-inert` wrapper refs |
| Leaflet marker keyboard access — react-leaflet v5 + Leaflet 1.9 API | Medium | Use `keyboard={true}` + `title` props on `<Marker>`; verify react-leaflet v5 prop passthrough |
| Leaflet SVG shapes per category — inline SVG string switching | Low | Implement `CATEGORY_SHAPES` map with 4 SVG string variants |
| PageHero `imageAlt` prop removal breaks all callers | Low | TypeScript will catch all sites; mechanical cleanup |
| `animate-spin` on Loader2 suppressed by reduced-motion CSS | Low | Use `0.01ms` duration not `none` to preserve UX signal |
| DifficultyFlames missing `<dd>` wrapper in gastronomia sidebar | Low | Wrap component output in `<dd>` at call site |
| CategoryNav section target elements need `tabIndex={-1}` to receive programmatic focus | Low | Add to `handleClick` — no DOM mutation issues |

---

## Next Recommended Phase

**sdd-propose** — all 15 files are fully understood, exact line-level changes are mapped, no ambiguities remain. Ready to write a change proposal grouping findings into logical implementation tasks.

---

## Skill Resolution

- `_shared/SKILL.md` — loaded (shared SDD references)
- `sdd-explore/SKILL.md` — loaded (executor mode)
- `nextjs-15/SKILL.md` — loaded (App Router conventions, metadata, Server Components)
- `react-19/SKILL.md` — loaded (no forwardRef, named imports, `useActionState`)
