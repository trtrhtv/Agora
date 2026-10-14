// Phase 0 acceptance: the build must fail on every invalid fixture in tests/invalid/.
// Each fixture is copied into content/<collection>/, built, and removed again.
import { spawnSync } from 'node:child_process';
import { copyFileSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const FIXTURES = 'tests/invalid';
let failed = 0;

for (const file of readdirSync(FIXTURES).filter((f) => f.endsWith('.md'))) {
  const text = readFileSync(join(FIXTURES, file), 'utf8');
  const collection = text.match(/^# collection: (\S+)/m)?.[1];
  const expect = text.match(/^# expect: (.+)$/m)?.[1].trim();
  if (!collection || !expect) throw new Error(`${file}: needs "# collection:" and "# expect:" comment lines`);

  const target = join('content', collection, file);
  copyFileSync(join(FIXTURES, file), target);
  try {
    const r = spawnSync('npx', ['astro', 'build'], { encoding: 'utf8' });
    const out = r.stdout + r.stderr;
    if (r.status === 0) {
      failed++;
      console.log(`✗ ${file}: build passed but should have failed`);
    } else if (!out.includes(expect)) {
      failed++;
      console.log(`✗ ${file}: build failed, but output lacks "${expect}"\n${out.slice(-1500)}`);
    } else {
      console.log(`✓ ${file}: build failed as expected`);
    }
  } finally {
    rmSync(target);
  }
}

if (failed) {
  console.log(`\n${failed} fixture(s) did not fail the build correctly`);
  process.exit(1);
}
console.log('\nAll invalid fixtures fail the build.');
