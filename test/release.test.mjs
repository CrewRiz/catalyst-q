// The npm release runs from GitHub Actions in CrewRiz/catalyst-q with trusted publishing (OIDC, no stored token).
// npm checks the package's repository field against the workflow's repository, case-sensitively, so every package
// names the same repository, and one tag releases one version of all of them.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const REPO = "git+https://github.com/CrewRiz/catalyst-q.git";
const DIRS = ["sdk", "advisor", "ui", "cli", "mcp"];
const pkg = (d) => JSON.parse(readFileSync(new URL(`../packages/${d}/package.json`, import.meta.url), "utf8"));
const workflow = readFileSync(new URL("../.github/workflows/release.yml", import.meta.url), "utf8");

test("every published package names CrewRiz/catalyst-q as its repository, with its own directory", () => {
	for (const d of DIRS) {
		const p = pkg(d);
		assert.equal(p.repository?.url, REPO, d);
		assert.equal(p.repository?.directory, `packages/${d}`, d);
	}
});

test("all packages share one version, and inter-package dependencies pin that version", () => {
	const v = pkg("sdk").version;
	const names = new Set(DIRS.map((d) => pkg(d).name));
	for (const d of DIRS) {
		const p = pkg(d);
		assert.equal(p.version, v, d);
		for (const [dep, range] of Object.entries(p.dependencies || {})) if (names.has(dep)) assert.equal(range, v, `${d} -> ${dep}`);
	}
});

test("the release workflow publishes by OIDC on a version tag, after the tests, dependencies first", () => {
	assert.match(workflow, /tags:\s*\[?\s*["']v\[0-9\]/);
	assert.match(workflow, /id-token:\s*write/);
	assert.doesNotMatch(workflow, /NPM_TOKEN|NODE_AUTH_TOKEN/);
	assert.match(workflow, /npm test/);
	const order = ["catalyst-q", "catalyst-q-advisor", "catalyst-q-ui", "catalyst-q-cli", "catalyst-q-mcp"];
	const line = workflow.match(/for w in ([^;]+);/)?.[1].trim().split(/\s+/);
	assert.deepEqual(line, order);
	const tag = workflow.indexOf("tag must match"), pub = workflow.indexOf("npm publish");
	assert.ok(tag > 0 && pub > tag);
});
