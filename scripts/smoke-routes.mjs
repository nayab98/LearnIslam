import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const port = process.env.SMOKE_PORT || "3100";
const baseUrl = `http://127.0.0.1:${port}`;
const routes = [
  "/",
  "/surahs",
  "/surahs/56",
  "/hadees",
  "/hadees/must-know",
  "/hadees/easy",
  "/quiz",
  "/search",
  "/dashboard",
  "/bookmarks",
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function statusCode(url) {
  const { stdout } = await execFileAsync("curl", [
    "-sS",
    "-o",
    "/dev/null",
    "-w",
    "%{http_code}",
    url,
  ]);
  return Number(stdout.trim());
}

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < 30000) {
    try {
      const status = await statusCode(baseUrl);
      if (status >= 200 && status < 400) return;
    } catch {
      // Server is still booting.
    }
    await wait(500);
  }
  throw new Error(`Server did not start at ${baseUrl}`);
}

async function main() {
  const server = spawn("npm", ["start", "--", "-H", "127.0.0.1", "-p", port], {
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });

  let output = "";
  let shutdownRequested = false;
  server.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });

  try {
    await waitForServer();
    for (const route of routes) {
      const status = await statusCode(`${baseUrl}${route}`);
      if (status >= 400) {
        throw new Error(`${route} returned ${status}`);
      }
      console.log(`${status} ${route}`);
    }
  } finally {
    shutdownRequested = true;
    server.kill("SIGTERM");
  }

  await new Promise((resolve) => {
    server.once("exit", resolve);
    setTimeout(resolve, 3000);
  });

  if (!shutdownRequested && server.exitCode && server.exitCode !== 0 && server.exitCode !== null) {
    throw new Error(`Smoke server exited with ${server.exitCode}\n${output}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
