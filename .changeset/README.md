# Changesets

Every change to the published package needs a changeset: run `pnpm changeset`, pick the bump (patch, minor,
major) and describe the change for the changelog. The release workflow turns pending changesets into a
"Version Packages" pull request; merging it bumps the version, writes `CHANGELOG.md` and publishes to npm.

The lab application is private and is never versioned or published.
