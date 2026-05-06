/**
 * `npm start` — lance l'API sans dépendre de `dist/` (comme `start:dev`).
 * Ignore les arguments erronés souvent tapés : `run/dev`, `dev`, etc.
 * (sinon Nest les prend pour un nom d'app monorepo et casse le démarrage.)
 */
const { spawn } = require("child_process");
const path = require("path");

const projectRoot = path.join(__dirname, "..");

const noise = new Set([
  "run/dev",
  "run\\dev",
  "dev",
  "run",
  "start:dev",
]);

const userArgs = process.argv.slice(2);
const stray = userArgs.filter((a) => {
  const n = String(a).trim().toLowerCase().replace(/\\/g, "/");
  return noise.has(n);
});
const rest = userArgs.filter((a) => {
  const n = String(a).trim().toLowerCase().replace(/\\/g, "/");
  return !noise.has(n);
});

if (stray.length) {
  console.log(
    "[bmp-backend] Arguments ignorés (tapez seulement `npm start`) :",
    stray.join(" "),
  );
}
if (rest.length) {
  console.log(
    "[bmp-backend] Arguments non pris en charge par ce script et ignorés :",
    rest.join(" "),
  );
}

let tsNodeRegister;
let tsPaths;
try {
  tsNodeRegister = require.resolve("ts-node/register", { paths: [projectRoot] });
  tsPaths = require.resolve("tsconfig-paths/register", { paths: [projectRoot] });
} catch (e) {
  console.error("[bmp-backend] Installez les deps : npm install (ts-node / tsconfig-paths manquants)");
  process.exit(1);
}
const mainTs = path.join(projectRoot, "src", "main.ts");

const child = spawn(
  process.execPath,
  ["-r", tsNodeRegister, "-r", tsPaths, mainTs],
  {
    cwd: projectRoot,
    stdio: "inherit",
    windowsHide: true,
    env: { ...process.env, NODE_ENV: process.env.NODE_ENV || "development" },
  },
);

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
