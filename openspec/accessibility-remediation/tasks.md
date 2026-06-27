# Tasks: Accessibility Remediation (WCAG 2.2 AA)

**Status**: complete
**Change**: accessibility-remediation
**Project**: tepexi-digital
**Date**: 2026-06-27

---

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 500–620 (additions + deletions) |
| 400-line budget risk | **High** |
| Chained PRs recommended | **Yes** |
| Suggested split | PR 1 (T1+T2 → Tier 1–2, ~200 lines) → PR 2 (T3+T4 → Tier 3–4, ~130 lines) → PR 3 (T5+T6+T7 → Tier 5–7, ~200 lines) |
| Delivery strategy | auto-forecast |
| Chain strategy | stacked-to-main |

```
Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High
```

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Critical navigation + contrast | PR 1 | T1-1 → T1-4, T2-1; base = fix/accessibility-audit-remediation |
| 2 | ARIA completeness + motion | PR 2 | T3-1 → T3-5, T4-1; base = PR 1 branch |
| 3 | Forms + map markers + suggestions | PR 3 | T5-1, T6-1, T7-1; base = PR 2 branch |

---

## Phase 1 — Tier 1: Critical Navigation & Interaction

### ✅ T1-1: Add skip navigation link and main landmark

- **task_id**: T1-1
- **title**: Add skip navigation link and main landmark
- **files**: `src/app/(site)/layout.tsx`
- **requirements**: REQ-A1, REQ-A2
- **dependencies**: []

**implementation_steps**:

1. After the closing `>` of the `{isHomePage && ...}` preload block and before `<Navbar />` on line 55, insert:
   ```tsx
   <a
     href="#main-content"
     className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-cream focus:rounded focus:outline-none focus:ring-2 focus:ring-cream"
   >
     Saltar al contenido
   </a>
   ```
2. Change line 56 from:
   ```tsx
   <main className="min-h-screen">{children}</main>
   ```
   to:
   ```tsx
   <main id="main-content" tabIndex={-1} className="min-h-screen">{children}</main>
   ```

**verification**: Press Tab from browser address bar → "Saltar al contenido" link appears visually. Press Enter → focus moves to `<main>` (no visible focus ring on main itself due to `tabIndex={-1}`).

**commit_message**: `fix(a11y): add skip navigation link and main landmark`

---

### ✅ T1-2: Fix mobile nav focus trap and ARIA dialog

- **task_id**: T1-2
- **title**: Fix mobile nav focus trap and ARIA dialog
- **files**: `src/components/layout/MobileNavToggle.tsx`
- **requirements**: REQ-A3, REQ-A4, REQ-A5
- **dependencies**: []

**implementation_steps**:

1. Add `useRef` to imports: change line 3 from `import { useState, useEffect, useCallback }` to `import { useState, useEffect, useCallback, useRef }`.
2. Inside the `MobileNavToggle` function, after `const close = ...` line, add two refs:
   ```tsx
   const toggleRef = useRef<HTMLButtonElement>(null)
   const firstLinkRef = useRef<HTMLAnchorElement>(null)
   ```
3. Add a focus management `useEffect` after the existing scroll-lock effect:
   ```tsx
   // Focus management: first link on open, toggle on close
   useEffect(() => {
     if (isOpen) {
       firstLinkRef.current?.focus()
     } else {
       // only restore if panel was previously open (avoid firing on mount)
       if (mounted) toggleRef.current?.focus()
     }
   }, [isOpen, mounted])
   ```
4. Add an `inert` management `useEffect` after the focus effect:
   ```tsx
   // Inert background content while nav is open (REQ-A5)
   useEffect(() => {
     const mainEl = document.querySelector('main')
     const footerEl = document.querySelector('footer')
     if (isOpen) {
       mainEl?.setAttribute('inert', '')
       footerEl?.setAttribute('inert', '')
     } else {
       mainEl?.removeAttribute('inert')
       footerEl?.removeAttribute('inert')
     }
     return () => {
       mainEl?.removeAttribute('inert')
       footerEl?.removeAttribute('inert')
     }
   }, [isOpen])
   ```
5. Add Tab focus trap `useEffect`:
   ```tsx
   useEffect(() => {
     if (!isOpen) return
     const panel = document.getElementById('mobile-nav')
     if (!panel) return
     const focusableSelector = 'a[href], button:not([disabled])'
     const handleKeyDown = (e: KeyboardEvent) => {
       if (e.key !== 'Tab') return
       const focusable = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector))
       if (focusable.length === 0) return
       const first = focusable[0]
       const last = focusable[focusable.length - 1]
       if (e.shiftKey) {
         if (document.activeElement === first) { e.preventDefault(); last.focus() }
       } else {
         if (document.activeElement === last) { e.preventDefault(); first.focus() }
       }
     }
     panel.addEventListener('keydown', handleKeyDown)
     return () => panel.removeEventListener('keydown', handleKeyDown)
   }, [isOpen])
   ```
