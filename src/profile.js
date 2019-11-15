import fs from 'fs';
import path from 'path';
import { renderFile } from './render';
import { parseYaml } from './yaml';
import { renderTemplateToFile } from './template';
import { createWorkVersionFolder, lockWorkVersionFolder } from './util';

export const runProfile = (profile, params, version) => {
  let profileFilename;

  ['yaml', 'yml'].map(ext => {
    const filename = `${path.basename(
      process.env.PROFILES_PATH,
    )}/${profile}.${ext}`;

    if (fs.existsSync(filename)) {
      profileFilename = filename;
    }
  });

  if (!profileFilename) {
    throw new Error(`Profile '${profile}' not found`);
  }

  const templateParams = {
    ...params,
    __VERSION: version,
    __PROFILE: profile,
  };

  const renderedProfile = renderFile(profileFilename, templateParams);
  const profileYaml = parseYaml(renderedProfile);

  createWorkVersionFolder(version);

  const { renderTemplates } = profileYaml;

  if (renderTemplates) {
    if (renderTemplates.files) {
      renderTemplates.files.map(template => {
        const templateFilename = renderTemplates.sourcePath
          ? `${renderTemplates.sourcePath}/${template}`
          : template;

        const outputFilename = renderTemplates.targetPath
          ? `${renderTemplates.targetPath}/${template}`
          : template;

        const renderedTemplate = renderTemplateToFile(
          templateFilename,
          templateParams,
          version,
          outputFilename,
        );
      });
    }
  }

  lockWorkVersionFolder(version);

  return {};
};
