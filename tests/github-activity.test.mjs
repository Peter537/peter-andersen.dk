import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { buildSite } from "../scripts/build-site.mjs";
import {
  buildSnapshot,
  getContributionWindow,
  mapContributionLevel,
  updateGithubActivity,
  validateSnapshot,
  writeSnapshotAtomically,
} from "../scripts/update-github-activity.mjs";

const DAY_IN_MILLISECONDS = 86400000;
const LEVELS = [
  "NONE",
  "FIRST_QUARTILE",
  "SECOND_QUARTILE",
  "THIRD_QUARTILE",
  "FOURTH_QUARTILE",
];
const COUNTS = [0, 1, 2, 4, 8];

function dateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function firstDayOfWeek(date) {
  const firstDay = new Date(date);
  firstDay.setUTCDate(firstDay.getUTCDate() - firstDay.getUTCDay());
  return dateOnly(firstDay);
}

function createGraphqlResponse({
  from = "2024-01-01",
  to = "2024-12-31",
} = {}) {
  const fromDate = new Date(from + "T00:00:00Z");
  const toDate = new Date(to + "T00:00:00Z");
  const weeks = [];
  let currentWeek = null;
  let totalContributions = 0;
  let index = 0;

  for (
    let timestamp = fromDate.getTime();
    timestamp <= toDate.getTime();
    timestamp += DAY_IN_MILLISECONDS
  ) {
    const date = new Date(timestamp);
    const firstDay = firstDayOfWeek(date);
    if (!currentWeek || currentWeek.firstDay !== firstDay) {
      currentWeek = { firstDay, contributionDays: [] };
      weeks.push(currentWeek);
    }

    const patternIndex = index % LEVELS.length;
    const contributionCount = COUNTS[patternIndex];
    currentWeek.contributionDays.push({
      contributionCount,
      contributionLevel: LEVELS[patternIndex],
      date: dateOnly(date),
    });
    totalContributions += contributionCount;
    index += 1;
  }

  return {
    data: {
      user: {
        contributionsCollection: {
          contributionCalendar: {
            totalContributions,
            weeks,
          },
        },
      },
    },
  };
}

function createSnapshot() {
  return buildSnapshot(createGraphqlResponse(), {
    username: "Peter537",
    generatedAt: "2025-01-01T00:00:00.000Z",
  });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("maps every GitHub contribution level and rejects unknown levels", () => {
  assert.deepEqual(LEVELS.map(mapContributionLevel), [0, 1, 2, 3, 4]);
  assert.throws(
    () => mapContributionLevel("FIFTH_QUARTILE"),
    /Unknown contribution level/,
  );
});

test("maps GraphQL data into the public snapshot schema", () => {
  const snapshot = createSnapshot();
  const days = snapshot.weeks.flatMap((week) => week.days);

  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.username, "Peter537");
  assert.equal(snapshot.profileUrl, "https://github.com/Peter537");
  assert.equal(snapshot.period.from, "2024-01-01");
  assert.equal(snapshot.period.to, "2024-12-31");
  assert.equal(days.length, 366);
  assert.deepEqual(
    days.slice(0, 5).map((day) => day.level),
    [0, 1, 2, 3, 4],
  );
  assert.equal(
    snapshot.totalContributions,
    days.reduce((total, day) => total + day.count, 0),
  );
  assert.equal("contributionDays" in snapshot.weeks[0], false);
});

test("handles leap-year and UTC contribution-window boundaries", () => {
  const snapshot = createSnapshot();
  assert.equal(validateSnapshot(snapshot), snapshot);

  const partialWeek = clone(snapshot);
  partialWeek.weeks[0].firstDay = partialWeek.weeks[0].days[0].date;
  assert.equal(validateSnapshot(partialWeek), partialWeek);

  assert.deepEqual(
    getContributionWindow(new Date("2024-02-29T23:45:00Z")),
    {
      from: "2023-03-01T23:45:00.000Z",
      to: "2024-02-29T23:45:00.000Z",
    },
  );
  assert.deepEqual(
    getContributionWindow(new Date("2025-01-01T00:00:00Z")),
    {
      from: "2024-01-02T00:00:00.000Z",
      to: "2025-01-01T00:00:00.000Z",
    },
  );
});

