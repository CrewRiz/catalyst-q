# Releasing

One tag releases all five npm packages (`catalyst-q`, `catalyst-q-advisor`, `catalyst-q-ui`, `catalyst-q-cli`,
`catalyst-q-mcp`) from `.github/workflows/release.yml`, by npm trusted publishing: no token is stored.

1. Set the same version in every `packages/*/package.json` and in the inter-package dependencies (`npm test` checks).
2. Run the IP gate on every tracked file, locally. It is never run in this public repository's Actions, because public
   logs would print what it matches:
   `git ls-files -z | grep -zv '\.png$' | xargs -0 node "$IP_GATE" --strict --files`
3. `git tag vX.Y.Z && git push origin vX.Y.Z`. The workflow checks the tag against every version, runs the type check
   and the tests, publishes in dependency order, then installs the published packages as a stranger would.

Each package's trusted publisher is set once, from a logged-in terminal:
`npm trust github <package> --file release.yml --repo CrewRiz/catalyst-q --allow-publish -y`
