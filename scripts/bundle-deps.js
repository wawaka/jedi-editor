/**
 * Pre-bundle dependencies as ESM for browser use
 */
import { build } from 'esbuild';
import { mkdirSync } from 'fs';

const outdir = 'vendor';

// Ensure output directory exists
mkdirSync(outdir, { recursive: true });

// Bundle lit and its dependencies
await build({
  entryPoints: ['lit'],
  bundle: true,
  format: 'esm',
  outfile: `${outdir}/lit.js`,
  platform: 'browser',
});

// Bundle ajv
await build({
  entryPoints: ['ajv'],
  bundle: true,
  format: 'esm',
  outfile: `${outdir}/ajv.js`,
  platform: 'browser',
});

// Bundle ajv-formats (include ajv since it's tightly coupled)
await build({
  entryPoints: ['ajv-formats'],
  bundle: true,
  format: 'esm',
  outfile: `${outdir}/ajv-formats.js`,
  platform: 'browser',
});

console.log('Dependencies bundled to vendor/');
