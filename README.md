# english-flash-card

## GitHub Pages deployment

This project is configured to deploy to GitHub Pages from GitHub Actions.

### One-time setup

1. Push the repository to GitHub on the `main` branch.
2. Open **Settings → Pages**.
3. In **Build and deployment**, set **Source** to **GitHub Actions**.

### Local build check

```bash
bun install --frozen-lockfile
bun run build
```

### Release flow

- Push to `main` to trigger the Pages workflow.
- Or run the workflow manually from the **Actions** tab.
- GitHub Actions builds the app and publishes `dist/` to GitHub Pages.

### Published URL

After the first successful deployment, the site will be available at:

```text
https://<your-github-username>.github.io/english-flash-card/
```
