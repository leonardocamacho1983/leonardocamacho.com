# Essay Template Spec

## Purpose
Define the production template for long-form essays in the current `leonardocamacho.com` stack.

This is a translation of the Figma/React implementation spec into the actual project architecture:
- Astro server-rendered pages
- Sanity as CMS
- `BaseLayout.astro` for canonical, hreflang, OG, and article metadata
- `astro-portabletext` for article body rendering

The goal is to establish a reusable editorial article template before implementing the first flagship essay.

## Current Stack Translation

### Figma/React Spec
- React page component with inline styles
- `react-router`
- bespoke `DiagramEmbed` and `EconomistIllustration`
- hardcoded essay content inside a page file

### Current Project Stack
- article route: [`src/pages/[locale]/writing/[slug].astro`](/Users/leonardocamacho/leonardocamacho.com2/src/pages/[locale]/writing/[slug].astro)
- layout: [`src/layouts/BaseLayout.astro`](/Users/leonardocamacho/leonardocamacho.com2/src/layouts/BaseLayout.astro)
- content source: Sanity `post` documents
- body renderer: `PortableText`
- SEO, canonical, hreflang, article schema already handled in the page route

## Core Decision
Do not build the first flagship essay as a one-off hardcoded page.

Build a reusable article template in the existing article route, with optional enhanced modules for:
1. hero illustration mode
2. pull quotes
3. diagrams / schemas / flows
4. closing epigraph
5. bottom subscribe CTA

This keeps the first essay special without forking the article system.

## Recommended Template Architecture

### 1. Keep the main route
Continue using:
- [`src/pages/[locale]/writing/[slug].astro`](/Users/leonardocamacho/leonardocamacho.com2/src/pages/[locale]/writing/[slug].astro)

Reason:
1. canonical and SEO are already correct there
2. translation-aware locale links are already implemented
3. analytics hooks are already present
4. all published essays remain on one URL pattern

### 2. Add a template mode to posts
Add a field to the post schema:
- `templateVariant: "standard" | "flagship"`

Recommended file to change later:
- [`sanity/schemas/documents/post.ts`](/Users/leonardocamacho/leonardocamacho.com2/sanity/schemas/documents/post.ts)

Behavior:
1. `standard`: current article rendering
2. `flagship`: new enhanced essay template described below

### 3. Add custom body blocks for structured essay content
The flagship layout requires more than plain rich text.

Extend Portable Text / block content with custom objects for:
1. `pullQuote`
2. `diagramEmbed`
3. `epigraph`
4. optionally `sectionBreak`

Recommended schema file to extend later:
- [`sanity/schemas/objects/blockContent.ts`](/Users/leonardocamacho/leonardocamacho.com2/sanity/schemas/objects/blockContent.ts)

This is better than hardcoding sections in Astro because:
1. content remains editable in Sanity
2. localized versions preserve the same structure
3. the template becomes reusable for future long-form essays

## Flagship Essay Layout

### Zone A. Reading progress bar
Use a fixed top progress bar on flagship essays only.

Implementation note:
- this requires a small client script or island
- do not convert the whole page into a React page
- add a lightweight progress script scoped to `[data-article-growth="root"]`

### Zone B. Sticky article nav
Use a fixed nav that appears after scroll threshold.

Content:
1. left: back to writing
2. center: truncated article title
3. right: share link

Implementation note:
- this can also be done with a small client script and CSS class toggles
- keep semantics in Astro, not inline React motion

### Zone C. Hero illustration
The React spec uses a custom `EconomistIllustration` component.

In current stack, the correct equivalent is:
1. add a new optional post field for `heroIllustrationMode`
2. support either:
- `coverImage`
- custom illustration asset / SVG
- fallback to current image hero

Recommended first implementation:
- support a `flagshipHeroMode` with values:
  - `image`
  - `illustration`

If `illustration` is selected:
- render a dedicated SVG or image asset full-bleed at top
- apply the cream dissolve gradient into the article body

### Zone D. Article header
The current route already renders title, kicker, excerpt, and metadata.

For flagship essays, adapt it to:
1. centered header
2. larger Playfair title
3. controlled metadata line
4. optional oxblood accent bar

This should be a variant of the existing article header, not a separate routing system.

### Zone E. Article body
For flagship essays:
1. prose column width: ~680px
2. diagrams can break out to ~920px
3. pull quotes render as distinct blocks with oxblood rule
4. epigraph at the end

Implementation note:
- this is exactly why custom Portable Text blocks are required

### Zone F. Bottom subscribe CTA
Add a reusable bottom CTA block for flagship essays.

This should not be hardcoded per article.
It should be a shared component rendered only when `templateVariant === "flagship"`.

## Design Tokens
Preserve the Figma spec tokens as the flagship article palette:

- `CREAM  = #F6F3EC`
- `INK    = #1A1710`
- `SUB    = #4a4740`
- `MUTED  = #6E6A63`
- `OX     = #6E2535`
- `BORDER = #D8D2C8`
- `CARD   = #F0EDE5`

Typography remains:
- Playfair Display
- DM Sans

Do not introduce new font families for this template.

## What Should Be Reusable vs. First-Post-Specific

### Reusable template parts
1. centered flagship header
2. progress bar
3. sticky article nav
4. prose column sizing
5. pull quote component
6. diagram block component
7. closing epigraph component
8. bottom subscribe CTA

### Specific to the first essay only
1. exact hero illustration asset
2. exact sequence of diagrams
3. exact captions
4. exact article body content

## Recommended Implementation Sequence

### Phase 1. Stabilize the template system
1. add `templateVariant` to post schema
2. add custom Portable Text blocks:
- `pullQuote`
- `diagramEmbed`
- `epigraph`
3. build reusable Astro components for those blocks
4. update `[slug].astro` to branch between `standard` and `flagship`

### Phase 2. Implement the first flagship essay
1. ingest finished `en-us` content in Sanity
2. assign `templateVariant = flagship`
3. upload hero asset and diagram assets
4. encode body structure with the new custom blocks
5. review the rendered page

### Phase 3. Localization
1. localize from the final `en-us` source
2. preserve block structure across locales
3. review diagram captions and quote fidelity before publish

## Concrete Engineering Constraints

### Do not do
1. do not create a one-off route like `/essay/on-managerial-plasticity`
2. do not move flagship essays outside `/[locale]/writing/[slug]`
3. do not hardcode the entire article body in Astro if the goal is a reusable editorial system
4. do not fork SEO or article schema logic from the existing article page

### Do instead
1. extend the post schema
2. extend the Portable Text schema
3. implement one enhanced template path inside the existing article route
4. keep Sanity as source of truth

## Practical Mapping From The Provided Spec

### Directly portable
1. token palette
2. header hierarchy
3. hero dissolve concept
4. diagram breakout widths
5. pull quote treatment
6. bottom CTA structure

### Needs adaptation
1. `motion/react` animations -> small client-side behavior in Astro
2. inline React components -> Astro partials / CSS blocks / client scripts
3. hardcoded SVG `?raw` imports -> either static imported assets or Sanity-managed SVG/image assets
4. `react-router` links -> normal anchor links in Astro

## Recommendation
The right next step is not to implement the essay itself.

The right next step is:
1. add the schema support for `flagship` essays
2. add the custom body block types
3. create the reusable flagship rendering path inside `[slug].astro`

After that, the first post becomes content work, not template work.
