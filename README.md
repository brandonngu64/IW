# Iraq War & Digital Privacy

The website source is in `sites/after-the-scan/dist/`.

## Preview while editing

From this project folder:

```powershell
node sites/after-the-scan/serve.mjs
```

Open http://127.0.0.1:4173 and refresh after saving changes. Stop the preview with Ctrl+C.

## Publish updates with GitHub Pages

The workflow in `.github/workflows/pages.yml` checks the site and publishes `sites/after-the-scan/dist/` whenever website changes are pushed to `main`.

GitHub Pages must be enabled under the repository's **Settings → Pages**, with **GitHub Actions** selected as the source. Public repositories can use Pages on GitHub Free; private repositories require a plan that supports private-repository Pages.

To publish an edit from the project folder:

```powershell
git add sites/after-the-scan/dist
git commit -m "Update website"
git push origin main
```

In the IDE, staging the changed files, committing, and choosing **Sync Changes** does the same thing. Saving a file updates the local copy; a push triggers the online deployment.

Follow deployment progress in the repository's **Actions** tab. Once deployment succeeds, Pages uses https://brandonngu64.github.io/IW/.

The workflow publishes the website folder only. Local previews, archived Git metadata, and previous hosting state are excluded by `.gitignore`.
