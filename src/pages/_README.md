# Astro Pages

### Refer to [Astro docs on Pages](https://docs.astro.build/en/basics/astro-pages/)

---

## Overview

Pages define the routes of the site. The project uses static site generation (SSG) for optimal performance and hosting flexibility.

## Page Types

### Static Pages

- **[index.astro](index.astro)**: Homepage using [Homepage.astro](../components/Homepage.astro) for layout and featured content
- **[404.astro](404.astro)**: Custom error page featuring random quotes from [burgundy.ts](../scripts/burgundy.ts)
- **[cv.astro](cv.astro)**: Resume page importing a pre-rendered HTML export from [cv-v0](https://github.com/erfianugrah/cv-v0)

### Collection Routes (Config-Driven)

All collection routes are generated from a single config array in [src/config/collections.ts](../config/collections.ts). The parameterised routes live under `src/pages/[collection]/`:

- **[index.astro]([collection]/index.astro)**: Collection index page listing all entries, driven by `ROUTE_COLLECTIONS`
- **[[...id].astro]([collection]/[...id].astro)**: Individual content pages; uses `buildDetailPaths()` from [collections.ts](../scripts/collections.ts)
- **[tags/index.astro]([collection]/tags/index.astro)**: Tag listing for a collection
- **[tags/[tag].astro]([collection]/tags/[tag].astro)**: Tag-specific pages; uses `buildTagPaths()`
- **[rss.xml.ts]([collection]/rss.xml.ts)**: RSS feed per collection; uses `generateRss()`

Adding a collection requires only one entry in `ROUTE_COLLECTIONS` -- all five route types are generated automatically.

### Dynamic Pages

The `[collection]` segment is matched by Astro's file-based routing against the collection name. For example, `/muses/some-post` hits `[collection]/[...id].astro` with `collection = "muses"` and `id = "some-post"`.

This covers all five collections: `muses`, `short_form`, `long_form`, `zeitweilig`, and `authors`. The `cv` collection has a bespoke page at `cv.astro` and is deliberately excluded from `ROUTE_COLLECTIONS`.

## Dynamic Routing

Dynamic routes are generated from content collections defined in [content.config.ts](../content.config.ts) using `getStaticPaths()`:

```astro
---
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const posts = await getCollection("short_form");
  return posts.map((post) => ({
    params: { id: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
---
```

Most of this boilerplate is handled by the shared helpers in [collections.ts](../scripts/collections.ts) - `buildDetailPaths()` and `buildTagPaths()`.

## RSS Feed Generation

Each collection directory generates an RSS feed via [collections.ts](../scripts/collections.ts)'s `generateRss()` helper:

- `/long_form/rss.xml`
- `/short_form/rss.xml`
- `/muses/rss.xml`
- `/zeitweilig/rss.xml`
- `/authors/rss.xml`

The RSS link icon in the header is conditionally shown by [rss.ts](../scripts/rss.ts) based on the current path.

## Type Safety

- **index.astro**: The collections array is declared with `as const` so TypeScript narrows its elements to literal collection names. Accumulator arrays in `reduce()` calls are explicitly typed (`CollectionEntry<…>[]`) and post-filter results use non-null assertions where the filter guarantees a value.

## Component Integration

Each page incorporates [components](../components/) and [layouts](../layouts/) to maintain consistency. Pages typically:

1. Import needed components and layouts
2. Fetch data from content collections
3. Define any page-specific logic in the frontmatter
4. Render the appropriate layout with relevant content
