/**
 * GROQ queries — Sanity's query language.
 *
 * Read a query left to right like a pipeline:
 *   *                         all documents
 *   [_type == "post" && ...]  filter (like WHERE)
 *   | order(publishedAt desc) sort  (like ORDER BY)
 *   [0...6]                   slice (like LIMIT 6)
 *   { title, ... }            projection: pick/rename fields (like SELECT)
 *
 * `"slug": slug.current` renames a nested field.
 * `categories[]->title` follows references (like a JOIN) and takes the title.
 */

// Shared projection for list views (no body → small payload).
const POST_CARD = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  "categories": categories[]->title,
  mainImage
`;

export const LATEST_POSTS_QUERY = /* groq */ `
  *[_type == "post" && defined(slug.current) && defined(publishedAt)]
  | order(publishedAt desc)[0...$limit]{ ${POST_CARD} }
`;

export const ALL_POSTS_QUERY = /* groq */ `
  *[_type == "post" && defined(slug.current) && defined(publishedAt)]
  | order(publishedAt desc){ ${POST_CARD} }
`;

export const POST_SLUGS_QUERY = /* groq */ `
  *[_type == "post" && defined(slug.current) && defined(publishedAt)].slug.current
`;

// $slug is a parameter — values are passed separately, never concatenated
// into the string. Same idea as prepared statements against SQL injection.
export const POST_BY_SLUG_QUERY = /* groq */ `
  *[_type == "post" && slug.current == $slug][0]{ ${POST_CARD}, body }
`;

/*
 * Projects (case studies). Sorted by the editor-controlled `order` field;
 * coalesce() puts projects without an order at the end instead of first.
 * "approach": approach[]{...} reshapes each array item; Sanity's own
 * `_key` is left out because the site does not need it.
 */
export const PROJECTS_QUERY = /* groq */ `
  *[_type == "project" && defined(slug.current)]
  | order(coalesce(order, 9999) asc, name asc){
    "slug": slug.current,
    name, hue, mark, featured, tags, summary,
    client, engagement, period, role, overview, challenge,
    "approach": approach[]{ title, description },
    delivered, stack, outcome,
    "links": links[]{ label, url },
    cover
  }
`;
