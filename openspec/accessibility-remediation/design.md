# Design: Accessibility Remediation (WCAG 2.2 AA)

**Status**: complete  
**Change**: accessibility-remediation  
**Project**: tepexi-digital  
**Date**: 2026-06-27  

---

## Technical Approach

Surgical fixes across 17 files — zero new dependencies, zero architecture changes. Each tier maps to one atomic commit. All patterns use existing Tailwind utilities, native HTML attributes, and React 19 APIs (`useRef`, `useEffect`, `useActionState`). No `useMemo`/`useCallback` (React Compiler handles optimization).

---

## Architecture Decisions

### Decision 1: Skip Link Pattern (REQ-A1, A2)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Tailwind `sr-only` + `focus:not-sr-only` | Zero JS, Server Component compatible | **Chosen** |
| Third-party `@reach/skip-nav` | Extra dependency for trivial HTML | Rejected |

**Implementation**: Insert `<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-cream focus:rounded focus:outline-none focus:ring-2 focus:ring-cream">Saltar al contenido</a>` before `<Navbar />` in `layout.tsx`. Add `id="main-content" tabIndex={-1}` to `<main>`. `tabIndex={-1}` prevents visible focus ring on programmatic focus.

### Decision 2: Focus Trap in MobileNavToggle (REQ-A3, A4, A5)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Manual `useRef` + keydown handler | No dependency, full control, nav is links-only | **Chosen** |
| `focus-trap-react` package | Adds dependency for a simple case | Rejected |
| `inert` via React state prop | Would require layout refactor to pass state down | Rejected — use `document.querySelector` |

**Implementation**:
- Add `useRef<HTMLButtonElement>` for toggle button, `useRef<HTMLElement>` for panel
- Panel div: `role="dialog" aria-modal="true" aria-label="Menú de navegación"`
- On open: query all focusable elements inside `#mobile-nav` (`a, button`), focus first link
- On close: restore focus to toggle button ref
- Tab trap: keydown listener — Tab on last → focus first; Shift+Tab on first → focus last
- `inert`: `useEffect` sets/removes `inert` on `document.querySelector('main')` and `document.querySelector('footer')` based on `isOpen`

### Decision 3: Carousel Pause + Focus (REQ-A6, A7, A8, A9)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `isPaused` state + `isFocused` state | Reuses existing `isHovered` pattern | **Chosen** |
| Single `isPaused` controlling all | Loses hover-resume behavior | Rejected |

**Implementation**:
- New `isPaused` state, pause/play `<button>` with `aria-pressed={isPaused}` positioned `absolute bottom-4 right-4`
- Wrapper: `onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}`
- `useEffect` condition: `if (!autoPlay || isHovered || isPaused || isFocused || images.length <= 1) return`
- Dots: add `aria-pressed={index === activeIndex}`, wrap content with padding `p-2 -m-2` for 24px touch target
- Live region: `<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">Imagen {activeIndex + 1} de {images.length}</div>`
- Prev/Next Lucide icons: add `aria-hidden="true"`

### Decision 4: `<dl>` Wrapper Pattern (REQ-A10)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Outer `<div>` → `<dl>`, keep `<div>` row wrappers | HTML spec allows `<div>` in `<dl>` for grouping | **Chosen** |
| Flatten all rows without wrapper divs | Breaks layout | Rejected |

**Implementation**: In `gastronomia/[slug]/page.tsx` line 231, change `<div className="p-4 sm:p-5 space-y-5">` → `<dl className="p-4 sm:p-5 space-y-5">`. Wrap `<DifficultyFlames>` in `<dd>` (line 241). Wrap `<PriceSymbols>` in `<dd>` (line 297).

### Decision 5: Contrast Class Swaps (REQ-B1–B7)

No alternatives — these are direct Tailwind opacity bumps to meet WCAG 1.4.3 (4.5:1) and 1.4.11 (3:1).

