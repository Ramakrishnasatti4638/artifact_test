#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');
const chalk = require('chalk');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSize(bytes) {
  if (bytes < 1024)                  return chalk.yellow(`${bytes} B`);
  if (bytes < 1024 ** 2)             return chalk.yellow(`${(bytes / 1024).toFixed(1)} KB`);
  if (bytes < 1024 ** 3)             return chalk.yellow(`${(bytes / 1024 ** 2).toFixed(2)} MB`);
  return chalk.yellow(`${(bytes / 1024 ** 3).toFixed(2)} GB`);
}

function formatSizeRaw(bytes) {
  if (bytes < 1024)                  return `${bytes} B`;
  if (bytes < 1024 ** 2)             return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3)             return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function hr(char = '─', width = 60) {
  return chalk.gray(char.repeat(width));
}

// ─── Directory Walker ─────────────────────────────────────────────────────────

/**
 * Recursively collect every regular file under `dir`.
 * Returns { files: [{path, name, size, depth}], maxDepth }
 */
function walk(dir, currentDepth = 0) {
  let files   = [];
  let maxDepth = currentDepth;

  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    console.error(chalk.red(`  ⚠  Cannot read ${dir}: ${e.message}`));
    return { files, maxDepth };
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;          // skip hidden
    const fullPath = path.join(dir, entry.name);

    if (entry.isSymbolicLink()) continue;

    if (entry.isDirectory()) {
      const sub = walk(fullPath, currentDepth + 1);
      files    = files.concat(sub.files);
      if (sub.maxDepth > maxDepth) maxDepth = sub.maxDepth;

    } else if (entry.isFile()) {
      let size = 0;
      try { size = fs.statSync(fullPath).size; } catch {}
      files.push({ path: fullPath, name: entry.name, size, depth: currentDepth });
    }
  }

  return { files, maxDepth };
}

// ─── Tree helpers ─────────────────────────────────────────────────────────────

/** Aggregate total size + file count for a directory (recursive). */
function getDirStats(dir) {
  let totalSize = 0, fileCount = 0;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return { totalSize: 0, fileCount: 0 };
  }
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      const s = getDirStats(p);
      totalSize += s.totalSize;
      fileCount += s.fileCount;
    } else if (e.isFile()) {
      try { totalSize += fs.statSync(p).size; } catch {}
      fileCount++;
    }
  }
  return { totalSize, fileCount };
}

/** Print a tree rooted at `dir` using box-drawing characters. */
function printTree(dir, prefix = '', currentDepth = 0, maxDepth = Infinity) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    console.log(prefix + chalk.red('[unreadable]'));
    return;
  }

  // dirs first, then files, both alphabetical
  entries = entries
    .filter(e => !e.name.startsWith('.') && !e.isSymbolicLink())
    .sort((a, b) => {
      const ad = a.isDirectory(), bd = b.isDirectory();
      if (ad && !bd) return -1;
      if (!ad && bd) return  1;
      return a.name.localeCompare(b.name);
    });

  for (let i = 0; i < entries.length; i++) {
    const entry   = entries[i];
    const isLast  = i === entries.length - 1;
    const branch  = isLast ? '└── ' : '├── ';
    const child   = isLast ? '    ' : '│   ';
    const full    = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const stats = getDirStats(full);
      console.log(
        prefix + branch +
        chalk.blue.bold(entry.name + '/') +
        chalk.gray(` [${stats.fileCount} file${stats.fileCount !== 1 ? 's' : ''}, `) +
        chalk.yellow(formatSizeRaw(stats.totalSize)) +
        chalk.gray(']')
      );
      if (currentDepth < maxDepth) {
        printTree(full, prefix + child, currentDepth + 1, maxDepth);
      } else {
        console.log(prefix + child + chalk.gray('…'));
      }
    } else if (entry.isFile()) {
      let size = 0;
      try { size = fs.statSync(full).size; } catch {}
      const ext          = path.extname(entry.name);
      const base         = ext ? entry.name.slice(0, -ext.length) : entry.name;
      const extLabel     = ext ? chalk.green(ext) : chalk.gray('(none)');
      console.log(
        prefix + branch +
        base + extLabel +
        '  ' + chalk.yellow(formatSizeRaw(size))
      );
    }
  }
}

// ─── CLI parsing ──────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);

