# Proposal: Accessibility Remediation (WCAG 2.2 AA)

**Status**: complete  
**Change**: accessibility-remediation  
**Project**: tepexi-digital  
**Date**: 2026-06-27  

---

## Intent

tepexidigital.com.mx has 51 accessibility findings (7 CRITICAL, 37 WARNING, 7 SUGGESTION) from a WCAG 2.2 AA audit. This change remediates all findings across 15 files. Compliance is both a legal obligation under Mexican federal accessibility guidelines and an ethical commitment — a municipal tourism site must be usable by everyone, including visitors using screen readers, keyboard-only navigation, or reduced-motion preferences.

## Scope

### In Scope

**Tier 1 — Navigation & Interaction (CRITICAL)**
- Skip-to-content link in `layout.tsx`
- Focus trap + `aria-modal` + `inert` in `MobileNavToggle.tsx`
- Carousel pause button, `aria-pressed` dots, live region, touch targets in `ImageCarousel.tsx`
- `<dl>` wrapper in `gastronomia/[slug]/page.tsx`

**Tier 2 — Contrast (CRITICAL)**
- Hero eyebrow `text-cream/70` → `text-cream/90` in `page.tsx`
- Footer copyright/description contrast in `Footer.tsx`
- Form label, input border, focus ring contrast in `ContactForm.tsx`

**Tier 3 — ARIA Completeness**
- `role="alert"` on error states (`error.tsx`, `ContactForm.tsx`)
- `role="status"` on loading/success (`loading.tsx`, `ContactForm.tsx`)
- `aria-pressed` on `CategoryNav.tsx` buttons
- `aria-hidden="true"` on decorative icons/emojis sitewide (`Footer.tsx`, `not-found.tsx`)
- `role="application"` + `aria-label` on map wrapper (`LeafletMap.tsx`)

**Tier 4 — Motion**
- Universal `prefers-reduced-motion` rule in `globals.css`

**Tier 5 — Forms Completeness**
- `autocomplete` attributes on name/email inputs
- `aria-invalid` + `aria-describedby` per field
- Disclaimer reposition before submit button
- Required-field legend text

**Tier 6 — Map Markers**
- Distinct SVG shapes per category in `LeafletMap.tsx`
- `keyboard={true}` + `title` on `<Marker>` components

**Tier 7 — Suggestions**
- `PageHero` `imageAlt` prop removal (enforce `alt=""`)
- Update all `PageHero` callers to drop `imageAlt`
- `Button` `asChild` disabled-state fix
- Decorative timeline `aria-hidden`
- Sub-12px font size audit

### Out of Scope
- AAA compliance (target is AA only)
- Full Tab-cycling through all Leaflet markers (only Enter-to-open)
- Automated accessibility test suite (future change)
- Color-blind simulation testing beyond shape differentiation
- Content translations or language attribute changes

## Capabilities

### New Capabilities
- `accessibility-skip-nav`: Skip-to-content link and landmark structure
- `accessibility-focus-management`: Focus trap, inert, programmatic focus patterns
- `accessibility-motion`: Universal reduced-motion CSS coverage

### Modified Capabilities
None — no existing specs exist yet.

## Approach

Surgical fixes across 15 files — no new dependencies, no architectural changes. Each tier is an independent implementation slice that can be committed and reviewed separately:

1. **CSS-only fixes first** (Tiers 2, 4) — class swaps, globals.css rule
2. **Attribute additions** (Tiers 3, 5) — `role`, `aria-*`, `autocomplete` attributes
3. **Component logic** (Tiers 1, 6) — skip link, focus trap, carousel state, SVG shapes
4. **Type interface change** (Tier 7) — `PageHero` prop removal + caller cleanup

All fixes use existing Tailwind utilities and native HTML attributes. Zero new packages.

## Affected Areas

| Area | Impact | Files |
|------|--------|-------|
| Layout shell | Modified | `src/app/(site)/layout.tsx` |
| Mobile nav | Modified | `src/components/layout/MobileNavToggle.tsx` |
| Carousel | Modified | `src/components/gallery/ImageCarousel.tsx` |
| Gastronomia page | Modified | `src/app/(site)/gastronomia/[slug]/page.tsx` |
| Homepage hero | Modified | `src/app/(site)/page.tsx` |
| Footer | Modified | `src/components/layout/Footer.tsx` |
| Contact form | Modified | `src/components/contact/ContactForm.tsx` |
| Category nav | Modified | `src/components/places/CategoryNav.tsx` |
| Global CSS | Modified | `src/app/globals.css` |
| Loading state | Modified | `src/app/(site)/loading.tsx` |
| Error boundary | Modified | `src/app/(site)/error.tsx` |
| 404 page | Modified | `src/app/not-found.tsx` |
| Page hero | Modified | `src/components/ui/PageHero.tsx` |
| Place card | Modified | `src/components/places/PlaceCard.tsx` |
| Leaflet map | Modified | `src/components/map/LeafletMap.tsx` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Focus trap in MobileNavToggle must enumerate focusable nodes at runtime | Medium | Nav contains only `<a>` links — static, predictable set |
| `inert` attribute on main/footer during mobile nav — needs DOM query | Medium | Use `useEffect` + `document.querySelector`; `inert` supported in all target browsers |
| react-leaflet v5 `keyboard` prop passthrough on `<Marker>` | Medium | Verify prop reaches Leaflet core; fallback to `eventHandlers.add` if needed |
| `PageHero` `imageAlt` prop removal breaks callers | Low | TypeScript catches all sites; mechanical cleanup |
| `animate-spin` suppressed by reduced-motion CSS | Low | Use `0.01ms` duration (not `none`) to preserve `transitionend` events |

## Rollback Plan

All changes are on branch `fix/accessibility-audit-remediation`. Revert with `git revert` per-tier commit. Each tier is an independent commit — partial rollback is safe. No database migrations, no API changes, no dependency additions.

## Dependencies

- None. All fixes use existing Tailwind CSS, native HTML, and React APIs already in the project.

## Success Criteria

- [ ] All 7 CRITICAL findings resolved (skip link, focus trap, carousel controls, contrast, `<dl>` wrapper)
- [ ] All 37 WARNING findings resolved (ARIA roles, motion, forms, map markers)
- [ ] All 7 SUGGESTION findings resolved (PageHero alt, font sizes, timeline)
- [ ] Manual screen-reader walkthrough (VoiceOver or NVDA) passes without announced errors
- [ ] Keyboard-only navigation reaches all interactive elements
- [ ] `prefers-reduced-motion` disables all animations sitewide
- [ ] No TypeScript errors, build passes, no visual regressions

## Size Forecast

~350–450 lines changed across 15 files. Breakdown:
- Tiers 2 + 4 (CSS/contrast): ~30 lines
- Tier 3 (ARIA attributes): ~40 lines
- Tier 5 (forms): ~50 lines
- Tier 1 (nav/carousel/dl): ~150 lines
- Tier 6 (map markers): ~80 lines
- Tier 7 (suggestions): ~50 lines
