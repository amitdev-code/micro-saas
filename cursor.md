# Webeze — Project Rules

Webeze is a Next.js 14 SEO micro-platform of free online calculators and tools. Domain: `https://webeze.in`. Locale: `en_IN`. Single-source-of-truth is [lib/toolsConfig.ts](lib/toolsConfig.ts); SEO copy lives in [lib/seoContent.ts](lib/seoContent.ts).

---

## 1. Adding a new tool — checklist

When adding any new tool, update **all six** of these in order. Missing any one = broken build, missing SEO, or broken nav.

1. **Create the tool component** at `components/tools/<ToolName>.tsx` (follow section 4 rules).
2. **Register in [toolsConfig.ts](lib/toolsConfig.ts)** — append a new entry to the `tools` array. All 11 fields are required (see section 2).
3. **Register in [components/ToolRenderer.tsx](components/ToolRenderer.tsx)** — add a `dynamic(() => import('./tools/<ToolName>'), { ssr: false })` line under the matching slug.
4. **Add SEO content to [lib/seoContent.ts](lib/seoContent.ts)** — add a key matching the slug, with `h1`, `intro`, 4 `sections`, and 5 `faqs` (see section 3).
5. **Update `relatedTools` on at least 2 existing tools** to link to the new slug (internal linking — section 5).
6. **Verify** — run `npx tsc --noEmit`. The sitemap (`app/sitemap.ts`) and static params regenerate automatically from `tools`.

Never hardcode a new tool's route, metadata, or schema anywhere else. Everything flows from `toolsConfig.ts` + `seoContent.ts` → dynamic route at `app/tools/[slug]/page.tsx`.

---

## 2. SEO rules — `toolsConfig.ts` fields

Every `ToolConfig` entry must set:

| Field | Rule |
|---|---|
| `slug` | kebab-case, ends in a generic noun (`-calculator`, `-formatter`, `-counter`). Must match the primary keyword. |
| `name` | Title Case, the common name users type (e.g. `SIP Calculator`). |
| `seoTitle` | **≤ 60 chars** before `\| Webeze` is appended. Primary keyword first. No repetition (not "X — Free Online X"). Include a benefit/descriptor. |
| `seoDescription` | **145–160 chars.** Starts with the primary keyword. Includes a specific benefit + CTA words like "Instant", "No sign-up", "Free". Active voice. |
| `keywords` | **Exactly 10 entries.** Mix short-tail (`emi calculator`) + long-tail (`home loan emi calculator`, `emi calculator india`). Include at least one geo-targeted (`... india`) and one question-form (`how to calculate ...`) where natural. |
| `shortDescription` | One clean sentence, shown on homepage cards. |
| `description` | 1–2 sentences for OG/Twitter fallback (older code paths). |
| `category` | One of `Finance` / `Utility` / `Text`. |
| `icon` | **Iconify Lucide string only** (e.g. `lucide:trending-up`). Never an emoji, never an `.svg` path. |
| `relatedTools` | Array of 4–5 slugs. See section 5. |
| `fullWidth` | Optional. `true` only for tools that need editor-style layout (currently only `json-formatter`). |

The dynamic route at [app/tools/[slug]/page.tsx](app/tools/%5Bslug%5D/page.tsx) emits `FAQPage`, `BreadcrumbList`, and `WebApplication` schema automatically. **Do not duplicate schema in the tool component.**

---

## 3. `seoContent.ts` rules

Each entry must have:

- **`h1`** — must be **different from `seoTitle`** (Google penalizes duplicate title/H1). Include the primary keyword naturally.
- **`intro`** — 2–3 sentences. **Primary keyword must appear in the first 100 characters.** Don't stuff.
- **`sections`** — exactly **4 sections**. Each section is 200–400 words. Heading should be a long-tail keyword or a question (targets "People Also Ask"). Cover: (1) how it works / formula, (2) real-world example, (3) tips/best practices, (4) comparisons or limitations.
- **`faqs`** — exactly **5 FAQs**. Questions should be common searches (check Google "People Also Ask"). Answers 50–150 words, keyword-rich, no fluff.