if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h') {
  console.log(`
${chalk.bold.cyan('📂  File System Analyzer')}

${chalk.bold('Usage:')}
  node analyze.js ${chalk.yellow('<directory>')} ${chalk.gray('[options]')}

${chalk.bold('Options:')}
  ${chalk.green('--top <N>')}         List the N largest files           ${chalk.gray('(default N=10)')}
  ${chalk.green('--duplicates')}      Find files with identical name+size
  ${chalk.green('--tree')}            Print directory tree
  ${chalk.green('--depth <N>')}       Limit tree depth (use with --tree)  ${chalk.gray('(default: unlimited)')}
  ${chalk.green('--help')}            Show this help message

${chalk.bold('Examples:')}
  node analyze.js .
  node analyze.js ./src --top 5
  node analyze.js . --duplicates
  node analyze.js . --tree --depth 2
`);
  process.exit(0);
}

const targetDir = path.resolve(argv[0]);

if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
  console.error(chalk.red(`\n  ✗  "${targetDir}" is not a valid directory\n`));
  process.exit(1);
}

let mode     = 'summary';
let topN     = 10;
let treeDepth = Infinity;

for (let i = 1; i < argv.length; i++) {
  switch (argv[i]) {
    case '--top':
      mode = 'top';
      if (argv[i + 1] && !argv[i + 1].startsWith('-')) { topN = parseInt(argv[++i], 10); }
      break;
    case '--duplicates':
      mode = 'duplicates';
      break;
    case '--tree':
      mode = 'tree';
      break;
    case '--depth':
      if (argv[i + 1] && !argv[i + 1].startsWith('-')) { treeDepth = parseInt(argv[++i], 10); }
      break;
    default:
      console.error(chalk.red(`  ⚠  Unknown option: ${argv[i]}`));
  }
}

// ─── Banner ───────────────────────────────────────────────────────────────────

console.log(`\n${chalk.bold.cyan('📂  File System Analyzer')}`);
console.log(`${chalk.gray('   Directory:')} ${chalk.blue(targetDir)}\n`);

// ─── Walk ─────────────────────────────────────────────────────────────────────

const { files, maxDepth } = walk(targetDir, 0);

// ═════════════════════════════════════════════════════════════════════════════
// MODE: SUMMARY
// ═════════════════════════════════════════════════════════════════════════════
if (mode === 'summary') {
  const totalSize = files.reduce((s, f) => s + f.size, 0);

  // Extension map
  const extMap = {};
  for (const f of files) {
    const ext = path.extname(f.name).toLowerCase() || '(no ext)';
    if (!extMap[ext]) extMap[ext] = { count: 0, size: 0 };
    extMap[ext].count++;
    extMap[ext].size += f.size;
  }
  const extSorted = Object.entries(extMap).sort((a, b) => b[1].size - a[1].size);

  const W = 60;
  console.log(hr('═', W));
  console.log(chalk.bold('  SUMMARY'));
  console.log(hr('═', W));
  console.log(`  ${chalk.bold('Total files')}       ${chalk.cyan(files.length.toLocaleString())}`);
  console.log(`  ${chalk.bold('Total size')}        ${formatSize(totalSize)}`);
  console.log(`  ${chalk.bold('Max nesting depth')} ${chalk.cyan(maxDepth)} level${maxDepth !== 1 ? 's' : ''}`);
  console.log();

  // Extension table
  const extW = 12, cntW = 8, barMax = 22;
  console.log(hr('─', W));
  console.log(
    '  ' +
    chalk.bold.gray('Extension'.padEnd(extW)) +
    chalk.bold.gray('Files'.padEnd(cntW)) +
    chalk.bold.gray('Total Size'.padEnd(14)) +
    chalk.bold.gray('Share')
  );
  console.log(hr('─', W));

  for (const [ext, info] of extSorted) {
    const barLen = totalSize > 0 ? Math.round((info.size / totalSize) * barMax) : 0;
    const pct    = totalSize > 0 ? ((info.size / totalSize) * 100).toFixed(1) : '0.0';
    console.log(
      '  ' +
      chalk.green(ext.padEnd(extW)) +
      chalk.cyan(String(info.count).padEnd(cntW)) +
      formatSize(info.size).padEnd(22) +       // chalk escape codes inflate length
      chalk.gray('█'.repeat(Math.max(barLen, 0))) +
      chalk.gray(` ${pct}%`)
    );
  }

  console.log(hr('═', W));
}

