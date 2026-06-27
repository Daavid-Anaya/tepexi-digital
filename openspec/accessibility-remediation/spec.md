# Accessibility Remediation — Specification

**Status**: complete  
**Change**: accessibility-remediation  
**Project**: tepexi-digital  
**Date**: 2026-06-27  
**Standard**: WCAG 2.2 AA  

---

## Purpose

Define testable requirements for all 51 accessibility findings across 7 tiers.  
These are **new** requirements — no prior accessibility specs exist.

---

## Tier 1 — Navigation & Interaction (CRITICAL)

| ID | Requirement | Strength |
|----|-------------|----------|
| REQ-A1 | Skip nav link is first focusable element, visible on focus, targets `#main-content` | MUST |
| REQ-A2 | `<main>` has `id="main-content"` and `tabIndex={-1}` | MUST |
| REQ-A3 | Mobile nav panel has `role="dialog"`, `aria-modal="true"`, `aria-label="Menú de navegación"` | MUST |
| REQ-A4 | Mobile nav open → focus moves to first nav link; close → focus returns to toggle button | MUST |
| REQ-A5 | Background content (`<main>` + `<footer>`) has `inert` while mobile nav is open | MUST |
| REQ-A6 | Carousel has always-visible pause/play button with `aria-pressed` reflecting paused state | MUST |
| REQ-A7 | Carousel wrapper pauses autoplay on `onFocus`, resumes on `onBlur` | MUST |
| REQ-A8 | Carousel dots have `aria-pressed={index === activeIndex}` and touch target ≥ 24×24 px | MUST |
| REQ-A9 | Carousel has `sr-only aria-live="polite"` region announcing "Imagen X de N" | MUST |
| REQ-A10 | Gastronomia sidebar uses `<dl><dt><dd>` for all dish metadata fields | MUST |

#### Scenario: REQ-A1 — Skip link appears on focus

- GIVEN a keyboard user Tab-presses from the browser address bar
- WHEN focus enters the page for the first time
- THEN a visible "Saltar al contenido" link is the first focused element
- AND clicking it moves focus to `#main-content`

#### Scenario: REQ-A2 — Main landmark is reachable programmatically

- GIVEN the skip link is activated
- WHEN the browser follows `href="#main-content"`
- THEN `<main id="main-content">` receives focus without a visible focus ring (tabIndex={-1})

#### Scenario: REQ-A3 — Mobile nav panel announces as dialog

- GIVEN a screen reader user opens the mobile nav
- WHEN the panel renders
- THEN the AT announces "Menú de navegación, dialog"

#### Scenario: REQ-A4 — Focus moves on mobile nav open/close

- GIVEN the mobile nav is closed and focus is on the toggle button
- WHEN the user activates the toggle
- THEN focus moves to the first link inside the nav panel
- AND when the user closes the nav, focus returns to the toggle button

#### Scenario: REQ-A5 — Background content inert while mobile nav is open

- GIVEN the mobile nav is open
- WHEN a keyboard user presses Tab repeatedly
- THEN focus cycles only within the nav panel and never reaches `<main>` or `<footer>`

#### Scenario: REQ-A6 — Pause/play button always visible

- GIVEN the carousel is autoplaying
- WHEN a keyboard user navigates to the carousel
- THEN a pause button is visible and focusable at all times (not only on hover)
- AND `aria-pressed="true"` when paused, `aria-pressed="false"` when playing

#### Scenario: REQ-A7 — Keyboard focus pauses carousel

- GIVEN the carousel is autoplaying
- WHEN any element inside the carousel wrapper receives focus
- THEN autoplay pauses
- AND when focus leaves the carousel wrapper, autoplay resumes

#### Scenario: REQ-A8 — Carousel dots are accessible toggles

- GIVEN a keyboard user navigates carousel dot buttons
- WHEN inspecting each dot
- THEN each has `aria-pressed="true"` for the active slide, `aria-pressed="false"` otherwise
- AND each dot's tap/click target is at least 24×24 px

#### Scenario: REQ-A9 — Live region announces slide changes

- GIVEN a screen reader user is on the carousel
- WHEN the active slide changes (auto or manual)
- THEN the AT announces "Imagen 2 de 5" (politely, without interrupting)

#### Scenario: REQ-A10 — Dish metadata uses definition list

- GIVEN a screen reader user navigates the gastronomia detail sidebar
- WHEN reaching the "Ficha del platillo" section
- THEN the AT exposes a definition list with term/definition pairs (Dificultad, Preparación, etc.)

---

## Tier 2 — Contrast (CRITICAL)