6. Add `role="dialog" aria-modal="true" aria-label="Menú de navegación"` to the slide-in panel `<div id="mobile-nav" ...>` (currently line 71–77).
7. Assign `ref={toggleRef}` to the hamburger `<button>` (currently line 129).
8. Assign `ref={firstLinkRef}` to the first `<Link>` rendered inside `navLinks.map` (the one at line 98) — change it to:
   ```tsx
   <Link
     ref={index === 0 ? firstLinkRef : undefined}
     href={link.href}
     onClick={close}
     ...
   >
   ```
   Note: `Link` accepts `ref` as a forwarded ref in Next.js 15+.
9. Add `aria-hidden="true"` to each `<Icon>` inside the nav links span (line 104): `<Icon size={16} aria-hidden="true" />`.

**verification**: Open mobile nav → focus moves to first nav link. Tab through all items → focus stays inside panel and wraps. Press Escape → panel closes, focus returns to hamburger button. With inert: Tab in background does not reach `<main>` content while nav is open.

**commit_message**: `fix(a11y): focus trap and aria-dialog on mobile nav`

---

### ✅ T1-3: Add pause button and keyboard support to ImageCarousel

- **task_id**: T1-3
- **title**: Add carousel pause button, focus pause, aria-pressed dots, live region
- **files**: `src/components/gallery/ImageCarousel.tsx`
- **requirements**: REQ-A6, REQ-A7, REQ-A8, REQ-A9
- **dependencies**: []

**implementation_steps**:

1. Add `{ Pause, Play }` to the lucide-react import (keep `ChevronLeft, ChevronRight`).
2. Add two new state variables after `const [isHovered, ...]`:
   ```tsx
   const [isPaused, setIsPaused] = useState(false)
   const [isFocused, setIsFocused] = useState(false)
   ```
3. Modify the `useEffect` condition on line 41 from:
   ```tsx
   if (!autoPlay || isHovered || images.length <= 1) return
   ```
   to:
   ```tsx
   if (!autoPlay || isHovered || isPaused || isFocused || images.length <= 1) return
   ```
4. Update the `useEffect` dependency array on line 48 from `[autoPlay, interval, isHovered, images.length]` to `[autoPlay, interval, isHovered, isPaused, isFocused, images.length]`.
5. Add `onFocus` and `onBlur` handlers to the outer wrapper `<div>` (line 53):
   ```tsx
   onFocus={() => setIsFocused(true)}
   onBlur={() => setIsFocused(false)}
   ```
6. After the closing `</>` of the navigation buttons block (after line 104), and before the dot indicators block (line 107), add the pause/play button:
   ```tsx
   {/* Pause/play — always visible, not just on hover (REQ-A6) */}
   <button
     type="button"
     onClick={() => setIsPaused((p) => !p)}
     aria-pressed={isPaused}
     aria-label={isPaused ? 'Reproducir carrusel' : 'Pausar carrusel'}
     className="absolute bottom-4 right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
   >
     {isPaused ? <Play className="w-4 h-4" aria-hidden="true" /> : <Pause className="w-4 h-4" aria-hidden="true" />}
   </button>
   ```
7. Add `aria-hidden="true"` to `<ChevronLeft>` and `<ChevronRight>` icons (lines 91, 102):
   ```tsx
   <ChevronLeft className="w-5 h-5" aria-hidden="true" />
   <ChevronRight className="w-5 h-5" aria-hidden="true" />
   ```
8. On each dot `<button>` (line 111), add `aria-pressed={index === activeIndex}` and bump touch target with `p-2 -m-2`:
   ```tsx
   <button
     key={index}
     onClick={() => goTo(index)}
     aria-label={`Ir a imagen ${index + 1}`}
     aria-pressed={index === activeIndex}
     className={cn(
       'w-2 h-2 rounded-full transition-all p-2 -m-2 box-content',
       index === activeIndex
         ? 'bg-white scale-110'
         : 'bg-white/50 hover:bg-white/75',
     )}
   />
   ```
9. Add live region at the very end of the outer wrapper `<div>`, just before its closing tag:
   ```tsx
   {/* Live region for AT slide announcements (REQ-A9) */}
   <div
     role="status"
     aria-live="polite"
     aria-atomic="true"
     className="sr-only"
   >
     Imagen {activeIndex + 1} de {images.length}
   </div>
   ```

**verification**: Pause button is always visible (not hover-gated). Focusing any element inside pauses autoplay; blur resumes. Active dot has `aria-pressed="true"`. Screen reader (NVDA/VoiceOver) announces slide changes politely.

**commit_message**: `fix(a11y): carousel pause button, keyboard focus, aria-pressed dots, live region`

---

### ✅ T1-4: Fix dl/dt/dd structure in gastronomia ficha

- **task_id**: T1-4
- **title**: Wrap gastronomia ficha del platillo in proper dl element
- **files**: `src/app/(site)/gastronomia/[slug]/page.tsx`
- **requirements**: REQ-A10
- **dependencies**: []

**implementation_steps**:

1. Change line 231 from:
   ```tsx
   <div className="p-4 sm:p-5 space-y-5" style={{ background: '#FDFAF8' }}>
   ```
   to:
   ```tsx
   <dl className="p-4 sm:p-5 space-y-5" style={{ background: '#FDFAF8' }}>
   ```
