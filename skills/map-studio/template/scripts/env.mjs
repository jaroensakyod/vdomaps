// Load KEY=value lines from .env in the project folder into process.env (variables already set win).
// .env is the student's own file for GEMINI_API_KEY and WHISPER_* — git-ignored, never committed.
import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env"))
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && m[2] && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, "$2");
  }
