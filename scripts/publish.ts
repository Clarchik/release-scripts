import { publish } from '../src/publish.ts';

publish({
  defaultPackage: 'release-scripts',
  getPkgDir: () => '.',
  provenance: true,
  packageManager: 'pnpm'
});