// ═════════════════════════════════════════════════════════════════════════════
// MODE: TOP N
// ═════════════════════════════════════════════════════════════════════════════
else if (mode === 'top') {
  const sorted  = [...files].sort((a, b) => b.size - a.size).slice(0, topN);
  const maxSize = sorted[0]?.size || 1;
  const W = 72;

  console.log(hr('═', W));
  console.log(chalk.bold(`  TOP ${topN} LARGEST FILES`));
  console.log(hr('═', W));

  sorted.forEach((f, i) => {
    const rank = chalk.gray(String(i + 1).padStart(3) + '.');
    const rel  = path.relative(targetDir, f.path);
    const bar  = chalk.yellow('█'.repeat(Math.max(1, Math.round((f.size / maxSize) * 18))));
    const sz   = formatSizeRaw(f.size).padStart(10);
    console.log(`${rank}  ${chalk.yellow(sz)}  ${bar}  ${chalk.cyan(rel)}`);
  });

  const shownSize = sorted.reduce((s, f) => s + f.size, 0);
  const totSize   = files.reduce((s, f) => s + f.size, 0);
  console.log(hr('─', W));
  console.log(
    chalk.gray(`  Showing ${sorted.length} of ${files.length} files — `) +
    formatSize(shownSize) +
    chalk.gray(' of ') +
    formatSize(totSize) +
    chalk.gray(' total')
  );
  console.log(hr('═', W));
}

// ═════════════════════════════════════════════════════════════════════════════
// MODE: DUPLICATES
// ═════════════════════════════════════════════════════════════════════════════
else if (mode === 'duplicates') {
  const groups = {};
  for (const f of files) {
    const key = `${f.name}::${f.size}`;
    (groups[key] = groups[key] || []).push(f);
  }

  const dupes = Object.entries(groups)
    .filter(([, arr]) => arr.length > 1)
    .sort((a, b) => b[1].length - a[1].length);

  const W = 66;
  console.log(hr('═', W));
  console.log(chalk.bold('  POTENTIAL DUPLICATES  ') + chalk.gray('(same name + same size)'));
  console.log(hr('═', W));

  if (dupes.length === 0) {
    console.log(chalk.green('  ✓  No potential duplicates found.'));
  } else {
    const wastedBytes = dupes.reduce((acc, [, arr]) => {
      const size = arr[0].size;
      return acc + size * (arr.length - 1);   // extra copies = wasted
    }, 0);

    console.log(
      chalk.yellow(`  ⚠  Found ${dupes.length} group${dupes.length !== 1 ? 's' : ''} `) +
      chalk.gray(`— `) +
      formatSize(wastedBytes) +
      chalk.gray(' potentially wasted\n')
    );

    for (const [key, group] of dupes) {
      const colonIdx = key.lastIndexOf('::');
      const name = key.slice(0, colonIdx);
      const size = parseInt(key.slice(colonIdx + 2), 10);

      console.log(
        `  ${chalk.green.bold(name)}` +
        chalk.gray('  ·  ') +
        formatSize(size) +
        chalk.gray('  ·  ') +
        chalk.yellow(`${group.length} copies`)
      );
      for (const f of group) {
        console.log(`    ${chalk.gray('→')} ${chalk.cyan(path.relative(targetDir, f.path))}`);
      }
      console.log();
    }
  }

  console.log(hr('═', W));
}

// ═════════════════════════════════════════════════════════════════════════════
// MODE: TREE
// ═════════════════════════════════════════════════════════════════════════════
else if (mode === 'tree') {
  const rootStats  = getDirStats(targetDir);
  const depthLabel = isFinite(treeDepth) ? `depth ≤ ${treeDepth}` : 'unlimited depth';
  const W = 64;

  console.log(hr('═', W));
  console.log(chalk.bold('  DIRECTORY TREE  ') + chalk.gray(`(${depthLabel})`));
  console.log(hr('═', W));

  console.log(
    chalk.blue.bold(path.basename(targetDir) + '/') +
    chalk.gray(`  [${rootStats.fileCount} files, `) +
    chalk.yellow(formatSizeRaw(rootStats.totalSize)) +
    chalk.gray(']')
  );
  printTree(targetDir, '', 0, treeDepth);

  console.log(hr('═', W));
}
