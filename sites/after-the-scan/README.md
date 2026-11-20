# How the Iraq War Affected Digital Privacy Rights

A responsive class project on the Iraq War, post-9/11 surveillance laws, and digital privacy. Covers the PATRIOT Act, telephone metadata, foreign-intelligence surveillance, and military biometrics. Written for the supplied Jordan persona.

## Open locally

No build or installation is required. Open `dist/index.html` directly in your browser, or use the local web server below. All page assets and interactions work locally; external source links need an internet connection.

For a local web server, run `node serve.mjs` from this directory, then visit `http://127.0.0.1:4173`. Stop the server with Ctrl+C.

Edit `dist/index.html`, `dist/styles.css`, `dist/app.js`, and `dist/methods.html` directly. The repository's GitHub Pages workflow publishes this `dist/` folder on pushes to `main`; see the project-root README for setup and update commands.

## Class preparation

Read `PROJECT_GUIDE.md` for a three-minute presentation outline, a suggested work plan, source checks, and AI audit notes. The assignment requires at least three hours of project work and a moderate level of human involvement. The student’s actual work log and final REAL rating remain to be documented.

`SOURCE_AUDIT.md` records the November 19, 2026 source verification, corrections, evidence locations, and access limitations. The website uses APA 7 author–date citations and an alphabetical reference list, with printed-page or statutory-section locators.

## Verification

`node check.mjs` checks local HTML links/assets, APA citations against all eleven references (including interactive content), image alternatives, and privacy constraints. With the preview running, `node check.mjs --browser` also exercises controls and keyboard navigation in local Chrome, checks three viewport sizes, and saves screenshots in ignored `.qa/`. Set `CHROME_PATH` if Chrome is installed elsewhere.