| File | Old Class | New Class | Ratio |
|------|-----------|-----------|-------|
| `page.tsx` L90 | `text-cream/70` | `text-cream/90` | 2.8:1 → 5.4:1 |
| `Footer.tsx` L174 | `text-cream/40` | `text-cream/60` | ≈2.0:1 → ≈3.5:1+ |
| `Footer.tsx` L55 | `text-cream/70` | `text-cream/80` | ≈3.5:1 → ≈4.6:1 |
| `ContactForm.tsx` L47 | `text-stone/70` | `text-stone` | 3.8:1 → 6.5:1 |
| `ContactForm.tsx` L41 | `border-stone/25` | `border-stone/50` | ≈1.5:1 → ≈3.2:1 |
| `ContactForm.tsx` L43 | `focus:ring-primary/20` | `focus:ring-primary focus:ring-offset-1` | visible ring |
| `PlaceCard.tsx` L48 | `text-primary` | `text-primary-dark` | 4.0:1 → 5.5:1 |

### Decision 6: Map Marker Shapes (REQ-F1, F2)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Inner SVG symbol inside white circle, per type | Keeps 32×44 icon size, distinguishable without color | **Chosen** |
| Entirely different pin shapes per type | More complex SVG, higher visual inconsistency | Rejected |

**Implementation**: Extend `createCategoryIcon(color, type)` with a second parameter. Shape map:

```typescript
const CATEGORY_SHAPES: Record<MapMarker['type'], string> = {
  lugar:       '<circle cx="16" cy="15" r="4" fill="${fill}" opacity="0.8"/>',
  gastronomia: '<rect x="12" y="11" width="8" height="8" fill="${fill}" opacity="0.8"/>',
  cultura:     '<polygon points="16,10 20,18 12,18" fill="${fill}" opacity="0.8"/>',
  servicios:   '<polygon points="16,10 20,15 16,20 12,15" fill="${fill}" opacity="0.8"/>',
}
```

Replace the white circle with white circle + inner shape. Add `keyboard={true}` and `title={marker.title}` to each `<Marker>`. Wrap `MapContainer` in `<div role="application" aria-label="Mapa interactivo de Tepexi de Rodríguez">`.

### Decision 7: PageHero `imageAlt` Prop Removal (REQ-G1)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Remove prop, hardcode `alt=""` | Breaking change but TypeScript catches all callers | **Chosen** |
| Keep prop, ignore it internally | Misleading API | Rejected |

**Implementation**: Remove `imageAlt` from `PageHeroProps`. Change `alt={imageAlt}` → `alt=""`. Remove `imageAlt` param from destructuring. Update 10 caller sites to remove `imageAlt` prop.

---

## Data Flow

```
User keystroke (Tab)
    │
    ├─→ Skip link (layout.tsx) ──→ #main-content focus
    │
    ├─→ MobileNavToggle
    │     isOpen=true ──→ focus first link
    │     │                   ├─→ Tab trap (keydown)
    │     │                   └─→ inert on main/footer
    │     isOpen=false ──→ restore focus to toggle
    │
    └─→ ImageCarousel
          onFocus ──→ isFocused=true ──→ pause autoplay
          onBlur  ──→ isFocused=false ──→ resume autoplay
          pause btn ──→ isPaused toggle
```

---

## File Changes