| ID | Requirement | Threshold |
|----|-------------|-----------|
| REQ-B1 | Hero eyebrow contrast ≥ 4.5:1 (`text-cream/90` on `bg-primary-900`) | WCAG 1.4.3 |
| REQ-B2 | Footer copyright contrast ≥ 4.5:1 (`text-cream/60` minimum) | WCAG 1.4.3 |
| REQ-B3 | Footer description contrast ≥ 4.5:1 (`text-cream/80` minimum) | WCAG 1.4.3 |
| REQ-B4 | Contact form labels contrast ≥ 4.5:1 (`text-stone` full opacity) | WCAG 1.4.3 |
| REQ-B5 | PlaceCard badge contrast ≥ 4.5:1 (`text-primary-dark`) | WCAG 1.4.3 |
| REQ-B6 | Form input borders contrast ≥ 3:1 against background (`border-stone/50`) | WCAG 1.4.11 |
| REQ-B7 | Form focus rings clearly visible (`focus:ring-2 focus:ring-primary focus:ring-offset-1`) | WCAG 1.4.11 |

#### Scenario: REQ-B1 — Hero eyebrow passes contrast check

- GIVEN the homepage is rendered
- WHEN a contrast analyser measures the eyebrow `<p>` text against its background
- THEN the ratio is ≥ 4.5:1

#### Scenario: REQ-B2 — Footer copyright passes contrast check

- GIVEN the footer is rendered
- WHEN measuring copyright text against `bg-primary-800`
- THEN the ratio is ≥ 4.5:1

#### Scenario: REQ-B3 — Footer description passes contrast check

- GIVEN the footer is rendered
- WHEN measuring the description `text-sm` against `bg-primary-800`
- THEN the ratio is ≥ 4.5:1

#### Scenario: REQ-B4 — Form labels pass contrast check

- GIVEN the contact form is rendered on a white background
- WHEN measuring label text contrast
- THEN the ratio is ≥ 4.5:1

#### Scenario: REQ-B5 — PlaceCard badge passes contrast check

- GIVEN a PlaceCard is rendered
- WHEN measuring badge text (`text-xs`) against `bg-cream/90`
- THEN the ratio is ≥ 4.5:1

#### Scenario: REQ-B6 — Input borders meet UI component threshold

- GIVEN the contact form is rendered
- WHEN measuring input border color against the white form background
- THEN the ratio is ≥ 3:1 (WCAG 1.4.11)

#### Scenario: REQ-B7 — Focus ring is visible on form inputs

- GIVEN a keyboard user focuses any form input
- WHEN the input receives focus
- THEN a 2px ring with offset is clearly visible against the background

---

## Tier 3 — ARIA Completeness

| ID | Requirement | Strength |
|----|-------------|----------|
| REQ-C1 | `error.tsx` outer `<div>` has `role="alert"` | MUST |
| REQ-C2 | `loading.tsx` outer `<div>` has `role="status"` | MUST |
| REQ-C3 | `not-found.tsx` exports metadata `title: "Página no encontrada — Tepexi Digital"` | MUST |
| REQ-C4 | ContactForm error div has `role="alert"`; success heading receives programmatic focus | MUST |
| REQ-C5 | CategoryNav buttons have `aria-pressed={isActive}` | MUST |
| REQ-C6 | CategoryNav scroll container has `tabIndex={0}` and `aria-label` | SHOULD |
| REQ-C7 | CategoryNav `handleClick` moves focus to target section (`tabIndex={-1}` + `el.focus()`) | SHOULD |
| REQ-C8 | Footer hover arrow `→` has `aria-hidden="true"` | MUST |
| REQ-C9 | All decorative Lucide icons sitewide have `aria-hidden="true"` | MUST |
| REQ-C10 | Emojis (💡, 📅) have `aria-hidden="true"` and adjacent `sr-only` text | MUST |
| REQ-C11 | LeafletMap wrapped in `<div role="application" aria-label="Mapa interactivo de Tepexi de Rodríguez">` | MUST |
| REQ-C12 | Map skeleton and Carousel skeleton have `role="status"` | MUST |
| REQ-C13 | `not-found.tsx` decorative icons (Compass, Home) have `aria-hidden="true"` | MUST |

#### Scenario: REQ-C1 — Error page announces immediately

- GIVEN a runtime error triggers the error boundary
- WHEN the error page renders
- THEN screen readers announce the error content assertively via `role="alert"`

#### Scenario: REQ-C2 — Loading page announces as status

- GIVEN a page is loading
- WHEN `loading.tsx` renders
- THEN the AT announces "Cargando..." via `role="status"`

#### Scenario: REQ-C3 — 404 page has descriptive browser tab title

- GIVEN a user navigates to a non-existent URL
- WHEN the browser tab is checked
- THEN the title reads "Página no encontrada — Tepexi Digital"

