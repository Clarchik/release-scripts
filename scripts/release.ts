import { release } from '../src/release.ts';
import colors from 'picocolors';
import { logRecentCommits } from '../src/utils.ts';
import { generateChangelog } from '../src/changelog.ts';

release({
  repo: 'release-scripts',
  owner: 'clarchik',
  packages: ['release-scripts'],
  toTag: (_, version) => `v${version}`,
  logChangelog: () => logRecentCommits(() => '.'),
  generateChangelog: async () => {
    console.log(colors.cyan('\nGenerating changelog...'));
    await generateChangelog({ getPkgDir: () => '.', tagPrefix: 'v' });
  },
  getPkgDir: () => '.'
});