test("rejects duplicate, invalid, and out-of-order dates", () => {
  const duplicate = clone(createSnapshot());
  duplicate.weeks[0].days[1].date = duplicate.weeks[0].days[0].date;
  assert.throws(() => validateSnapshot(duplicate), /Duplicate date/);

  const invalid = clone(createSnapshot());
  invalid.weeks[8].days[0].date = "2024-02-30";
  assert.throws(() => validateSnapshot(invalid), /real calendar date/);

  const invalidTimestamp = clone(createSnapshot());
  invalidTimestamp.generatedAt = "2025-02-29T04:17:00Z";
  assert.throws(() => validateSnapshot(invalidTimestamp), /RFC3339/);

  const outOfOrder = clone(createSnapshot());
  const firstDay = outOfOrder.weeks[12].days[0];
  outOfOrder.weeks[12].days[0] = outOfOrder.weeks[12].days[1];
  outOfOrder.weeks[12].days[1] = firstDay;
  assert.throws(() => validateSnapshot(outOfOrder), /chronological/);
});

test("rejects inconsistent totals and unknown GraphQL levels", () => {
  const inconsistent = clone(createSnapshot());
  inconsistent.totalContributions += 1;
  assert.throws(() => validateSnapshot(inconsistent), /sum of daily/);

  const response = createGraphqlResponse();
  response.data.user.contributionsCollection.contributionCalendar.weeks[
    10
  ].contributionDays[2].contributionLevel = "UNKNOWN";
  assert.throws(() => buildSnapshot(response), /Unknown contribution level/);
});

test("rejects malformed GraphQL responses", () => {
  assert.throws(
    () => buildSnapshot({ data: { user: null } }),
    /malformed contribution calendar/,
  );
  assert.throws(
    () =>
      buildSnapshot({
        data: {
          user: {
            contributionsCollection: {
              contributionCalendar: {
                totalContributions: 0,
                weeks: [],
              },
            },
          },
        },
      }),
    /empty contribution calendar/,
  );
});

