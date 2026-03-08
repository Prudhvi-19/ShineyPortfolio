# Shiney Portfolio

Static researcher portfolio for `Shiney Rashmitha Chandraganti`, built to stay simple, fast, and GitHub Pages friendly.

## Files

- `index.html` - page structure and render targets
- `styles.css` - layout, theme, and responsive styling
- `script.js` - loads JSON content and renders the site
- `data/site.json` - personal details, hero, about, and contact content
- `data/research.json` - research section content
- `data/publications.json` - publications and presentations
- `data/methods.json` - methods section content
- `data/timeline.json` - reverse-chronological timeline entries
- `data/mentorship.json` - mentorship and leadership content
- `CV_ShineyChandraganti.pdf` - public CV download
- `Personal Statement_Shiney Chandraganti.pdf` - source personal statement
- `Research Statement_Shiney Chandraganti.pdf` - source research statement

## Updating content

Edit the JSON files in `data/` to update the website content.

- Change biography, CTAs, and contact info in `data/site.json`
- Change research projects in `data/research.json`
- Change publications in `data/publications.json`
- Change methods in `data/methods.json`
- Change timeline entries in `data/timeline.json`
- Change mentorship content in `data/mentorship.json`

## Local preview

From the repo root:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

Because the site loads content from JSON files, opening `index.html` directly with `file://` is not recommended.

## GitHub Pages

- GitHub Pages deployment workflow: `.github/workflows/deploy-pages.yml`
- The site deploys from pushes to `main`

## Notes

- The current public download is only the CV.
- The portfolio content is based on the source PDFs currently in this repository.
- The current version is deployment-ready as a static site.
- GitHub Pages publishing can be wired up later when needed.