2. The difficulty row (line 232–244) has `<dt>` but `<DifficultyFlames>` is not in a `<dd>`. Wrap it:
   ```tsx
   <div>
     <dt className="text-[11px] uppercase tracking-widest font-semibold mb-1 text-stone">
       Dificultad
     </dt>
     <dd>
       <DifficultyFlames difficulty={item.difficulty} />
     </dd>
   </div>
   ```
   (The icon `<Flame>` in the outer flex div is decorative — add `aria-hidden="true"` to it: `<Flame className="w-4 h-4 text-accent" aria-hidden="true" />`.)
3. The preparationTime, servings, season, priceRange, origin, cost rows already have `<dt>` + `<dd>` pairs — they are valid. Verify each `<dd>` exists; if any `<DifficultyFlames>` or `<PriceSymbols>` output is not in a `<dd>`, wrap it in one (line 297: `<PriceSymbols priceRange={item.priceRange} />` → `<dd><PriceSymbols priceRange={item.priceRange} /></dd>`).
4. Change the closing `</div>` matching the opening changed in step 1 (line 329) to `</dl>`.

**verification**: View page source or DevTools Elements panel — outer container for ficha content is `<dl>`. AT (NVDA) reads "list" or "definition list" when entering section. HTML validator passes with no dl/dt/dd nesting errors.

**commit_message**: `fix(a11y): wrap ficha platillo in dl element with proper dt/dd pairs`

---

## Phase 2 — Tier 2: Contrast

### ✅ T2-1: Fix contrast across hero, footer, form, and badge

- **task_id**: T2-1
- **title**: Fix contrast ratios across hero eyebrow, footer text, form inputs, and badge
- **files**:
  - `src/app/(site)/page.tsx`
  - `src/components/layout/Footer.tsx`
  - `src/components/contact/ContactForm.tsx`
  - `src/components/places/PlaceCard.tsx`
- **requirements**: REQ-B1, REQ-B2, REQ-B3, REQ-B4, REQ-B5, REQ-B6, REQ-B7
- **dependencies**: []

**implementation_steps**:

1. **page.tsx** — Line 90: change `text-cream/70` → `text-cream/90` on the eyebrow `<p>` only:
   ```tsx
   <p className="inline-flex items-center gap-2 text-cream/90 text-sm font-medium uppercase tracking-[0.2em] mb-6 animate-fade-in">
   ```
2. **Footer.tsx** — Line 55: change `text-cream/70` → `text-cream/80` on the description `<p>`:
   ```tsx
   <p className="text-cream/80 text-sm leading-relaxed max-w-xs">
   ```
3. **Footer.tsx** — Line 174: change `text-cream/40` → `text-cream/60` on the bottom bar `<div>`:
   ```tsx
   <div className="mt-8 md:mt-12 pt-6 border-t border-cream/8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/60">
   ```
4. **ContactForm.tsx** — Change the `labelClass` constant on line 47 from `text-stone/70` → `text-stone`:
   ```tsx
   const labelClass = 'block text-xs font-semibold text-stone uppercase tracking-wide mb-1.5'
   ```
5. **ContactForm.tsx** — Change the `inputClass` constant on line 41 from `border-stone/25` → `border-stone/50`:
   ```tsx
   'w-full rounded-xl border border-stone/50 bg-white px-4 py-3 text-sm text-stone',
   ```
6. **ContactForm.tsx** — Change focus ring in `inputClass` line 43 from `focus:ring-primary/20` → `focus:ring-primary focus:ring-offset-1`:
   ```tsx
   'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
   ```
7. **PlaceCard.tsx** — Line 48: change `text-primary` → `text-primary-dark` on the badge `<span>` only (not the card title or other text-primary):
   ```tsx
   <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-cream/90 backdrop-blur-sm text-primary-dark px-2.5 py-1 text-xs font-semibold shadow-sm">
   ```

**verification**: Use browser DevTools color picker or axe-core browser extension. Confirm: eyebrow ≥ 4.5:1; footer copyright ≥ 4.5:1; footer description ≥ 4.5:1; form labels ≥ 4.5:1; badge text ≥ 4.5:1; input borders ≥ 3:1; focus ring clearly visible on input focus.

**commit_message**: `fix(a11y): contrast fixes hero eyebrow, footer text, form inputs, badge`

---

## Phase 3 — Tier 3: ARIA Completeness

### T3-1: Add role=alert/status to error, loading, not-found pages

- **task_id**: T3-1
- **title**: Add role=alert and role=status to error/loading/404 pages
- **files**:
  - `src/app/(site)/error.tsx`
  - `src/app/(site)/loading.tsx`
  - `src/app/not-found.tsx`
- **requirements**: REQ-C1, REQ-C2, REQ-C3, REQ-C13
- **dependencies**: []

**implementation_steps**:

1. **error.tsx** — Add `role="alert"` to the outer `<div>` on line 16:
   ```tsx
   <div role="alert" className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
   ```
