#!/usr/bin/env node
'use strict';
/**
 * Creates a realistic demo directory tree under ./demo-project
 * with varied file sizes and intentional duplicates.
 */
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'demo-project');

// ── helpers ─────────────────────────────────────────────────────────────────
function mkdirp(p) { fs.mkdirSync(p, { recursive: true }); }
function writeFile(p, content) {
  mkdirp(path.dirname(p));
  fs.writeFileSync(p, content);
}
/** Fill a file to exactly `bytes` bytes. */
function fill(p, bytes, char = ' ') {
  mkdirp(path.dirname(p));
  fs.writeFileSync(p, Buffer.alloc(bytes, char.charCodeAt(0)));
}
/** Fill with meaningful-looking text content, padded to size. */
function textFile(p, header, targetBytes) {
  const base = header + '\n';
  const reps = Math.max(1, Math.ceil(targetBytes / base.length));
  const buf  = Buffer.from(base.repeat(reps)).slice(0, targetBytes);
  mkdirp(path.dirname(p));
  fs.writeFileSync(p, buf);
}

// ── clean slate ──────────────────────────────────────────────────────────────
fs.rmSync(ROOT, { recursive: true, force: true });
mkdirp(ROOT);

// ── src/ ─────────────────────────────────────────────────────────────────────
const src = `${ROOT}/src`;

textFile(`${src}/index.js`,
  `// Entry point\nimport App from './App';\nApp.run();\n`, 1_024);

textFile(`${src}/App.js`,
  `// Main application module\nexport default class App { static run() {} }\n`, 3_200);

textFile(`${src}/config.js`,
  `// Configuration\nexport const API_URL = 'https://api.example.com';\n`, 800);

// src/components/
textFile(`${src}/components/Button.jsx`,
  `import React from 'react';\nexport default function Button({label}) { return <button>{label}</button>; }\n`, 2_048);

textFile(`${src}/components/Modal.jsx`,
  `import React from 'react';\nexport default function Modal({children}) { return <div>{children}</div>; }\n`, 3_072);

textFile(`${src}/components/Navbar.jsx`,
  `import React from 'react';\nexport default function Navbar() { return <nav></nav>; }\n`, 2_800);

textFile(`${src}/components/Footer.jsx`,
  `import React from 'react';\nexport default function Footer() { return <footer></footer>; }\n`, 2_048); // same size as Button.jsx

// src/components/forms/
textFile(`${src}/components/forms/LoginForm.jsx`,
  `import React from 'react';\nexport default function LoginForm() { return <form></form>; }\n`, 4_096);

textFile(`${src}/components/forms/RegisterForm.jsx`,
  `import React from 'react';\nexport default function RegisterForm() { return <form></form>; }\n`, 5_120);

// src/utils/
textFile(`${src}/utils/helpers.js`,
  `// Generic helpers\nexport const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);\n`, 1_536);

textFile(`${src}/utils/validators.js`,
  `// Form validators\nexport const isEmail = v => /^[^@]+@[^@]+$/.test(v);\n`, 1_536); // same size as helpers.js

textFile(`${src}/utils/format.js`,
  `// Formatters\nexport const currency = v => '$' + v.toFixed(2);\n`, 900);

// src/styles/
textFile(`${src}/styles/main.css`,
  `/* Main stylesheet */\nbody { margin: 0; font-family: sans-serif; }\n`, 4_200);

textFile(`${src}/styles/theme.css`,
  `/* Theme variables */\n:root { --primary: #4f46e5; --bg: #f9fafb; }\n`, 2_100);

textFile(`${src}/styles/components.css`,
  `/* Component styles */\n.btn { padding: 8px 16px; border-radius: 4px; }\n`, 6_800);

// ── assets/ ──────────────────────────────────────────────────────────────────
const assets = `${ROOT}/assets`;

fill(`${assets}/images/logo.png`,       15_360, 'P');
fill(`${assets}/images/banner.jpg`,     51_200, 'J');
fill(`${assets}/images/hero.jpg`,       78_000, 'J');
fill(`${assets}/images/thumbnail.jpg`,  18_432, 'J');
fill(`${assets}/images/icon.png`,       15_360, 'P'); // ← duplicate of logo.png (name+size)

