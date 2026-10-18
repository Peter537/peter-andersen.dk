import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { updateGithubActivity } from "./update-github-activity.mjs";

const PROJECT_ROOT = fileURLToPath(new URL("../", import.meta.url));
const STATIC_FILES = ["index.html", "style-v4.css", "script-v4.js"];

export async function buildSite({
  outputDirectory = resolve(PROJECT_ROOT, "dist"),
  token,
  now,
  fetchImpl,
} = {}) {
  const snapshot = await updateGithubActivity({
    token,
    now,
    fetchImpl,
    outputPath: resolve(outputDirectory, "github-activity.json"),
  });

  await Promise.all(
    STATIC_FILES.map((file) =>
      copyFile(resolve(PROJECT_ROOT, file), resolve(outputDirectory, file)),
    ),
  );

  return snapshot;
}

const invokedModuleUrl = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : "";

if (import.meta.url === invokedModuleUrl) {
  buildSite()
    .then((snapshot) => {
      process.stdout.write(
        "Built dist with GitHub activity through " + snapshot.period.to + ".\n",
      );
    })
    .catch((error) => {
      process.stderr.write("Site build failed: " + error.message + "\n");
      process.exitCode = 1;
    });
}