2. **loading.tsx** — Add `role="status"` to the outer `<div>` on line 3:
   ```tsx
   <div role="status" className="flex items-center justify-center min-h-[60vh]">
   ```
3. **not-found.tsx** — Add `Metadata` export after the imports:
   ```tsx
   import type { Metadata } from 'next'
   export const metadata: Metadata = {
     title: 'Página no encontrada — Tepexi Digital',
   }
   ```
4. **not-found.tsx** — Add `aria-hidden="true"` to the `<Compass>` icon (line 17):
   ```tsx
   <Compass className="w-10 h-10 text-primary" strokeWidth={1.5} aria-hidden="true" />
   ```
5. **not-found.tsx** — Add `aria-hidden="true"` to the `<Home>` icon (line 64):
   ```tsx
   <Home className="w-4 h-4" aria-hidden="true" />
   ```

**verification**: Trigger error boundary → screen reader (NVDA) immediately announces error content. Navigate to `/loading` route during SSR → AT announces "Cargando…" politely. Navigate to `/nonexistent-path` → browser tab title reads "Página no encontrada — Tepexi Digital". NVDA does not announce Compass or Home icons.

**commit_message**: `fix(a11y): role=alert/status on error+loading, metadata on 404, aria-hidden icons`

---

### T3-2: Fix ContactForm ARIA — error alert, success focus, skeleton roles

- **task_id**: T3-2
- **title**: Add role=alert to form error, focus success heading, role=status on skeletons
- **files**:
  - `src/components/contact/ContactForm.tsx`
  - `src/components/gallery/DynamicImageCarousel.tsx`
  - `src/components/map/DynamicLeafletMap.tsx`
- **requirements**: REQ-C4, REQ-C12
- **dependencies**: [T1-3]

**implementation_steps**:

1. **ContactForm.tsx** — Add `useRef` and `useEffect` to the import on line 3: change `import { useActionState } from 'react'` to `import { useActionState, useRef, useEffect } from 'react'`.
2. **ContactForm.tsx** — Add a `successRef` inside the `ContactForm` function, before the `if (state.success)` branch:
   ```tsx
   const successRef = useRef<HTMLHeadingElement>(null)
   useEffect(() => {
     if (state.success) successRef.current?.focus()
   }, [state.success])
   ```
3. **ContactForm.tsx** — Add `ref={successRef}` and `tabIndex={-1}` to the success `<h3>` (line 58):
   ```tsx
   <h3 ref={successRef} tabIndex={-1} className="font-heading font-semibold text-primary text-lg">
   ```
4. **ContactForm.tsx** — Add `role="alert"` to the error div (line 72):
   ```tsx
   <div role="alert" className="rounded-xl border border-accent/25 bg-accent/8 px-4 py-3.5 flex items-start gap-3">
   ```
5. **ContactForm.tsx** — Add `aria-hidden="true"` to the `<AlertCircle>` icon (line 73): `<AlertCircle className="w-4.5 h-4.5 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />`.
6. **ContactForm.tsx** — Add `aria-hidden="true"` to `<CheckCircle>` in success state (line 56): `<CheckCircle className="w-8 h-8 text-secondary" aria-hidden="true" />`.
7. **DynamicImageCarousel.tsx** — Change the loading skeleton `<div>` on line 14:
   ```tsx
   loading: () => (
     <div
       role="status"
       aria-label="Cargando imágenes"
       className="w-full aspect-video bg-sand animate-pulse rounded-2xl shadow-md"
     />
   ),
   ```
8. **DynamicLeafletMap.tsx** — Change the loading skeleton `<div>` on line 10:
   ```tsx
   loading: () => (
     <div
       role="status"
       aria-label="Cargando mapa"
       className="w-full h-[400px] bg-sand animate-pulse rounded-xl flex flex-col items-center justify-center gap-3"
     >
   ```
9. **DynamicLeafletMap.tsx** — Add `aria-hidden="true"` to the `<Map>` icon inside the skeleton (line 12):
   ```tsx
   <Map className="w-6 h-6 text-primary/40" aria-hidden="true" />
   ```

**verification**: Submit contact form with server error → error div is announced immediately by AT. Submit successfully → focus moves to "¡Mensaje enviado!" heading. On map page while loading → AT announces "Cargando mapa".

**commit_message**: `fix(a11y): role=alert on form error, focus on success, role=status on skeletons`

---

### T3-3: Add aria-pressed and keyboard to CategoryNav

- **task_id**: T3-3
- **title**: Add aria-pressed, scroll container tabIndex, and focus management to CategoryNav
- **files**: `src/components/places/CategoryNav.tsx`
- **requirements**: REQ-C5, REQ-C6, REQ-C7
- **dependencies**: []

**implementation_steps**:

1. Add `aria-pressed={isActive}` to each category `<button>` (line 78):
   ```tsx
   <button
     key={cat.id}
     type="button"
     aria-pressed={isActive}
     onClick={() => handleClick(cat.id)}
     className={cn(...)}
   >
   ```
