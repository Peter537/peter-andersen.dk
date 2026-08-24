import { randomUUID } from "node:crypto";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DAY_IN_MILLISECONDS = 86400000;
const GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const LEVELS = new Map([
  ["NONE", 0],
  ["FIRST_QUARTILE", 1],
  ["SECOND_QUARTILE", 2],
  ["THIRD_QUARTILE", 3],
  ["FOURTH_QUARTILE", 4],
]);

const CONTRIBUTION_QUERY = [
  "query ContributionCalendar(",
  "  $login: String!",
  "  $from: DateTime!",
  "  $to: DateTime!",
  ") {",
  "  user(login: $login) {",
  "    contributionsCollection(from: $from, to: $to) {",
  "      contributionCalendar {",
  "        totalContributions",
  "        weeks {",
  "          firstDay",
  "          contributionDays {",
  "            contributionCount",
  "            contributionLevel",
  "            date",
  "          }",
  "        }",
  "      }",
  "    }",
  "  }",
  "}",
].join("\n");

function fail(message) {
  throw new TypeError(message);
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function assertExactKeys(value, expectedKeys, label) {
  if (!isPlainObject(value)) fail(label + " must be an object");

  const actualKeys = Object.keys(value).sort();
  const sortedExpectedKeys = expectedKeys.slice().sort();
  if (
    actualKeys.length !== sortedExpectedKeys.length ||
    actualKeys.some((key, index) => key !== sortedExpectedKeys[index])
  ) {
    fail(label + " contains unexpected or missing fields");
  }
}

function parseDateOnly(value, label) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    fail(label + " must use YYYY-MM-DD");
  }

  const date = new Date(value + "T00:00:00Z");
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    fail(label + " is not a real calendar date");
  }

  return date;
}

function formatDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

export function mapContributionLevel(level) {
  if (!LEVELS.has(level)) {
    fail("Unknown contribution level: " + String(level));
  }
  return LEVELS.get(level);
}

