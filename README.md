# Juniverse

The photography-first personal site of Jun Bai, built with Gatsby and the
[Emilia theme](https://github.com/LekoArts/gatsby-themes/tree/main/themes/gatsby-theme-emilia).

## Development

Node.js 22 is recommended.

```sh
npm install
npm run develop
```

The local site runs at `http://localhost:8000`.

## Content

- Add one folder per gallery under `content/projects/`.
- Each gallery needs an `index.mdx`, a cover image, and one or more images.
- The current gallery images are temporary assets from the Emilia starter and
  are clearly labeled as previews on the website.
- Research content lives in `src/pages/research.tsx`.

## Deployment

Pushes to `redesign/emilia` build and publish the Gatsby output through GitHub
Pages. The workflow can be changed to `main` when this redesign becomes the
canonical branch.

## License

The starter is licensed under 0BSD. The Emilia theme package is MIT licensed.