test("atomically replaces a valid snapshot", async () => {
  const directory = await mkdtemp(join(tmpdir(), "github-activity-test-"));
  const outputPath = join(directory, "github-activity.json");

  try {
    await writeFile(outputPath, "older snapshot\n", "utf8");
    const snapshot = createSnapshot();
    await writeSnapshotAtomically(outputPath, snapshot);

    assert.deepEqual(JSON.parse(await readFile(outputPath, "utf8")), snapshot);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("queries the requested UTC window and writes only validated fields", async () => {
  const directory = await mkdtemp(join(tmpdir(), "github-activity-test-"));
  const outputPath = join(directory, "github-activity.json");
  const responseBody = createGraphqlResponse({
    from: "2024-01-02",
    to: "2025-01-01",
  });
  let request;

  try {
    const snapshot = await updateGithubActivity({
      token: "test-token",
      outputPath,
      now: new Date("2025-01-01T12:00:00Z"),
      fetchImpl: async (url, options) => {
        request = { url, options };
        return {
          ok: true,
          status: 200,
          json: async () => responseBody,
        };
      },
    });

    const requestBody = JSON.parse(request.options.body);
    assert.equal(request.url, "https://api.github.com/graphql");
    assert.deepEqual(requestBody.variables, {
      login: "Peter537",
      from: "2024-01-02T12:00:00.000Z",
      to: "2025-01-01T12:00:00.000Z",
    });
    assert.match(requestBody.query, /contributionCalendar/);
    assert.deepEqual(JSON.parse(await readFile(outputPath, "utf8")), snapshot);
    assert.deepEqual(Object.keys(snapshot.weeks[0].days[0]).sort(), [
      "count",
      "date",
      "level",
    ]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("preserves the prior snapshot when an update fails validation", async () => {
  const directory = await mkdtemp(join(tmpdir(), "github-activity-test-"));
  const outputPath = join(directory, "github-activity.json");
  const priorContents = JSON.stringify(createSnapshot()) + "\n";

  try {
    await writeFile(outputPath, priorContents, "utf8");

    await assert.rejects(
      updateGithubActivity({
        token: "test-token",
        outputPath,
        now: new Date("2025-01-01T12:00:00Z"),
        fetchImpl: async () => ({
          ok: true,
          status: 200,
          json: async () => ({ data: { user: null } }),
        }),
      }),
      /malformed contribution calendar/,
    );

    assert.equal(await readFile(outputPath, "utf8"), priorContents);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("accepts GitHub's 365-day calendar at a Sunday week boundary", async () => {
  const directory = await mkdtemp(join(tmpdir(), "github-activity-test-"));

  try {
    const snapshot = await updateGithubActivity({
      token: "test-token",
      outputPath: join(directory, "github-activity.json"),
      now: new Date("2026-10-18T12:00:00Z"),
      fetchImpl: async () => ({
        ok: true,
        json: async () =>
          createGraphqlResponse({ from: "2025-10-19", to: "2026-10-18" }),
      }),
    });

    assert.deepEqual(snapshot.period, { from: "2025-10-19", to: "2026-10-18" });
    assert.equal(snapshot.weeks.flatMap((week) => week.days).length, 365);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("rejects calendars outside the requested window or ending before today", async () => {
  const directory = await mkdtemp(join(tmpdir(), "github-activity-test-"));

  try {
    for (const period of [
      { from: "2025-10-17", to: "2026-10-18" },
      { from: "2025-10-18", to: "2026-10-17" },
    ]) {
      await assert.rejects(
        updateGithubActivity({
          token: "test-token",
          outputPath: join(directory, "github-activity.json"),
          now: new Date("2026-10-18T12:00:00Z"),
          fetchImpl: async () => ({
            ok: true,
            json: async () => createGraphqlResponse(period),
          }),
        }),
        /outside the requested window/,
      );
    }
    assert.deepEqual(await readdir(directory), []);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("builds the public site with fresh activity without changing the source snapshot", async () => {
  const directory = await mkdtemp(join(tmpdir(), "site-build-test-"));
  const sourceSnapshotUrl = new URL("../github-activity.json", import.meta.url);
  const sourceSnapshot = await readFile(sourceSnapshotUrl, "utf8");

  try {
    const snapshot = await buildSite({
      outputDirectory: directory,
      token: "test-token",
      now: new Date("2025-01-01T12:00:00Z"),
      fetchImpl: async () => ({
        ok: true,
        json: async () =>
          createGraphqlResponse({ from: "2024-01-02", to: "2025-01-01" }),
      }),
    });

    assert.deepEqual((await readdir(directory)).sort(), [
      "github-activity.json",
      "index.html",
      "script-v5.js",
      "style-v5.css",
    ]);
    assert.equal(snapshot.generatedAt, "2025-01-01T12:00:00.000Z");
    assert.deepEqual(
      JSON.parse(await readFile(join(directory, "github-activity.json"), "utf8")),
      snapshot,
    );
    for (const file of ["index.html", "script-v5.js", "style-v5.css"]) {
      assert.deepEqual(
        await readFile(join(directory, file)),
        await readFile(new URL("../" + file, import.meta.url)),
      );
    }
    assert.equal(await readFile(sourceSnapshotUrl, "utf8"), sourceSnapshot);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("fails the site build instead of publishing the checked-in snapshot when GitHub fails", async () => {
  const directory = await mkdtemp(join(tmpdir(), "site-build-test-"));

  try {
    await assert.rejects(
      buildSite({
        outputDirectory: directory,
        token: "test-token",
        fetchImpl: async () => ({ ok: false, status: 503 }),
      }),
      /GitHub GraphQL request failed with status 503/,
    );
    assert.deepEqual(await readdir(directory), []);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