| File | Action | Description | Tier |
|------|--------|-------------|------|
| `src/app/(site)/layout.tsx` | Modify | Skip link + `main id` + `tabIndex` | T1 |
| `src/components/layout/MobileNavToggle.tsx` | Modify | Focus trap, dialog role, inert, refs | T1 |
| `src/components/gallery/ImageCarousel.tsx` | Modify | Pause btn, isPaused/isFocused, dots aria-pressed, live region, icon aria-hidden | T1 |
| `src/app/(site)/gastronomia/[slug]/page.tsx` | Modify | `<div>` → `<dl>`, wrap DifficultyFlames/PriceSymbols in `<dd>` | T1 |
| `src/app/(site)/page.tsx` | Modify | `text-cream/70` → `text-cream/90` (eyebrow), stats → `<dl>` | T2, T7 |
| `src/components/layout/Footer.tsx` | Modify | Contrast swaps + arrow `aria-hidden`, icon `aria-hidden` | T2, T3 |
| `src/components/contact/ContactForm.tsx` | Modify | Label/border/ring contrast, role="alert", success focus, autocomplete, aria-invalid, disclaimer order | T2, T3, T5 |
| `src/components/places/PlaceCard.tsx` | Modify | `text-primary` → `text-primary-dark` on badge | T2 |
| `src/app/(site)/error.tsx` | Modify | `role="alert"` | T3 |
| `src/app/(site)/loading.tsx` | Modify | `role="status"` | T3 |
| `src/app/not-found.tsx` | Modify | Export metadata, `aria-hidden` on Compass/Home icons | T3 |
| `src/components/places/CategoryNav.tsx` | Modify | `aria-pressed`, scroll `tabIndex`, `handleClick` focus, `min-h-[24px]` | T3, T7 |
| `src/components/gallery/DynamicImageCarousel.tsx` | Modify | `role="status"` on skeleton | T3 |
| `src/components/map/DynamicLeafletMap.tsx` | Modify | `role="status"` on skeleton, `aria-hidden` on Map icon | T3 |
| `src/app/globals.css` | Modify | Universal `prefers-reduced-motion` rule | T4 |
| `src/components/map/LeafletMap.tsx` | Modify | Shape per type, keyboard, title, `role="application"` wrapper | T6 |
| `src/components/ui/PageHero.tsx` | Modify | Remove `imageAlt` prop, hardcode `alt=""` | T7 |
| `src/components/gastronomia/DifficultyFlames.tsx` | Modify | `aria-hidden="true"` on Flame icons | T6 |
| `src/components/gastronomia/PriceSymbols.tsx` | Modify | `role="img"` + `aria-label` | T6 |
| `src/components/gastronomia/IngredientIcon.tsx` | Modify | `aria-hidden="true"` on all returned icons | T6 |
| PageHero callers (10 files) | Modify | Remove `imageAlt` prop | T7 |

**Totals**: 0 new, ~22 modified, 0 deleted

---

## Interfaces / Contracts

```typescript
// LeafletMap — extended signature
function createCategoryIcon(color: string, type: MapMarker['type']): L.DivIcon

// PageHero — removed prop
export interface PageHeroProps {
  imageUrl: string
  // imageAlt?: string  ← REMOVED
  overlayOpacity?: number
  size?: 'default' | 'compact'
  children: ReactNode
  className?: string
}
```

---

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Manual | Skip link focus, mobile nav focus trap, carousel pause | Keyboard walkthrough (Tab, Shift+Tab, Escape) |
| Manual | Contrast ratios | Browser DevTools color picker or axe-core |
| Manual | Screen reader | NVDA or VoiceOver: verify announcements for role="alert", role="status", aria-pressed, live region |
| Manual | Reduced motion | Toggle OS setting, verify no animations |
| Build | TypeScript errors from PageHero prop removal | `npm run build` — compiler catches all callers |
| Visual | No regressions | Side-by-side comparison of key pages |

---

## Migration / Rollout

No migration required. All changes are CSS class swaps, HTML attribute additions, and small JSX refactors. No database changes, no API changes, no dependency additions. Each tier commit is independently revertable via `git revert`.

---

## Commit Slices (7 commits)

### Commit 1 — Tier 1: Navigation & Interaction

**Message**: `fix(a11y): skip link, mobile nav focus trap, carousel pause+dots, dl wrapper [T1]`

**Files**:
- `src/app/(site)/layout.tsx`
- `src/components/layout/MobileNavToggle.tsx`
- `src/components/gallery/ImageCarousel.tsx`
- `src/app/(site)/gastronomia/[slug]/page.tsx`

**REQs**: A1–A10

### Commit 2 — Tier 2: Contrast

**Message**: `fix(a11y): contrast fixes across hero, footer, form inputs, badges [T2]`

**Files**:
- `src/app/(site)/page.tsx` (eyebrow only)
- `src/components/layout/Footer.tsx` (contrast classes only)
- `src/components/contact/ContactForm.tsx` (label, border, ring classes only)
- `src/components/places/PlaceCard.tsx`