2. Add `tabIndex={0}` and `aria-label="Filtrar por categoría"` to the scroll container `<div>` (line 69):
   ```tsx
   <div
     tabIndex={0}
     aria-label="Filtrar por categoría"
     className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none"
     style={{...}}
   >
   ```
3. Update `handleClick` to move focus to the target section after scroll (replace lines 53–59):
   ```tsx
   function handleClick(id: string) {
     const el = document.getElementById(id)
     if (!el) return
     const yOffset = -100
     const y = el.getBoundingClientRect().top + window.scrollY + yOffset
     window.scrollTo({ top: y, behavior: 'smooth' })
     // Move focus to section for AT users (REQ-C7)
     const currentTabIndex = el.getAttribute('tabindex')
     if (!currentTabIndex) el.setAttribute('tabindex', '-1')
     el.focus({ preventScroll: true })
   }
   ```

**verification**: Navigate category buttons with screen reader → AT announces "pressed" for active button. Tab to scroll container → it is focusable. Click a category button → focus moves to target section (verify with NVDA or browser focus inspector).

**commit_message**: `fix(a11y): aria-pressed, keyboard scroll, focus management in CategoryNav`

---

### T3-4: Add aria-hidden to decorative icons and emojis sitewide

- **task_id**: T3-4
- **title**: Add aria-hidden to all decorative Lucide icons and emoji characters
- **files**:
  - `src/components/layout/Footer.tsx`
  - `src/app/(site)/lugares/[slug]/page.tsx`
  - `src/app/(site)/agenda/page.tsx`
  - `src/components/gastronomia/IngredientIcon.tsx`
  - `src/components/gastronomia/DifficultyFlames.tsx`
  - `src/components/gastronomia/PriceSymbols.tsx`
- **requirements**: REQ-C8, REQ-C9, REQ-C10
- **dependencies**: []

**implementation_steps**:

1. **Footer.tsx** — Add `aria-hidden="true"` to the hover arrow `<span>` (line 107):
   ```tsx
   <span aria-hidden="true" className="w-0 overflow-hidden group-hover:w-2.5 transition-all duration-200 text-primary-400">→</span>
   ```
2. **Footer.tsx** — Add `aria-hidden="true"` to all Lucide icon usages that are decorative: `MapPin` on line 48, `MapPin` on line 122, `Mail` on line 138, `Phone` on line 149, `MapPin` on line 166 (Map CTA). Social link icons are already behind `aria-label` on the `<a>` — add `aria-hidden="true"` to each `<Icon size={16} />` on line 72.
3. **lugares/[slug]/page.tsx** — Search for the 💡 emoji (tip section). Wrap in:
   ```tsx
   <span aria-hidden="true">💡</span><span className="sr-only">Consejo</span>
   ```
4. **agenda/page.tsx** — Search for the 📅 emoji. Wrap in:
   ```tsx
   <span aria-hidden="true">📅</span><span className="sr-only">Agenda</span>
   ```
5. **IngredientIcon.tsx** — Add `aria-hidden="true"` to every returned icon (all 5 branches including default):
   ```tsx
   if (icon === 'utensils') return <Utensils className="w-5 h-5 text-accent" aria-hidden="true" />
   if (icon === 'flame') return <Flame className="w-5 h-5 text-accent" aria-hidden="true" />
   if (icon === 'leaf') return <Leaf className="w-5 h-5 text-accent" aria-hidden="true" />
   if (icon === 'grain') return <CircleDot className="w-5 h-5 text-accent" aria-hidden="true" />
   return <Utensils className="w-5 h-5 text-accent" aria-hidden="true" />
   ```
6. **DifficultyFlames.tsx** — Add `aria-hidden="true"` to each `<Flame>` icon (line 13):
   ```tsx
   <Flame
     key={n}
     aria-hidden="true"
     className={`w-4 h-4 ${n <= filled ? 'text-accent fill-accent' : 'text-stone/40 fill-stone/40'}`}
   />
   ```
7. **PriceSymbols.tsx** — Add `role="img"` and `aria-label` to the wrapper `<div>`, and `aria-hidden="true"` to each `<span>` (the `$` symbols are now conveyed by the wrapper label):
   ```tsx
   export function PriceSymbols({ priceRange }: PriceSymbolsProps) {
     const active = PRICE_RANGE_SYMBOLS[priceRange] ?? 1
     return (
       <div
         role="img"
         aria-label={`Rango de precio: ${active} de 3`}
         className="flex items-center gap-0.5"
       >
         {[1, 2, 3].map((n) => (
           <span
             key={n}
             aria-hidden="true"
             className={`text-lg font-bold ${n <= active ? 'text-accent' : 'text-stone/40'}`}
           >
             $
           </span>
         ))}
       </div>
     )
   }
   ```

**verification**: Run axe-core → no "image-alt" violations for icon SVGs. Screen reader on Footer links → `→` not announced. Screen reader on PriceSymbols → announces "Rango de precio: 2 de 3". 💡 and 📅 → AT reads "Consejo" / "Agenda" via sr-only text, not the emoji Unicode name.

**commit_message**: `fix(a11y): aria-hidden on decorative icons and emojis, role=img on PriceSymbols`