export function getContributionWindow(now = new Date()) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    fail("now must be a valid Date");
  }

  const to = new Date(now);
  const from = new Date(to.getTime() - 365 * DAY_IN_MILLISECONDS);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export function validateSnapshot(snapshot, expectedUsername = "Peter537") {
  assertExactKeys(
    snapshot,
    [
      "schemaVersion",
      "username",
      "profileUrl",
      "generatedAt",
      "period",
      "totalContributions",
      "weeks",
    ],
    "snapshot",
  );

  if (snapshot.schemaVersion !== 1) fail("Unsupported schema version");
  if (
    typeof snapshot.username !== "string" ||
    !/^(?!-)[A-Za-z0-9-]{1,39}(?<!-)$/.test(snapshot.username) ||
    snapshot.username !== expectedUsername
  ) {
    fail("Unexpected GitHub username");
  }
  if (snapshot.profileUrl !== "https://github.com/" + snapshot.username) {
    fail("Profile URL does not match the username");
  }
  const generatedAt = new Date(snapshot.generatedAt);
  if (
    typeof snapshot.generatedAt !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(
      snapshot.generatedAt,
    ) ||
    Number.isNaN(generatedAt.getTime()) ||
    generatedAt.toISOString().slice(0, 19) !==
      snapshot.generatedAt.slice(0, 19)
  ) {
    fail("generatedAt must be an RFC3339 UTC timestamp");
  }

  assertExactKeys(snapshot.period, ["from", "to"], "period");
  const periodFrom = parseDateOnly(snapshot.period.from, "period.from");
  const periodTo = parseDateOnly(snapshot.period.to, "period.to");
  if (periodFrom > periodTo) fail("Snapshot period is reversed");

  if (
    !Number.isSafeInteger(snapshot.totalContributions) ||
    snapshot.totalContributions < 0
  ) {
    fail("totalContributions must be a non-negative safe integer");
  }
  if (
    !Array.isArray(snapshot.weeks) ||
    snapshot.weeks.length < 52 ||
    snapshot.weeks.length > 54
  ) {
    fail("Snapshot must contain 52 to 54 weeks");
  }

  const seenDates = new Set();
  let previousDate = null;
  let previousWeek = null;
  let contributionTotal = 0;
  let dayTotal = 0;

  for (const [weekIndex, week] of snapshot.weeks.entries()) {
    const weekLabel = "weeks[" + weekIndex + "]";
    assertExactKeys(week, ["firstDay", "days"], weekLabel);
    if (
      !Array.isArray(week.days) ||
      week.days.length < 1 ||
      week.days.length > 7
    ) {
      fail(weekLabel + ".days must contain 1 to 7 days");
    }

    const firstDay = parseDateOnly(
      week.firstDay,
      weekLabel + ".firstDay",
    );
    if (previousWeek !== null && firstDay <= previousWeek) {
      fail("Weeks are not in chronological order");
    }
    previousWeek = firstDay;

    for (const [dayIndex, day] of week.days.entries()) {
      const label = weekLabel + ".days[" + dayIndex + "]";
      assertExactKeys(day, ["date", "count", "level"], label);
      if (!Number.isSafeInteger(day.count) || day.count < 0) {
        fail(label + ".count must be a non-negative safe integer");
      }
      if (!Number.isInteger(day.level) || day.level < 0 || day.level > 4) {
        fail(label + ".level must be between 0 and 4");
      }
      if (
        (day.count === 0 && day.level !== 0) ||
        (day.count > 0 && day.level === 0)
      ) {
        fail(label + " has an inconsistent count and level");
      }

      const date = parseDateOnly(day.date, label + ".date");
      const offsetFromWeekStart =
        (date.getTime() - firstDay.getTime()) / DAY_IN_MILLISECONDS;
      if (
        !Number.isInteger(offsetFromWeekStart) ||
        offsetFromWeekStart < 0 ||
        offsetFromWeekStart > 6
      ) {
        fail(label + ".date is outside its week");
      }
      if (seenDates.has(day.date)) fail("Duplicate date: " + day.date);
      if (
        previousDate !== null &&
        date.getTime() - previousDate.getTime() !== DAY_IN_MILLISECONDS
      ) {
        fail("Contribution days are not consecutive and chronological");
      }

      seenDates.add(day.date);
      previousDate = date;
      contributionTotal += day.count;
      if (!Number.isSafeInteger(contributionTotal)) {
        fail("Contribution total exceeds the safe integer range");
      }
      dayTotal += 1;
    }
  }

  const firstDate = snapshot.weeks[0].days[0].date;
  const finalWeek = snapshot.weeks[snapshot.weeks.length - 1];
  const lastDate = finalWeek.days[finalWeek.days.length - 1].date;
  if (dayTotal < 365 || dayTotal > 367) {
    fail("Snapshot must contain 365 to 367 consecutive days");
  }
  if (
    firstDate !== snapshot.period.from ||
    lastDate !== snapshot.period.to
  ) {
    fail("Snapshot period does not match its first and last days");
  }
  if (contributionTotal !== snapshot.totalContributions) {
    fail("Snapshot total does not equal the sum of daily contributions");
  }

  return snapshot;
}