---

## 4. Theme rules — strict monochrome

The entire platform is **pure black & white** with gray scales only. This is non-negotiable.

**Allowed colors:**
- Neutrals: `gray-50` through `gray-950`, `white`, `black`
- **Semantic only** (status, not decoration): `red-*` (errors), `green-*` (valid/success), `amber-*` (warnings/changes). Use sparingly and only where meaning depends on it (e.g. validation states, diff output).

**Banned:**
- Brand gradients (no violet, blue, purple, indigo, pink)
- Any `bg-gradient-to-*` decorative gradients (OK for subtle fades like hero bottom fade only)
- Emojis in icons, buttons, labels, or any UI chrome. Emojis in user-facing text (FAQ answers, section copy) are also banned.
- Custom tailwind brand tokens (anything outside gray / black / white / the three semantic colors above)

**Icons:**
- Use `<Icon icon="lucide:..." />` from `@iconify/react` exclusively. Never `lucide-react` components, never inline SVG for UI icons, never emojis.
- Icon size typically `w-3.5 h-3.5` (inline), `w-4 h-4` (buttons), `w-5 h-5` (headers).

**Buttons — follow the existing two variants:**
```tsx
// Primary (filled)
'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100'

// Secondary (outline)
'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white'
```

**Cards/surfaces:**
- Outer: `bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800`
- Inner muted: `bg-gray-50 dark:bg-gray-800`

**Dark mode is mandatory.** Every color class needs a `dark:` counterpart.

---

## 5. Internal linking rules

Internal linking drives both SEO authority distribution and user flow. Three layers:

1. **`relatedTools` array** in `toolsConfig.ts` — every tool links to 4–5 others. Prefer same-category first, then adjacent category. When adding a new tool, **add its slug to at least 2 existing tools'** `relatedTools` so the new page receives inbound links from day one.
2. **Homepage pills + category sections** — [app/page.tsx](app/page.tsx) auto-renders every tool from `tools`. Nothing manual needed.
3. **Breadcrumbs** — emitted automatically on tool pages (`Home › Tools › <Tool Name>`). Match the JSON-LD `BreadcrumbList` schema — if you ever change breadcrumb structure in one place, change both.

Never link to tools via raw `<a href="/tools/x">`. Always use Next.js `<Link href={...}>` for client-side nav and crawl consistency.

---

## 6. Metadata & schema — where things live

- **Site-wide metadata, `metadataBase`, `WebSite` + `Organization` JSON-LD** → [app/layout.tsx](app/layout.tsx). Only edit for true site-wide changes (brand, domain, social handles).
- **Homepage metadata** → [app/page.tsx](app/page.tsx). Uses `title: { absolute: ... }` to bypass the `%s | Webeze` template.
- **Per-tool metadata + FAQPage/Breadcrumb/WebApplication schema** → [app/tools/[slug]/page.tsx](app/tools/%5Bslug%5D/page.tsx). Driven by `toolsConfig.ts` + `seoContent.ts`. Do not edit this file when adding a new tool.
- **Sitemap** → [app/sitemap.ts](app/sitemap.ts). Auto-generated from `tools`. Finance tools get priority `0.9`, others `0.8`.
- **Robots** → [app/robots.ts](app/robots.ts).

**Canonical URL rule:** Every page must emit a self-referencing canonical. The dynamic tool route already does this via `alternates.canonical`. Don't override.

---

## 7. Layout width rule

Default tool pages render in `max-w-4xl` (readable width for calculators). Tools that need editor-scale UI (multi-pane textareas, dual-input comparisons) opt in with `fullWidth: true` in `toolsConfig.ts` — the tool area expands to `max-w-7xl` while SEO content stays at `max-w-4xl` for readability. Only use `fullWidth` when genuinely needed; default is always constrained.

---

## 8. Commit & workflow

- Don't commit unless the user asks.
- Run `npx tsc --noEmit` before claiming a task is done.
- Never add emojis to committed code. Never add decorative gradients. Never add a new color outside the palette.