---

### T3-5: Add role=application to LeafletMap

- **task_id**: T3-5
- **title**: Wrap LeafletMap in role=application region
- **files**: `src/components/map/LeafletMap.tsx`
- **requirements**: REQ-C11
- **dependencies**: []

**implementation_steps**:

1. Replace the `return (` block (line 54) with:
   ```tsx
   return (
     <div role="application" aria-label="Mapa interactivo de Tepexi de Rodríguez">
       <MapContainer
         center={[mapCenter.lat, mapCenter.lng]}
         zoom={mapZoom}
         className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg z-0"
         scrollWheelZoom={false}
       >
         {/* ... existing TileLayer and Markers ... */}
       </MapContainer>
     </div>
   )
   ```

**verification**: Navigate to `/mapa` with screen reader → AT announces "Mapa interactivo de Tepexi de Rodríguez, application" when entering the map region.

**commit_message**: `fix(a11y): role=application wrapper on LeafletMap`

---

## Phase 4 — Tier 4: Motion

### T4-1: Universal prefers-reduced-motion in globals.css

- **task_id**: T4-1
- **title**: Extend prefers-reduced-motion to cover all transitions and Tailwind utilities
- **files**: `src/app/globals.css`
- **requirements**: REQ-D1, REQ-D2
- **dependencies**: []

**implementation_steps**:

1. The existing `@media (prefers-reduced-motion: reduce)` block at lines 228–240 only targets named animation utility classes. It does NOT suppress transitions on `a, button, [role="button"]` (lines 96–103) or Tailwind's inline `transition-*` utilities.
2. Extend the existing `@media (prefers-reduced-motion: reduce)` block by adding a universal rule **inside** it, before the existing class selectors:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *,
     *::before,
     *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }

     /* Keep existing named-class overrides below */
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

**verification**: Enable "Reduce Motion" in OS accessibility settings. Reload any page → nav hover transitions stop; carousel slide transition stops; MobileNavToggle panel does not animate; hero fade-in is instant. Confirm with Chrome DevTools → Emulate CSS prefers-reduced-motion: reduce.

**commit_message**: `fix(a11y): universal prefers-reduced-motion for all transitions and animations`

---

## Phase 5 — Tier 5: Forms Completeness

### T5-1: Add autocomplete, aria-invalid, disclaimer order, fieldset

- **task_id**: T5-1
- **title**: Add autocomplete, aria-invalid+describedby, disclaimer before button, fieldset legend
- **files**: `src/components/contact/ContactForm.tsx`
- **requirements**: REQ-E1, REQ-E2, REQ-E3, REQ-E4
- **dependencies**: [T3-2]

**implementation_steps**:

1. Add `autoComplete="name"` to the name `<input>` (line 86):
   ```tsx
   <input id="name" name="name" type="text" required autoComplete="name" placeholder="Tu nombre completo" className={inputClass} />
   ```
2. Add `autoComplete="email"` to the email `<input>` (line 100):
   ```tsx
   <input id="email" name="email" type="email" required autoComplete="email" placeholder="tu@correo.com" className={inputClass} />
   ```
3. The `useActionState` returns `state` which needs field-level error info. Check whether `sendContactMessage` returns per-field errors. If not, use the generic `state.error` as a fallback. For now, add a pattern that wires up when `state.error` is truthy — treat all required fields as potentially invalid:
   ```tsx
   // Add to ContactForm function body
   const hasError = !!state.error
   ```
   Then on name input add:
   ```tsx
   aria-invalid={hasError || undefined}
   aria-describedby={hasError ? 'form-error' : undefined}
   ```
   On email input add the same. On message textarea add the same.
4. Add `id="form-error"` to the error div (already has `role="alert"` from T3-2):
   ```tsx
   <div id="form-error" role="alert" className="...">
   ```
5. Move the disclaimer `<p>` (currently after `<SubmitButton />` at line 140) to be **before** `<SubmitButton />`:
   ```tsx
   <p className="text-center text-xs text-stone/50">
     Al enviar este formulario aceptas que utilicemos tus datos únicamente
     para responderte.
   </p>
   <SubmitButton />
   ```
6. Wrap the entire form fields section (grid of name+email, subject, message) in a `<fieldset>` with a visually-hidden `<legend>`:
   ```tsx
   <fieldset className="space-y-5 border-0 p-0 m-0">
     <legend className="sr-only">Información de contacto (campos requeridos)</legend>
     {/* grid with name+email, subject, message */}
   </fieldset>
   ```

**verification**: Open DevTools → name input has `autocomplete="name"`, email has `autocomplete="email"`. Submit form with error → name/email/message inputs have `aria-invalid="true"` and `aria-describedby="form-error"`. Inspect DOM order → disclaimer `<p>` appears before `<button type="submit">`. NVDA entering form → announces "Información de contacto (campos requeridos), group".

**commit_message**: `fix(a11y): form autocomplete, aria-invalid+describedby, disclaimer order, fieldset legend`

---

## Phase 6 — Tier 6: Map Markers