export function buildSnapshot(
  responseBody,
  { username = "Peter537", generatedAt = new Date().toISOString() } = {},
) {
  const calendar =
    responseBody?.data?.user?.contributionsCollection?.contributionCalendar;
  if (
    !isPlainObject(calendar) ||
    !Number.isSafeInteger(calendar.totalContributions) ||
    !Array.isArray(calendar.weeks)
  ) {
    fail("GitHub returned a malformed contribution calendar");
  }

  const weeks = calendar.weeks.map((week, weekIndex) => {
    if (
      !isPlainObject(week) ||
      typeof week.firstDay !== "string" ||
      !Array.isArray(week.contributionDays)
    ) {
      fail("GitHub returned a malformed week at index " + weekIndex);
    }

    return {
      firstDay: week.firstDay,
      days: week.contributionDays.map((day, dayIndex) => {
        if (
          !isPlainObject(day) ||
          typeof day.date !== "string" ||
          !Number.isSafeInteger(day.contributionCount) ||
          typeof day.contributionLevel !== "string"
        ) {
          fail(
            "GitHub returned a malformed day at week " +
              weekIndex +
              ", index " +
              dayIndex,
          );
        }

        return {
          date: day.date,
          count: day.contributionCount,
          level: mapContributionLevel(day.contributionLevel),
        };
      }),
    };
  });

  if (weeks.length === 0 || weeks[0].days.length === 0) {
    fail("GitHub returned an empty contribution calendar");
  }
  const finalWeek = weeks[weeks.length - 1];
  if (finalWeek.days.length === 0) {
    fail("GitHub returned an empty final contribution week");
  }

  const snapshot = {
    schemaVersion: 1,
    username,
    profileUrl: "https://github.com/" + username,
    generatedAt,
    period: {
      from: weeks[0].days[0].date,
      to: finalWeek.days[finalWeek.days.length - 1].date,
    },
    totalContributions: calendar.totalContributions,
    weeks,
  };

  return validateSnapshot(snapshot, username);
}

export async function writeSnapshotAtomically(outputPath, snapshot) {
  validateSnapshot(snapshot, snapshot.username);

  const absoluteOutputPath = resolve(outputPath);
  const outputDirectory = dirname(absoluteOutputPath);
  const temporaryPath = resolve(
    outputDirectory,
    "." +
      basename(absoluteOutputPath) +
      "." +
      process.pid +
      "." +
      randomUUID() +
      ".tmp",
  );

  await mkdir(outputDirectory, { recursive: true });
  try {
    await writeFile(
      temporaryPath,
      JSON.stringify(snapshot, null, 2) + "\n",
      "utf8",
    );
    await rename(temporaryPath, absoluteOutputPath);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

export async function updateGithubActivity({
  token = process.env.GITHUB_TOKEN,
  username = process.env.GH_ACTIVITY_USERNAME || "Peter537",
  outputPath = resolve("github-activity.json"),
  now = new Date(),
  fetchImpl = fetch,
} = {}) {
  if (typeof token !== "string" || token.trim() === "") {
    fail("GITHUB_TOKEN is required");
  }
  if (typeof fetchImpl !== "function") fail("fetchImpl must be a function");

  const window = getContributionWindow(now);
  const response = await fetchImpl(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      "User-Agent": "peter-andersen.dk-github-activity",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      query: CONTRIBUTION_QUERY,
      variables: {
        login: username,
        from: window.from,
        to: window.to,
      },
    }),
  });

  if (!response || response.ok !== true) {
    fail(
      "GitHub GraphQL request failed with status " +
        (response?.status ?? "unknown"),
    );
  }

  let responseBody;
  try {
    responseBody = await response.json();
  } catch (_error) {
    fail("GitHub returned a non-JSON response");
  }

  if (
    !isPlainObject(responseBody) ||
    (Object.hasOwn(responseBody, "errors") &&
      (!Array.isArray(responseBody.errors) || responseBody.errors.length > 0))
  ) {
    fail("GitHub GraphQL returned errors");
  }

  const snapshot = buildSnapshot(responseBody, {
    username,
    generatedAt: now.toISOString(),
  });
  if (
    snapshot.period.from !== window.from.slice(0, 10) ||
    snapshot.period.to !== window.to.slice(0, 10)
  ) {
    fail("GitHub returned a contribution period outside the requested window");
  }
  await writeSnapshotAtomically(outputPath, snapshot);
  return snapshot;
}

const invokedModuleUrl = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : "";

if (import.meta.url === invokedModuleUrl) {
  updateGithubActivity()
    .then((snapshot) => {
      process.stdout.write(
        "Updated " +
          snapshot.username +
          " GitHub activity through " +
          snapshot.period.to +
          ".\n",
      );
    })
    .catch((error) => {
      process.stderr.write(
        "GitHub activity update failed: " + error.message + "\n",
      );
      process.exitCode = 1;
    });
}
