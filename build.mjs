// Writes dist/chromium and dist/firefox, one unpacked extension per store family.
// ZEROPARADES_BASE=<origin> builds against another copy of the site (host permission and API origin follow it).
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const root = new URL("./", import.meta.url);
const base = (process.env.ZEROPARADES_BASE ?? "https://zeroparadesdb.com").replace(/\/$/, "");
const FILES = ["background.js", "lookup.html", "lookup.js", "lookup.css", "zeroparades.mjs", "icons", "_locales"];
const manifest = JSON.parse(readFileSync(new URL("manifest.json", root), "utf8"));
manifest.host_permissions = [`${base}/*`];
const firefox = JSON.parse(readFileSync(new URL("manifest.firefox.json", root), "utf8"));

for (const [family, delta] of [["chromium", {}], ["firefox", firefox]]) {
  const out = new URL(`dist/${family}/`, root);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  for (const file of FILES) cpSync(new URL(file, root), new URL(file, out), { recursive: true });
  writeFileSync(new URL("config.mjs", out), `export const BASE = ${JSON.stringify(base)};\n`);
  writeFileSync(new URL("manifest.json", out), `${JSON.stringify({ ...manifest, ...delta }, null, 2)}\n`);
}
console.log(`built dist/chromium and dist/firefox for ${base}`);