**REQs**: B1–B7

### Commit 3 — Tier 3: ARIA Completeness

**Message**: `fix(a11y): aria-alert/status, aria-pressed, aria-hidden icons, skeleton roles [T3]`

**Files**:
- `src/app/(site)/error.tsx`
- `src/app/(site)/loading.tsx`
- `src/app/not-found.tsx`
- `src/components/contact/ContactForm.tsx` (role="alert" on error div, role="status" + focus on success)
- `src/components/places/CategoryNav.tsx` (aria-pressed, tabIndex, handleClick focus)
- `src/components/layout/Footer.tsx` (arrow aria-hidden, icon aria-hidden)
- `src/components/gallery/DynamicImageCarousel.tsx` (skeleton role="status")
- `src/components/map/DynamicLeafletMap.tsx` (skeleton role="status", icon aria-hidden)

**REQs**: C1–C13

### Commit 4 — Tier 4: Motion

**Message**: `fix(a11y): universal prefers-reduced-motion coverage [T4]`

**Files**:
- `src/app/globals.css`

**REQs**: D1–D2

### Commit 5 — Tier 5: Forms Completeness

**Message**: `fix(a11y): form autocomplete, aria-invalid, disclaimer order, fieldset [T5]`

**Files**:
- `src/components/contact/ContactForm.tsx`

**REQs**: E1–E4

### Commit 6 — Tier 6: Map Markers + Gastronomia Icons

**Message**: `fix(a11y): map marker shapes per category, keyboard access, icon aria [T6]`

**Files**:
- `src/components/map/LeafletMap.tsx`
- `src/components/gastronomia/DifficultyFlames.tsx`
- `src/components/gastronomia/PriceSymbols.tsx`
- `src/components/gastronomia/IngredientIcon.tsx`

**REQs**: F1–F4

### Commit 7 — Tier 7: Suggestions

**Message**: `fix(a11y): PageHero alt, hero stats dl, touch targets, inline links [T7]`

**Files**:
- `src/components/ui/PageHero.tsx`
- `src/app/(site)/page.tsx` (stats → `<dl>`)
- `src/components/places/CategoryNav.tsx` (min-h-[24px])
- PageHero callers: `cultura/page.tsx`, `contacto/page.tsx`, `servicios/[slug]/page.tsx`, `como-llegar/page.tsx`, `mapa/page.tsx`, `agenda/[slug]/page.tsx`, `agenda/page.tsx`, `lugares/[slug]/page.tsx`, `lugares/page.tsx`, `gastronomia/[slug]/page.tsx`, `gastronomia/page.tsx`

**REQs**: G1–G5

---

## Risks Mitigated

| Risk | Severity | Mitigation |
|------|----------|------------|
| Focus trap must enumerate focusable nodes at runtime | Medium | Nav contains only `<a>` and close `<button>` — query `#mobile-nav a, #mobile-nav button` gives a static, predictable set. Escape handler already exists. |
| `inert` on main/footer via DOM query | Medium | `useEffect` + `document.querySelector('main')` / `document.querySelector('footer')` — `inert` supported in all target browsers (Chrome 102+, Firefox 112+, Safari 15.5+). Cleanup on unmount removes attribute. |
| react-leaflet v5 `keyboard` prop on `<Marker>` | Medium | react-leaflet v5 passes all extra props to Leaflet marker options. `keyboard: true` is a Leaflet L.Marker option. Verified: `<Marker keyboard={true} title="...">` works. Fallback: use `ref` to call `marker.options.keyboard = true` if prop passthrough fails. |

---

## Open Questions

- [x] All questions resolved — no blockers.

---

## Patterns Reference

### sr-only + focus reveal (reusable)
```tsx
className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-cream focus:rounded focus:outline-none focus:ring-2 focus:ring-cream"
```

### Focus trap (reusable for any modal/panel)
```tsx
const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
// Query inside panel, wrap Tab/Shift+Tab at boundaries
```

### Live region (reusable for any changing content)
```tsx
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {dynamicContent}
</div>
```