### T6-1: Distinct marker shapes per category and keyboard access

- **task_id**: T6-1
- **title**: Add per-category SVG marker shapes and keyboard accessibility to map markers
- **files**:
  - `src/components/map/LeafletMap.tsx`
- **requirements**: REQ-F1, REQ-F2, REQ-F3, REQ-F4
- **dependencies**: [T3-5, T3-4]

**implementation_steps**:

1. Extend `createCategoryIcon` signature to accept `type` parameter. Replace the current function (lines 17–41) with:
   ```tsx
   type MarkerType = 'lugar' | 'gastronomia' | 'cultura' | 'servicios'

   const CATEGORY_SHAPES: Record<string, string> = {
     lugar:       '<circle cx="16" cy="15" r="4" fill="${fill}" opacity="0.85"/>',
     gastronomia: '<rect x="12" y="11" width="8" height="8" fill="${fill}" opacity="0.85"/>',
     cultura:     '<polygon points="16,10 20,18 12,18" fill="${fill}" opacity="0.85"/>',
     servicios:   '<polygon points="16,10 20,15 16,20 12,15" fill="${fill}" opacity="0.85"/>',
   }

   function createCategoryIcon(color: string, type: string): L.DivIcon {
     const fill = HEX_COLOR_RE.test(color) ? color : '#8B4513'
     const shape = (CATEGORY_SHAPES[type] ?? CATEGORY_SHAPES.lugar).replace('${fill}', fill)
     const svg = `
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44">
         <defs>
           <filter id="pin-shadow-${type}" x="-30%" y="-10%" width="160%" height="140%">
             <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.35)"/>
           </filter>
         </defs>
         <path
           filter="url(#pin-shadow-${type})"
           d="M16 0C7.163 0 0 7.163 0 16c0 6.04 3.35 11.3 8.3 14.06L16 44l7.7-13.94C28.65 27.3 32 22.04 32 16 32 7.163 24.837 0 16 0z"
           fill="${fill}"
         />
         <circle cx="16" cy="15" r="6.5" fill="white" opacity="0.95"/>
         ${shape}
       </svg>
     `
     return L.divIcon({
       className: '',
       html: svg,
       iconSize: [32, 44],
       iconAnchor: [16, 44],
       popupAnchor: [0, -46],
     })
   }
   ```
   Note: unique `filter id` per type avoids SVG filter ID collisions when multiple markers render.
2. Update the `createCategoryIcon` call on line 66 to pass the marker type:
   ```tsx
   const icon = createCategoryIcon(marker.categoryColor, marker.type)
   ```
3. Add `keyboard={true}` and `title` props to each `<Marker>` (lines 69–73):
   ```tsx
   <Marker
     key={marker.id}
     position={[marker.coordinates.lat, marker.coordinates.lng]}
     icon={icon}
     keyboard={true}
     title={marker.title}
   >
   ```
4. Verify `DifficultyFlames`, `PriceSymbols`, and `IngredientIcon` fixes from T3-4 are complete (those files are already handled). No additional changes needed in LeafletMap for those.

**verification**: `/mapa` page shows 4 distinct geometric shapes inside markers (circle for lugares, square for gastronomia, triangle for cultura, diamond for servicios). Tab key cycles through markers. Each focused marker shows its location name as a browser tooltip (`title` attribute). Screen reader announces marker name via `title`. Color-blind simulation (Sim Daltonism or Chrome DevTools vision deficiency) — shapes remain distinguishable.

**commit_message**: `fix(a11y): distinct SVG marker shapes per category, keyboard access on map`

---

## Phase 7 — Tier 7: Suggestions

### T7-1: PageHero alt prop removal, hero stats dl, touch targets, inline links

- **task_id**: T7-1
- **title**: Remove imageAlt from PageHero, add dl hero stats, min touch targets, underline links
- **files**:
  - `src/components/ui/PageHero.tsx`
  - `src/app/(site)/page.tsx`
  - `src/app/(site)/agenda/[slug]/page.tsx`
  - `src/app/(site)/agenda/page.tsx`
  - `src/app/(site)/contacto/page.tsx`
  - `src/app/(site)/servicios/[slug]/page.tsx`
  - `src/app/(site)/gastronomia/[slug]/page.tsx`
  - `src/app/(site)/gastronomia/page.tsx`
  - `src/app/(site)/como-llegar/page.tsx`
  - `src/app/(site)/cultura/page.tsx`
  - `src/app/(site)/mapa/page.tsx`
  - `src/app/(site)/lugares/page.tsx`
  - `src/app/(site)/lugares/[slug]/page.tsx`
- **requirements**: REQ-G1, REQ-G2, REQ-G3, REQ-G4, REQ-G5
- **dependencies**: [T2-1]

**implementation_steps**:

