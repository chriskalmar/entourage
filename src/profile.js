import fs from 'fs';
import path from 'path';
import { renderFile } from './render';
import { parseYaml } from './yaml';
import { renderTemplate } from './template';

export const runProfile = (profile, params) => {
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
    __PROFILE: profile,
  };

  const renderedProfile = renderFile(profileFilename, templateParams);

  const profileYaml = parseYaml(renderedProfile);

  if (profileYaml.render_templates) {
    profileYaml.render_templates.map(template => {
      const renderedTemplate = renderTemplate(template, templateParams);
    });
  }

  return {};
};
