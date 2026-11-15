import fs from 'node:fs';
import { ConventionalChangelog, type Preset } from 'conventional-changelog';
import createPreset from 'conventional-changelog-conventionalcommits';
import { DEFAULT_COMMIT_TYPES } from 'conventional-changelog-conventionalcommits';
import type { generateChangelog as def } from './types.d.ts';

export const generateChangelog: typeof def = async ({
  getPkgDir,
  tagPrefix
}) => {
  const preset: Preset = await createPreset({
    types: DEFAULT_COMMIT_TYPES.map((t: any) => ({ ...t, hidden: false }))
  });
  preset.writer ??= {};
  preset.writer.headerPartial = (context) => {
    const repoUrl = context.repository
      ? [context.host, context.owner, context.repository]
          .filter(Boolean)
          .join('/')
      : context.repoUrl;
    const version = context.version ?? '';
    const versionText =
      context.linkCompare && repoUrl
        ? `[${version}](${repoUrl}/compare/${context.previousTag}...${context.currentTag})`
        : version;
    const title = context.title ? ` "${context.title}"` : '';
    const date = context.date ? ` (${context.date})` : '';
    const heading = `${versionText}${title}${date}`;

    return context.isPatch ? `## <small> ${heading} </small>` : `## ${heading}`;
  };

  const pkgDir = getPkgDir();

  const generator = new ConventionalChangelog()
    .readPackage(`${pkgDir}/package.json`)
    .config(preset)
    .options({ releaseCount: 1 })
    .commits({ path: pkgDir });
  if (tagPrefix) {
    generator.tags({ prefix: tagPrefix });
  }

  const originalChangelog = fs.readFileSync(`${pkgDir}/CHANGELOG.md`, 'utf-8');

  const writeStream = fs.createWriteStream(`${pkgDir}/CHANGELOG.md`);
  for await (const chunk of generator.write()) {
    writeStream.write(chunk);
  }
  writeStream.write(originalChangelog);
};
