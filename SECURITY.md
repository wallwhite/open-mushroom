# Security

Report vulnerabilities privately through GitHub Security Advisories for `wallwhite/open-mushroom`
(Security tab → "Report a vulnerability"). Please do not open public issues for security reports.

Scope: the published `open-mushroom` npm package. The `tools/` pipeline, the lab application and all
devDependencies of this repository are not part of the package and are not shipped to consumers. In particular,
the skeleton pipeline renders SVG headlessly with paper.js on jsdom 16, a dev-only tree that never reaches the
published package; advisories against it are triaged as such.