#### Scenario: REQ-C4 — Contact form error and success are announced

- GIVEN the contact form submission fails
- WHEN the error div renders
- THEN the AT immediately announces the error via `role="alert"`
- AND on success, focus moves to the confirmation heading (`<h3>`)

#### Scenario: REQ-C5 — CategoryNav toggle state is communicated

- GIVEN a screen reader user navigates category filter buttons
- WHEN a button is active (current filter)
- THEN the AT announces it as "pressed" via `aria-pressed="true"`

#### Scenario: REQ-C6 — CategoryNav scroll container is keyboard accessible

- GIVEN a keyboard user reaches the category filter bar
- WHEN pressing Tab
- THEN the scroll container is focusable and labelled for AT users

#### Scenario: REQ-C7 — CategoryNav click moves focus to section

- GIVEN a keyboard user activates a category button
- WHEN `handleClick` executes
- THEN the viewport scrolls to the target section AND focus moves to that section element

#### Scenario: REQ-C8 — Footer decorative arrow is hidden from AT

- GIVEN a screen reader user navigates footer links
- WHEN hovering/focusing a footer nav link
- THEN the `→` character is not announced by the AT

#### Scenario: REQ-C9 — Decorative icons hidden sitewide

- GIVEN any page containing Lucide icons used decoratively
- WHEN auditing with axe-core
- THEN no "image-alt" violations are reported for icon SVGs

#### Scenario: REQ-C10 — Emojis have text alternatives

- GIVEN a screen reader navigates a page with emoji characters
- WHEN reaching 💡 or 📅
- THEN the AT announces the adjacent sr-only text alternative, not the emoji Unicode name

#### Scenario: REQ-C11 — Map announces as interactive application

- GIVEN a screen reader user reaches the map section
- WHEN focus enters the map
- THEN the AT announces "Mapa interactivo de Tepexi de Rodríguez, application"

#### Scenario: REQ-C12 — Skeletons announce loading state

- GIVEN a carousel or map is loading (Suspense boundary)
- WHEN the skeleton renders
- THEN `role="status"` is present so the AT can communicate "loading" state

#### Scenario: REQ-C13 — 404 decorative icons are hidden

- GIVEN a user lands on the 404 page
- WHEN a screen reader navigates the content
- THEN Compass and Home icons are not announced by the AT

---

## Tier 4 — Motion

| ID | Requirement | Strength |
|----|-------------|----------|
| REQ-D1 | `@media (prefers-reduced-motion: reduce)` targets `*, *::before, *::after` with `animation-duration: 0.01ms`, `transition-duration: 0.01ms`, `scroll-behavior: auto` | MUST |
| REQ-D2 | Tailwind `animate-bounce`, `animate-spin`, and all `transition-*` utilities are suppressed when reduced-motion is active | MUST |

#### Scenario: REQ-D1 — Universal reduced-motion rule fires

- GIVEN a user has enabled "Reduce Motion" in their OS settings
- WHEN any page of the site loads
- THEN all CSS animations and transitions complete in ≤ 0.01 ms (effectively instant)
- AND scroll behavior is not smooth

#### Scenario: REQ-D2 — Tailwind animation utilities are suppressed

- GIVEN a user has enabled "Reduce Motion"
- WHEN the page contains elements with `animate-spin` or `animate-bounce` classes
- THEN those elements do not visibly spin or bounce

---

## Tier 5 — Forms Completeness

| ID | Requirement | Strength |
|----|-------------|----------|
| REQ-E1 | Name input has `autocomplete="name"`; email input has `autocomplete="email"` | MUST |
| REQ-E2 | Inputs with validation errors have `aria-invalid="true"` and `aria-describedby` pointing to error message `id` | MUST |
| REQ-E3 | Privacy disclaimer appears before the submit button in DOM order | MUST |
| REQ-E4 | Form has a visible legend or fieldset indicating required fields | SHOULD |

#### Scenario: REQ-E1 — Autocomplete attributes present

- GIVEN a user opens the contact form
- WHEN inspecting input attributes in DevTools
- THEN the name field has `autocomplete="name"` and email has `autocomplete="email"`

#### Scenario: REQ-E2 — Field errors linked to inputs

- GIVEN a user submits the contact form with an empty required field
- WHEN the error appears
- THEN the associated input has `aria-invalid="true"` and `aria-describedby` pointing to the error message element's `id`

#### Scenario: REQ-E3 — Disclaimer precedes submit in DOM

- GIVEN a developer inspects the contact form DOM
- WHEN traversing the form in source order
- THEN the privacy disclaimer `<p>` node appears before the `<SubmitButton>` node

