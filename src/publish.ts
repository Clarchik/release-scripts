import semver from 'semver';
import {
  args,
  getActiveReleasedVersion,
  getPackageInfo,
  publishPackage,
  step
} from './utils.ts';
import type { publish as def } from './types.d.ts';

export const publish: typeof def = async ({
  defaultPackage,
  getPkgDir,
  provenance,
  packageManager
}) => {
  const tag = args._[0];
  if (!tag) throw new Error('No tag specified');

  let releasedPkgName = defaultPackage;
  let releasedVersion;

  if (tag.includes('@')) [releasedPkgName, releasedVersion] = tag.split('@');
  else releasedVersion = tag;

  if (releasedVersion.startsWith('v'))
    releasedVersion = releasedVersion.slice(1);

  const { pkg, pkgDir } = getPackageInfo(releasedPkgName, getPkgDir);
  if (pkg.version !== releasedVersion)
    throw new Error(
      `Package version from tag "${releasedVersion}" mismatches with current version "${pkg.version}"`
    );

  const activeVersion = await getActiveReleasedVersion(pkg.name);

  step('Publishing package...');
  const releaseTag = releasedVersion.includes('beta')
    ? 'beta'
    : releasedVersion.includes('alpha')
      ? 'alpha'
      : activeVersion && semver.lt(pkg.version, activeVersion)
        ? 'previous'
        : undefined;
  await publishPackage(pkgDir, releaseTag, provenance, packageManager);
};
