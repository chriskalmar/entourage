import fs from 'fs';
import path from 'path';
import { renderFile } from './render';
import { parseYaml } from './yaml';
import { renderTemplateToFile } from './template';
import {
  createOrResetWorkVersionFolder,
  lockWorkVersionFolder,
  printTask,
  log,
} from './util';
import { executeScript } from './script';

export const runProfile = async (profile, params, version) => {
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

  createOrResetWorkVersionFolder(version);

  const { renderTemplates, beforeScript, script } = profileYaml;

  if (renderTemplates) {
    printTask('Rendering templates');

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

        log(`✔ ${template}`);
      });
    }
  }

  if (beforeScript) {
    printTask(`Executing 'beforeScript'`);

    for (const command of beforeScript) {
      log(`\n${command}\n`);
      await executeScript(version, command, templateParams);
    }
  }

  return {};
};