#### Scenario: REQ-E4 — Required fields are communicated

- GIVEN a screen reader user navigates the contact form
- WHEN entering the form
- THEN the AT announces or the visible UI indicates which fields are required

---

## Tier 6 — Map Markers

| ID | Requirement | Strength |
|----|-------------|----------|
| REQ-F1 | Each category uses a visually distinct SVG marker shape: ≥ 4 distinct shapes (circle, square, triangle, diamond) | MUST |
| REQ-F2 | Markers have `keyboard={true}` and `title` attribute with location name | MUST |
| REQ-F3 | `IngredientIcon`, `DifficultyFlames` icons have `aria-hidden="true"` | MUST |
| REQ-F4 | `PriceSymbols` has `role="img"` and `aria-label="Rango de precio: X de 3"` | MUST |

#### Scenario: REQ-F1 — Map markers are distinguishable without color

- GIVEN a user with color blindness views the map
- WHEN inspecting markers for different categories
- THEN at least 4 distinct geometric shapes are used (not just different colors)

#### Scenario: REQ-F2 — Markers are keyboard operable

- GIVEN a keyboard user navigates to a map marker
- WHEN pressing Enter on a focused marker
- THEN the popup opens
- AND the marker has a `title` attribute with the location name visible as a tooltip

#### Scenario: REQ-F3 — Decorative map icons hidden from AT

- GIVEN a screen reader user is in the map detail popup
- WHEN reviewing ingredient or difficulty content
- THEN `IngredientIcon` and `DifficultyFlames` icons are not announced

#### Scenario: REQ-F4 — Price symbol is labelled for AT

- GIVEN a screen reader user reads a price range indicator
- WHEN the AT encounters `PriceSymbols`
- THEN it announces "Rango de precio: 2 de 3" (or equivalent for the value)

---

## Tier 7 — Suggestions

| ID | Requirement | Strength |
|----|-------------|----------|
| REQ-G1 | `PageHero` removes `imageAlt` prop; `<Image>` always renders with `alt=""` | SHOULD |
| REQ-G2 | Hero stats section uses `<dl><dt><dd>` semantic structure | SHOULD |
| REQ-G3 | Decorative timeline elements have `aria-hidden="true"` | SHOULD |
| REQ-G4 | CategoryNav mobile touch targets have `min-h-[24px]` (WCAG 2.5.8) | SHOULD |
| REQ-G5 | Inline links in contact page have `underline underline-offset-4` | SHOULD |

#### Scenario: REQ-G1 — PageHero background image is decorative

- GIVEN any page using `<PageHero>`
- WHEN inspecting the rendered `<img>` element
- THEN `alt=""` is always present regardless of caller-passed props

#### Scenario: REQ-G2 — Hero stats use definition list

- GIVEN a screen reader user navigates the homepage hero stats block
- WHEN the AT reaches the stats
- THEN it announces a definition list structure (e.g., "50, places, term, definition")

#### Scenario: REQ-G3 — Decorative timeline elements are hidden

- GIVEN a screen reader navigates a page with a decorative timeline
- WHEN encountering timeline connector lines or decorative dots
- THEN those elements are not announced by the AT

#### Scenario: REQ-G4 — CategoryNav mobile touch targets meet minimum

- GIVEN a mobile user taps a category filter button
- WHEN measuring the rendered button height in DevTools mobile view
- THEN the minimum tappable height is ≥ 24 px

#### Scenario: REQ-G5 — Contact page inline links are visually distinct

- GIVEN a user views the contact page
- WHEN reading paragraph text containing inline links
- THEN links are underlined with visible offset (not relying on color alone)

---

## Requirements Summary

| Tier | Name | REQs | Scenarios |
|------|------|------|-----------|
| 1 | Navigation & Interaction | A1–A10 | 10 |
| 2 | Contrast | B1–B7 | 7 |
| 3 | ARIA Completeness | C1–C13 | 13 |
| 4 | Motion | D1–D2 | 2 |
| 5 | Forms Completeness | E1–E4 | 4 |
| 6 | Map Markers | F1–F4 | 4 |
| 7 | Suggestions | G1–G5 | 5 |
| **Total** | | **45** | **45** |

---

## Coverage

- **Happy paths**: ✅ All 45 requirements have a passing scenario
- **Edge cases**: ✅ Focus restore (REQ-A4), Tab cycling (REQ-A5), keyboard-only nav (REQ-A7), emoji AT announcement (REQ-C10)
- **Error states**: ✅ Form errors (REQ-C4, REQ-E2), error boundary (REQ-C1), 404 metadata (REQ-C3)

---

## Next Recommended Phase

**sdd-design** — map each requirement to specific file changes, implementation patterns, and commit slices.