fill(`${assets}/fonts/Roboto-Regular.ttf`,    122_880, 'T');
fill(`${assets}/fonts/Roboto-Bold.ttf`,        98_304, 'T');
fill(`${assets}/fonts/OpenSans-Regular.ttf`,   98_304, 'T'); // ← same size as Roboto-Bold.ttf (different name)
fill(`${assets}/fonts/OpenSans-Bold.ttf`,      85_000, 'T');

fill(`${assets}/videos/intro.mp4`,     512_000, 'V');
fill(`${assets}/videos/demo.mp4`,      890_000, 'V');

// ── docs/ ────────────────────────────────────────────────────────────────────
const docs = `${ROOT}/docs`;

textFile(`${docs}/README.md`,
  `# Project README\nThis project demonstrates file analysis.\n`, 3_200);

textFile(`${docs}/CHANGELOG.md`,
  `# Changelog\n## v1.0.0 - Initial release\n`, 3_200); // ← duplicate of README.md size

textFile(`${docs}/CONTRIBUTING.md`,
  `# Contributing\nPlease read the guidelines before submitting PRs.\n`, 2_048);

textFile(`${docs}/api/overview.md`,
  `# API Overview\nBase URL: https://api.example.com/v1\n`, 3_800);

textFile(`${docs}/api/endpoints.md`,
  `# Endpoints\nGET /users  POST /users  DELETE /users/:id\n`, 7_200);

textFile(`${docs}/api/authentication.md`,
  `# Authentication\nUse Bearer tokens in the Authorization header.\n`, 4_500);

// ── tests/ ───────────────────────────────────────────────────────────────────
const tests = `${ROOT}/tests`;

// INTENTIONAL duplicates — same filename + same byte size
const testContent = `// Unit test\ndescribe("helpers", () => { it("works", () => {}); });\n`;
textFile(`${tests}/unit/helpers.test.js`,      testContent, 2_048);
textFile(`${tests}/integration/helpers.test.js`, testContent, 2_048); // ← duplicate!

const valContent = `// Validator test\ndescribe("validators", () => { it("isEmail", () => {}); });\n`;
textFile(`${tests}/unit/validators.test.js`,      valContent, 2_048);
textFile(`${tests}/integration/validators.test.js`, valContent, 2_048); // ← duplicate!

textFile(`${tests}/unit/format.test.js`,
  `// Format test\ndescribe("format", () => { it("currency", () => {}); });\n`, 1_800);

textFile(`${tests}/integration/api.test.js`,
  `// API integration test\ndescribe("API", () => { it("GET /users", () => {}); });\n`, 5_500);

textFile(`${tests}/e2e/signup-flow.test.js`,
  `// E2E: sign-up flow\ndescribe("signup", () => { it("renders form", () => {}); });\n`, 6_400);

textFile(`${tests}/e2e/login-flow.test.js`,
  `// E2E: login flow\ndescribe("login", () => { it("submits creds", () => {}); });\n`, 6_400); // ← duplicate!

textFile(`${tests}/e2e/checkout-flow.test.js`,
  `// E2E: checkout flow\ndescribe("checkout", () => { it("completes order", () => {}); });\n`, 9_000);

// ── root config files ────────────────────────────────────────────────────────
textFile(`${ROOT}/package.json`,
  `{ "name": "demo-project", "version": "1.0.0", "scripts": { "test": "jest" } }\n`, 512);

textFile(`${ROOT}/jest.config.js`,
  `module.exports = { testEnvironment: 'node' };\n`, 512); // ← duplicate size as package.json

textFile(`${ROOT}/.eslintrc.json`,
  `{ "extends": "eslint:recommended", "env": { "browser": true } }\n`, 340);

textFile(`${ROOT}/tsconfig.json`,
  `{ "compilerOptions": { "target": "es2020", "module": "esnext" } }\n`, 420);

textFile(`${ROOT}/webpack.config.js`,
  `const path = require('path');\nmodule.exports = { entry: './src/index.js', output: { path: path.resolve(__dirname, 'dist') } };\n`, 1_100);

// ── summary ──────────────────────────────────────────────────────────────────
function countFiles(dir) {
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) n += countFiles(path.join(dir, e.name));
    else if (e.isFile())  n++;
  }
  return n;
}

const total = countFiles(ROOT);
console.log(`✓  Demo project created at: ${ROOT}`);
console.log(`   ${total} files across src/, assets/, docs/, tests/ and root configs.`);
console.log(`   Intentional duplicates: helpers.test.js, validators.test.js (unit+integration), login/signup e2e tests.`);
