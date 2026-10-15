import { type APIRoute } from "astro";
import { SITE_TITLE } from "../../consts";

// Keep the old Jekyll .html URL usable on static hosts, including without JS.
export const GET: APIRoute = () =>
  new Response(
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="0;url=/research/publications/">
    <link rel="canonical" href="https://ba1jun.github.io/research/publications/">
    <meta name="robots" content="noindex">
    <title>${SITE_TITLE}</title>
  </head>
  <body>
    <p><a href="/research/publications/">Continue to publications.</a></p>
  </body>
</html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
