#!/usr/bin/env node
/**
 * seed-sha-map.mjs — Build .git/github-sha-map.json by matching local commits
 * to remote commits by message + date proximity.
 *
 * Run once to bootstrap the SHA map so github-push.mjs only pushes the delta
 * instead of replaying the entire history from scratch.
 */

import { ReplitConnectors } from "@replit/connectors-sdk";
import { execSync } from "child_process";
import { writeFileSync, readFileSync, existsSync } from "fs";

const connectors = new ReplitConnectors();
const OWNER    = "elgunit";
const REPO     = "StartAppsStudio";
const SHA_MAP  = ".git/github-sha-map.json";

async function apiGet(path) {
  const resp = await connectors.proxy("github", path);
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`GET ${path} → ${resp.status}: ${body}`);
  }
  return resp.json();
}

// ---------------------------------------------------------------------------
// Fetch all remote commits (paginated)
// ---------------------------------------------------------------------------
async function fetchAllRemoteCommits() {
  const commits = [];
  let page = 1;
  while (true) {
    const batch = await apiGet(`/repos/${OWNER}/${REPO}/commits?per_page=100&page=${page}`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    for (const c of batch) {
      commits.push({
        sha:  c.sha,
        msg:  c.commit?.message?.split("\n")[0] ?? "",
        date: new Date(c.commit?.author?.date ?? 0).getTime(),
      });
    }
    console.log(`  Fetched page ${page}: ${commits.length} commits so far…`);
    if (batch.length < 100) break;
    page++;
  }
  return commits;
}

// ---------------------------------------------------------------------------
// Read local commits
// ---------------------------------------------------------------------------
function readLocalCommits() {
  const out = execSync('git log --format="%H|%s|%aI"', {
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  }).trim();
  return out.split("\n").filter(Boolean).map((line) => {
    const firstPipe = line.indexOf("|");
    const lastPipe  = line.lastIndexOf("|");
    return {
      sha:  line.slice(0, firstPipe),
      msg:  line.slice(firstPipe + 1, lastPipe),
      date: new Date(line.slice(lastPipe + 1)).getTime(),
    };
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("Reading local commits…");
  const localCommits = readLocalCommits();
  console.log(`  ${localCommits.length} local commits.`);

  console.log("Fetching remote commits from GitHub…");
  const remoteCommits = await fetchAllRemoteCommits();
  console.log(`  ${remoteCommits.length} remote commits.`);

  // Load existing map so we don't overwrite manually-added entries
  let shaMap = {};
  if (existsSync(SHA_MAP)) {
    try { shaMap = JSON.parse(readFileSync(SHA_MAP, "utf8")); } catch { /* start fresh */ }
  }

  // Index remote commits by message for fast lookup
  const remoteByMsg = new Map();
  for (const rc of remoteCommits) {
    if (!remoteByMsg.has(rc.msg)) remoteByMsg.set(rc.msg, []);
    remoteByMsg.get(rc.msg).push(rc);
  }

  let matched = 0, skipped = 0, already = 0;
  const TWO_HOURS = 2 * 60 * 60 * 1000;

  for (const lc of localCommits) {
    if (shaMap[lc.sha]) { already++; continue; } // already mapped

    const candidates = remoteByMsg.get(lc.msg) ?? [];
    if (candidates.length === 0) { skipped++; continue; }

    // Pick the remote commit with the closest author date
    let best = candidates[0];
    let bestDiff = Math.abs(candidates[0].date - lc.date);
    for (const c of candidates.slice(1)) {
      const diff = Math.abs(c.date - lc.date);
      if (diff < bestDiff) { best = c; bestDiff = diff; }
    }

    // Reject if the closest candidate is more than 2 hours away
    // (avoids false matches on repeated generic messages like "Published your App")
    if (bestDiff > TWO_HOURS) { skipped++; continue; }

    shaMap[lc.sha] = best.sha;
    matched++;
  }

  writeFileSync(SHA_MAP, JSON.stringify(shaMap, null, 2) + "\n", "utf8");

  console.log(`\nResults:`);
  console.log(`  Already mapped : ${already}`);
  console.log(`  Newly matched  : ${matched}`);
  console.log(`  Could not match: ${skipped}`);
  console.log(`  Total in map   : ${Object.keys(shaMap).length}`);
  console.log(`\nSHA map saved to ${SHA_MAP}`);

  // Report how many local commits still need to be pushed
  const localHead = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  const localShas = localCommits.map((c) => c.sha);
  const notMapped = [];
  for (const sha of localShas) {
    if (!shaMap[sha]) notMapped.push(sha);
    else break; // once we hit a mapped commit, everything older is mapped too
  }
  if (notMapped.length > 0) {
    console.log(`\n${notMapped.length} local commit(s) not yet on GitHub — run push-to-github.sh to sync.`);
  } else {
    console.log("\nAll local commits are already mapped to GitHub. Remote may just need a ref update.");
  }
}

main().catch((err) => {
  console.error(`\nError: ${err.message}`);
  process.exit(1);
});
