#!/usr/bin/env node

/**
 * Load testing script using autocannon
 * Tests rate limiting under concurrent load
 */

import { spawn } from 'child_process';

const tests = [
  {
    name: 'Global rate limit test',
    url: 'http://localhost:3000/api/data',
    connections: 10,
    duration: 10,
    expected429: true,
  },
  {
    name: 'Strict endpoint test (10/min)',
    url: 'http://localhost:3000/api/create',
    method: 'POST',
    connections: 5,
    duration: 5,
    expected429: true,
  },
  {
    name: 'Public endpoint test (1000/min)',
    url: 'http://localhost:3000/api/public',
    connections: 20,
    duration: 10,
    expected429: false,
  },
  {
    name: 'Health endpoint (no limit)',
    url: 'http://localhost:3000/api/health',
    connections: 50,
    duration: 5,
    expected429: false,
  },
];

async function runTest(test) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test: ${test.name}`);
  console.log(`URL: ${test.url}`);
  console.log(`Connections: ${test.connections}, Duration: ${test.duration}s`);
  console.log(`${'='.repeat(60)}\n`);

  const args = [
    'autocannon',
    '-c', test.connections.toString(),
    '-d', test.duration.toString(),
  ];

  if (test.method) {
    args.push('-m', test.method);
  }

  args.push(test.url);

  return new Promise((resolve, reject) => {
    const proc = spawn('npx', args, { stdio: 'inherit' });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Test failed with code ${code}`));
      }
    });
  });
}

async function main() {
  console.log('Rate Limiting Load Tests');
  console.log('========================\n');
  console.log('Make sure the server is running: npm start\n');

  for (const test of tests) {
    try {
      await runTest(test);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait between tests
    } catch (error) {
      console.error(`Test "${test.name}" failed:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('All tests complete!');
  console.log('='.repeat(60));
  console.log('\nKey metrics to observe:');
  console.log('  - Requests/sec should drop when rate limited');
  console.log('  - 429 responses indicate rate limiting is working');
  console.log('  - Latency should remain consistent');
  console.log('  - No errors (500) should occur\n');
}

main().catch(console.error);