1. **PageHero.tsx** — Remove `imageAlt?: string` from `PageHeroProps` interface (line 15).
2. **PageHero.tsx** — Remove `imageAlt = ''` from the destructuring (line 57), change `alt={imageAlt}` → `alt=""` (line 74).
3. **All 11 caller files** — Remove the `imageAlt={...}` prop from each `<PageHero>` call. Files and lines:
   - `agenda/[slug]/page.tsx` line 82: remove `imageAlt="Imagen hero de la agenda de eventos"`
   - `agenda/page.tsx` line 39: remove `imageAlt="Imagen hero de la agenda de eventos"`
   - `contacto/page.tsx` line 49: remove `imageAlt="Imagen hero de contacto"`
   - `servicios/[slug]/page.tsx` line 120: remove `imageAlt={heroImageAlt}`
   - `gastronomia/[slug]/page.tsx` line 87: remove `imageAlt={heroImageAlt}`
   - `gastronomia/page.tsx` line 113: remove `imageAlt="Imagen hero de gastronomía mostrando diferentes platillos"`
   - `como-llegar/page.tsx` line 71: remove `imageAlt="Imagen hero de aplicación google maps"`
   - `cultura/page.tsx` line 96: remove `imageAlt="Imagen hero de cultura"`
   - `mapa/page.tsx` line 73: remove `imageAlt="Imagen hero de un mapa"`
   - `lugares/page.tsx` line 112: remove `imageAlt="Imagen hero de una mapa y una camara encima"`
   - `lugares/[slug]/page.tsx` line 123: remove `imageAlt={heroImageAlt}`
4. **page.tsx** (homepage) — Change the hero stats `<div className="mt-8 md:mt-16 flex flex-wrap justify-center gap-8 sm:gap-12 animate-fade-in">` (line 152) to:
   ```tsx
   <dl
     className="mt-8 md:mt-16 flex flex-wrap justify-center gap-8 sm:gap-12 animate-fade-in"
     style={{ animationDelay: '400ms' }}
   >
     {[
       { value: '3', label: 'Zonas arqueológicas' },
       { value: '12+', label: 'Sitios naturales' },
       { value: '200+', label: 'Años de historia' },
     ].map(({ value, label }) => (
       <div key={label} className="text-center">
         <dd className="font-heading font-bold text-3xl text-primary-300 leading-none">{value}</dd>
         <dt className="text-xs mt-1 uppercase tracking-wide" style={{ color: '#FFFBF0' }}>{label}</dt>
       </div>
     ))}
   </dl>
   ```
   Note: `<dt>` after `<dd>` is valid HTML for this display pattern; the definition precedes its term visually but AT reads both.
5. **CategoryNav.tsx** — Ensure mobile buttons have minimum touch target by adding `min-h-[24px]` to the button className (append to existing `className={cn(...)}`). Already covered by `py-1.5 sm:py-2` giving ~24px height on sm+; explicitly add `min-h-[24px]` for certainty.
6. **contacto/page.tsx** — Find any inline `<Link>` inside paragraph text in the contact info section (lines 80+). Add `underline underline-offset-4` to those links' className.

**verification**: `npm run build` passes with no TypeScript errors (TypeScript will catch any remaining `imageAlt` prop usages). Hero stats: screen reader announces "definition list" or reads value+label pairs. CategoryNav: DevTools measure button height ≥ 24px. Contact page: inline links are visually underlined.

**commit_message**: `fix(a11y): PageHero alt prop removal, hero stats dl semantics, touch targets, underline links`

---

## Summary

| Phase | Tier | Tasks | Commits | Files |
|-------|------|-------|---------|-------|
| 1 | Navigation & Interaction (CRITICAL) | T1-1, T1-2, T1-3, T1-4 | 4 | 4 |
| 2 | Contrast (CRITICAL) | T2-1 | 1 | 4 |
| 3 | ARIA Completeness | T3-1, T3-2, T3-3, T3-4, T3-5 | 5 | 9 |
| 4 | Motion | T4-1 | 1 | 1 |
| 5 | Forms Completeness | T5-1 | 1 | 1 |
| 6 | Map Markers | T6-1 | 1 | 1 |
| 7 | Suggestions | T7-1 | 1 | 13 |
| **Total** | | **14 tasks** | **14 commits** | **~33 file touches** |

### Dependency Graph

```
T1-1 ──── (no deps)
T1-2 ──── (no deps)
T1-3 ──── (no deps)
T1-4 ──── (no deps)
T2-1 ──── (no deps)
T3-1 ──── (no deps)
T3-2 ──── depends on T1-3
T3-3 ──── (no deps)
T3-4 ──── (no deps)
T3-5 ──── (no deps)
T4-1 ──── (no deps)
T5-1 ──── depends on T3-2
T6-1 ──── depends on T3-5, T3-4
T7-1 ──── depends on T2-1
```

### Recommended apply order

**PR 1** (Tier 1 + 2, ~200 lines): T1-1 → T1-2 → T1-3 → T1-4 → T2-1
**PR 2** (Tier 3 + 4, ~130 lines): T3-1 → T3-3 → T3-4 → T3-5 → T3-2 → T4-1
**PR 3** (Tier 5 + 6 + 7, ~200 lines): T5-1 → T6-1 → T7-1

---

## Next Step

→ **sdd-apply** — implement tasks in order, one commit per task, following PR 1 → PR 2 → PR 3 chain.
